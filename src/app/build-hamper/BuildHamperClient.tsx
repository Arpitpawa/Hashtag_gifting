"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShoppingBag, CheckCircle, AlertCircle } from "lucide-react";
import { useHamperStore } from "@/lib/store/hamperStore";
import { useCartStore }   from "@/lib/store/cartStore";
import HamperStepIndicator from "@/components/hamper/HamperStepIndicator";
import HamperSidebar       from "@/components/hamper/HamperSidebar";
import Step1ChooseBox      from "@/components/hamper/Step1ChooseBox";
import Step2AddProducts    from "@/components/hamper/Step2AddProducts";
import Step3SelectCard     from "@/components/hamper/Step3SelectCard";
import Step4Personalize    from "@/components/hamper/Step4Personalize";

export default function BuildHamperClient() {
  const router = useRouter();

  const {
    step, setStep,
    selectedBox, selectedProducts, selectedCard,
    personalizationMsg, recipientName,
    totalPrice, reset,
  } = useHamperStore();

  const { addToCart, isLoading } = useCartStore();

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg,   setErrorMsg]   = useState("");

  const canProceed =
    step === 1 ? !!selectedBox :
    step === 2 ? true :
    step === 3 ? true :
    step === 4 ? !!selectedBox : false;

  const handleNext = () => { if (step < 4) setStep((step + 1) as 1|2|3|4); };
  const handleBack = () => { if (step > 1) setStep((step - 1) as 1|2|3|4); };

  const handleAddToCart = async () => {
    if (!selectedBox) return;
    setErrorMsg("");
    setSuccessMsg("");

    const hamperRef = `hamper-${Date.now()}`;

    // Placeholder boxes (negative ids, shown only while no real box products
    // exist in the catalogue) can't be added to the cart — skip them.
    const items = [
      ...(selectedBox.productId > 0 ? [{ productId: selectedBox.productId, role: "box" }] : []),
      ...selectedProducts.map((p) => ({ productId: p.productId, role: "product" })),
    ];
    if (items.length === 0) { setErrorMsg("Please add at least one product to your hamper."); return; }

    try {
      for (const item of items) {
        await addToCart(item.productId, 1, {
          hamperRef,
          role:      item.role,
          card:      selectedCard?.name  ?? undefined,
          message:   personalizationMsg  || undefined,
          recipient: recipientName       || undefined,
        });
      }
      setSuccessMsg("Hamper added to cart!");
      reset();
      setTimeout(() => router.push("/cart"), 1000);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  const total = totalPrice();

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="text-center mb-7">
            <h1
              className="text-[36px] md:text-[52px] text-[#1a1a1a] font-normal leading-[1.1]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em" }}
            >
              Build Your Hamper
            </h1>
            <p className="text-[14px] text-gray-500 mt-2">
              Curate a personalised gift box — your way
            </p>
          </div>
          <HamperStepIndicator current={step} />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* Step panel */}
          <div className="flex-1 min-w-0">

            {/* Success / Error banners */}
            {successMsg && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-[13px] rounded-xl px-4 py-3 mb-4">
                <CheckCircle size={15} /> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-xl px-4 py-3 mb-4">
                <AlertCircle size={15} /> {errorMsg}
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {step === 1 && <Step1ChooseBox />}
              {step === 2 && <Step2AddProducts />}
              {step === 3 && <Step3SelectCard />}
              {step === 4 && <Step4Personalize />}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  step === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#1a1a1a] border border-gray-200 hover:bg-white"
                }`}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <span className="text-[12px] text-gray-400">Step {step} of 4</span>

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    canProceed
                      ? "bg-[#1a1a1a] text-white hover:bg-[#333]"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                 aria-label="Next">
                  {step === 1 ? "Next: Add Products" :
                   step === 2 ? "Next: Choose Card"  :
                                "Next: Personalize"}
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading || !selectedBox}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-medium bg-[#c0555a] hover:bg-[#a8474c] text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                 aria-label="Open cart">
                  <ShoppingBag size={15} />
                  {isLoading ? "Adding…" : "Add Hamper to Cart"}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar — desktop only */}
          <div className="hidden lg:block w-[260px] flex-shrink-0">
            <HamperSidebar step={step} />
          </div>

        </div>
      </div>

      {/* ── Mobile sticky bar ── */}
      {total > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 z-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-500">
                {selectedProducts.length} item{selectedProducts.length !== 1 ? "s" : ""}
              </p>
              <p className="text-[16px] font-semibold text-[#1a1a1a]">
                Rs. {(total / 100).toLocaleString("en-IN")}
              </p>
            </div>
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium ${
                  canProceed
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#c0555a] text-white disabled:opacity-60"
              >
                <ShoppingBag size={14} /> Add to Cart
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}