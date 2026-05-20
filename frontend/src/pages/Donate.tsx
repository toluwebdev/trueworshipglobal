import { motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { bankTransferDetails } from "../assets/donate";
import {
  getPaystackPublicKey,
  startDonation,
  verifyDonation,
  type DonationVerifyResponse,
} from "../lib/paystack";

const PRESET_AMOUNTS = [1_000, 5_000, 10_000, 25_000, 50_000] as const;

type PaymentMethod = "paystack" | "bank";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Donate = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const referenceParam = searchParams.get("reference");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<number>(PRESET_AMOUNTS[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(referenceParam));
  const [paymentResult, setPaymentResult] = useState<DonationVerifyResponse | null>(
    null,
  );

  const paystackReady = Boolean(getPaystackPublicKey());

  useEffect(() => {
    if (!referenceParam) return;

    let cancelled = false;
    setVerifying(true);
    setError(null);

    verifyDonation(referenceParam)
      .then((result) => {
        if (cancelled) return;
        setPaymentResult(result);
        if (!result.ok) {
          setError("Payment was not completed. You can try again below.");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Could not verify your payment.",
        );
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });

    return () => {
      cancelled = true;
    };
  }, [referenceParam]);

  const onSelectPreset = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const onCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const getFinalAmount = () => {
    const finalAmount = customAmount
      ? Number(customAmount.replace(/,/g, ""))
      : amount;
    return finalAmount;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (paymentMethod === "bank") return;

    if (!paystackReady) {
      setError("Paystack is not configured yet. Please use bank transfer below.");
      return;
    }

    const finalAmount = getFinalAmount();

    if (!Number.isFinite(finalAmount) || finalAmount < 100) {
      setError("Minimum donation is ₦100.");
      return;
    }

    setSubmitting(true);
    try {
      const init = await startDonation({
        email: email.trim(),
        name: name.trim() || undefined,
        amount: finalAmount,
      });
      setSearchParams({ reference: init.reference }, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(bankTransferDetails.accountNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const clearResult = () => {
    setPaymentResult(null);
    setSearchParams({}, { replace: true });
    setError(null);
  };

  const displayAmount = getFinalAmount();
  const amountLabel =
    Number.isFinite(displayAmount) && displayAmount >= 100
      ? `₦${displayAmount.toLocaleString()}`
      : null;

  return (
    <motion.div
      className="min-h-screen bg-background px-6 pb-24 pt-28 text-white md:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mx-auto max-w-xl">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-4 text-center font-primary text-sm tracking-[0.35em] uppercase md:text-base"
        >
          Give
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10 text-center font-lato text-base leading-relaxed text-white/80 md:text-lg"
        >
          Partner with True Worship Global to advance worship, teaching, and ministry
          across the nations. Every gift helps us reach more lives with the gospel.
        </motion.p>

        {verifying && (
          <p className="mb-8 text-center font-lato text-sm text-white/60">
            Verifying your payment…
          </p>
        )}

        {paymentResult?.ok && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 rounded-sm border border-gold/50 bg-gold/10 px-6 py-8 text-center"
          >
            <p className="font-primary text-sm tracking-[0.2em] text-gold uppercase">
              Thank you
            </p>
            <p className="mt-3 font-lato text-base text-white/90">
              Your donation of{" "}
              <strong>
                {paymentResult.currency === "NGN" ? "₦" : ""}
                {paymentResult.amount.toLocaleString()}
              </strong>{" "}
              was received successfully.
            </p>
            <p className="mt-2 font-lato text-xs text-white/50">
              Reference: {paymentResult.reference}
            </p>
            <button
              type="button"
              onClick={clearResult}
              className="mt-6 font-primary text-xs tracking-[0.2em] text-gold uppercase underline hover:text-gold-dark"
            >
              Give again
            </button>
          </motion.div>
        )}

        {!paymentResult?.ok && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-8 rounded-sm border border-white/10 bg-surface/40 px-6 py-10 md:px-10"
          >
            <div>
              <p className="mb-4 font-primary text-xs tracking-[0.25em] text-white/70 uppercase">
                How would you like to give?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paystack")}
                  className={`border px-3 py-3 font-primary text-xs tracking-wider uppercase transition ${
                    paymentMethod === "paystack"
                      ? "border-gold bg-gold text-black"
                      : "border-gold/50 text-gold hover:border-gold hover:bg-gold/10"
                  }`}
                >
                  Paystack
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`border px-3 py-3 font-primary text-xs tracking-wider uppercase transition ${
                    paymentMethod === "bank"
                      ? "border-gold bg-gold text-black"
                      : "border-gold/50 text-gold hover:border-gold hover:bg-gold/10"
                  }`}
                >
                  Bank transfer
                </button>
              </div>
            </div>

            <div>
              <p className="mb-4 font-primary text-xs tracking-[0.25em] text-white/70 uppercase">
                Select amount (NGN)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PRESET_AMOUNTS.map((preset) => {
                  const selected = !customAmount && amount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onSelectPreset(preset)}
                      className={`border px-3 py-3 font-primary text-xs tracking-wider uppercase transition ${
                        selected
                          ? "border-gold bg-gold text-black"
                          : "border-gold/50 text-gold hover:border-gold hover:bg-gold/10"
                      }`}
                    >
                      ₦{preset.toLocaleString()}
                    </button>
                  );
                })}
              </div>
              <label className="mt-4 block">
                <span className="mb-2 block font-primary text-xs tracking-[0.2em] text-white/60 uppercase">
                  Or enter custom amount
                </span>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={customAmount}
                  onChange={(e) => onCustomAmountChange(e.target.value)}
                  placeholder="e.g. 3000"
                  className="w-full border border-white/20 bg-background px-4 py-3 font-lato text-white outline-none focus:border-gold"
                />
              </label>
            </div>

            {paymentMethod === "bank" ? (
              <div className="space-y-5 border border-gold/30 bg-gold/5 px-5 py-6">
                <p className="font-primary text-xs tracking-[0.25em] text-gold uppercase">
                  Transfer to this account
                </p>
                <dl className="space-y-4 font-lato text-sm text-white/90">
                  <div>
                    <dt className="text-xs tracking-wide text-white/50 uppercase">
                      Account name
                    </dt>
                    <dd className="mt-1 text-base">{bankTransferDetails.accountName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-wide text-white/50 uppercase">
                      Bank
                    </dt>
                    <dd className="mt-1 text-base">{bankTransferDetails.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-wide text-white/50 uppercase">
                      Account number
                    </dt>
                    <dd className="mt-1 flex flex-wrap items-center gap-3">
                      <span className="font-primary text-lg tracking-[0.2em] text-gold">
                        {bankTransferDetails.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={copyAccountNumber}
                        className="border border-gold/60 px-3 py-1.5 font-primary text-[10px] tracking-[0.2em] text-gold uppercase transition hover:border-gold hover:bg-gold/10"
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </dd>
                  </div>
                </dl>
                <p className="font-lato text-sm leading-relaxed text-white/70">
                  {amountLabel
                    ? `Please transfer ${amountLabel} to the account above.`
                    : "Please transfer your chosen amount to the account above."}{" "}
                  Use your full name as the payment narration so we can acknowledge your
                  gift. Thank you for partnering with us.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-8">
                <label className="block">
                  <span className="mb-2 block font-primary text-xs tracking-[0.2em] text-white/70 uppercase">
                    Full name (optional)
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full border border-white/20 bg-background px-4 py-3 font-lato text-white outline-none focus:border-gold"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block font-primary text-xs tracking-[0.2em] text-white/70 uppercase">
                    Email address
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full border border-white/20 bg-background px-4 py-3 font-lato text-white outline-none focus:border-gold"
                  />
                </label>

                {error && (
                  <p className="font-lato text-sm text-red-400" role="alert">
                    {error}
                  </p>
                )}

                {!paystackReady && !error && (
                  <p className="font-lato text-sm text-white/50">
                    Paystack is not connected yet. Please use bank transfer instead.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || verifying || !paystackReady}
                  className="w-full border border-gold bg-gold px-6 py-3.5 font-primary text-sm tracking-[0.25em] text-black uppercase transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Opening checkout…" : "Donate with Paystack"}
                </button>

                <p className="text-center font-lato text-xs leading-relaxed text-white/45">
                  Secure payment by Paystack. You can pay with card, bank transfer, or
                  USSD where available.
                </p>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Donate;
