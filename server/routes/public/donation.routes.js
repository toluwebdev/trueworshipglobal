import crypto from "node:crypto";
import express from "express";

const router = express.Router();

const PAYSTACK_BASE = "https://api.paystack.co";
const MIN_NAIRA = 100;
const MAX_NAIRA = 5_000_000;

function getCallbackUrl(reference) {
  const base = (
    process.env.PAYSTACK_CALLBACK_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");
  return `${base}/donate?reference=${encodeURIComponent(reference)}`;
}

router.post("/initialize", async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return res.status(503).json({
      error: "Donations are not configured yet. Please try again later.",
    });
  }

  const email = String(req.body?.email ?? "")
    .trim()
    .toLowerCase();
  const name = String(req.body?.name ?? "").trim();
  const amountNaira = Number(req.body?.amount);
  const currency = String(req.body?.currency ?? "NGN").toUpperCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  if (!Number.isFinite(amountNaira) || amountNaira < MIN_NAIRA || amountNaira > MAX_NAIRA) {
    return res.status(400).json({
      error: `Amount must be between ₦${MIN_NAIRA.toLocaleString()} and ₦${MAX_NAIRA.toLocaleString()}.`,
    });
  }

  const amountKobo = Math.round(amountNaira * 100);
  const reference = `twg_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  try {
    const paystackRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        currency,
        reference,
        callback_url: getCallbackUrl(reference),
        metadata: {
          donor_name: name,
          type: "donation",
        },
      }),
    });

    const payload = await paystackRes.json();

    if (!payload.status || !payload.data?.access_code) {
      return res.status(400).json({
        error: payload.message || "Could not start payment. Please try again.",
      });
    }

    return res.json({
      access_code: payload.data.access_code,
      reference: payload.data.reference,
      authorization_url: payload.data.authorization_url,
    });
  } catch (err) {
    console.error("Paystack initialize error:", err);
    return res.status(500).json({ error: "Payment service unavailable. Please try again." });
  }
});

router.get("/verify/:reference", async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return res.status(503).json({ error: "Donations are not configured yet." });
  }

  const reference = String(req.params.reference ?? "").trim();
  if (!reference) {
    return res.status(400).json({ error: "Payment reference is required." });
  }

  try {
    const paystackRes = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
      },
    );

    const payload = await paystackRes.json();

    if (!payload.status) {
      return res.status(400).json({
        error: payload.message || "Could not verify payment.",
      });
    }

    const tx = payload.data;
    return res.json({
      ok: tx.status === "success",
      status: tx.status,
      reference: tx.reference,
      amount: tx.amount / 100,
      currency: tx.currency,
      paid_at: tx.paid_at,
      donor_name: tx.metadata?.donor_name ?? "",
    });
  } catch (err) {
    console.error("Paystack verify error:", err);
    return res.status(500).json({ error: "Could not verify payment." });
  }
});

export default router;
