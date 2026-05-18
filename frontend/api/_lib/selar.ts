import { curatedBooks, type BookItem } from "../../src/assets/books.js";

export const DEFAULT_SELAR_STORE_URL = "https://selar.com/m/wole-emmanuel1";

type SelarEnv = {
  SELAR_STORE_URL?: string;
};

type RawSelarProduct = {
  code: string;
  url: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  default_image_url?: string;
  images?: string[];
  is_physical_product?: boolean;
  is_digital_product?: boolean;
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 20_000;
const CACHE_MS = 30 * 60 * 1000;

let productCache: { at: number; products: BookItem[] } | null = null;

function parseDataPage(html: string): { component?: string; props?: Record<string, unknown> } | null {
  const match = html.match(/data-page="([^"]+)"/);
  if (!match) return null;

  const decoded = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'");

  return JSON.parse(decoded) as { component?: string; props?: Record<string, unknown> };
}

export function stripHtml(html: string): string {
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatBookPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function mapProduct(raw: RawSelarProduct): BookItem {
  const description = stripHtml(raw.description ?? "");
  return {
    id: raw.code,
    name: raw.name,
    description,
    excerpt: description.length > 140 ? `${description.slice(0, 137)}…` : description,
    price: raw.price,
    currency: raw.currency,
    priceLabel: formatBookPrice(raw.price, raw.currency),
    imageUrl: raw.default_image_url ?? raw.images?.[0] ?? "",
    url: raw.url.startsWith("http") ? raw.url : `https://selar.com/${raw.code}`,
    isPhysical: Boolean(raw.is_physical_product),
    isDigital: Boolean(raw.is_digital_product),
  };
}

function parseStoreProducts(html: string): BookItem[] {
  const page = parseDataPage(html);
  if (!page?.props) {
    throw new Error("Selar store page missing data");
  }

  const products = page.props.products;
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("No products found on Selar store");
  }

  return products.map((item) => mapProduct(item as RawSelarProduct));
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function getStoreProducts(env: SelarEnv): Promise<BookItem[]> {
  const now = Date.now();
  if (productCache && now - productCache.at < CACHE_MS) {
    return productCache.products;
  }

  const storeUrl = env.SELAR_STORE_URL?.trim() || DEFAULT_SELAR_STORE_URL;

  try {
    const res = await fetchWithTimeout(storeUrl);
    if (!res.ok) {
      throw new Error(`Selar store responded with ${res.status}`);
    }

    const html = await res.text();
    const products = parseStoreProducts(html);
    productCache = { at: now, products };
    return products;
  } catch (err) {
    if (productCache) {
      return productCache.products;
    }
    console.warn("[selar] fetch failed, using curated fallback:", err);
    return curatedBooks;
  }
}
