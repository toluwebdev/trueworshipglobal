import { API_BASE } from "./env";

export type DonationInitResponse = {
  access_code: string;
  reference: string;
  authorization_url: string;
};

export type DonationVerifyResponse = {
  ok: boolean;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  donor_name: string;
};

declare global {
  interface Window {
    PaystackPop?: new () => {
      resumeTransaction: (accessCode: string) => void;
    };
  }
}

const PAYSTACK_SCRIPT = "https://js.paystack.co/v1/inline.js";

export function getPaystackPublicKey(): string | undefined {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  return typeof key === "string" && key.length > 0 ? key : undefined;
}

export function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();

  const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Paystack")),
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
}

async function donationRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed (${res.status})`,
    );
  }
  return data as T;
}

export async function initializeDonation(input: {
  email: string;
  amount: number;
  name?: string;
}): Promise<DonationInitResponse> {
  return donationRequest<DonationInitResponse>("/api/donations/initialize", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyDonation(
  reference: string,
): Promise<DonationVerifyResponse> {
  return donationRequest<DonationVerifyResponse>(
    `/api/donations/verify/${encodeURIComponent(reference)}`,
  );
}

export async function openPaystackCheckout(accessCode: string): Promise<void> {
  await loadPaystackScript();

  if (!window.PaystackPop) {
    throw new Error("Paystack could not be loaded.");
  }

  const popup = new window.PaystackPop();
  popup.resumeTransaction(accessCode);
}

export async function startDonation(input: {
  email: string;
  amount: number;
  name?: string;
}): Promise<DonationInitResponse> {
  const init = await initializeDonation(input);
  await openPaystackCheckout(init.access_code);
  return init;
}
