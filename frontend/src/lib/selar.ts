import { curatedBooks, SELAR_STORE_URL, type BookItem } from "../assets/books";

export type { BookItem };
export { SELAR_STORE_URL };

export async function fetchStoreBooks(): Promise<BookItem[]> {
  const res = await fetch("/api/selar/products");
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Failed to load books (${res.status})`);
  }
  return res.json() as Promise<BookItem[]>;
}

export async function fetchStoreBooksWithFallback(): Promise<{
  books: BookItem[];
  fromFallback: boolean;
}> {
  try {
    const books = await fetchStoreBooks();
    return { books, fromFallback: false };
  } catch {
    return { books: curatedBooks, fromFallback: true };
  }
}
