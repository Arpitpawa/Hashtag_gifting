"use client";

import { Package, Gift, CreditCard, Sparkles, Check } from "lucide-react";

const STEPS = [
  { n: 1, label: "Choose Box",    icon: Package    },
  { n: 2, label: "Add Products",  icon: Gift       },
  { n: 3, label: "Select a Card", icon: CreditCard },
  { n: 4, label: "Personalize",   icon: Sparkles   },
] as const;

export default function HamperStepIndicator({ current }: { current: number }) {
  return (
    <div className="w-full max-w-xl mx-auto select-none">
      <div className="relative flex items-center justify-between">
        {/* Base track */}
        <div className="absolute top-5 left-0 right-0 h-px bg-gray-200 -z-10" />
        {/* Progress track */}
        <div
          className="absolute top-5 left-0 h-px bg-[#c0555a] transition-all duration-500 -z-10"
          style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map(({ n, label, icon: Icon }) => {
          const done   = n < current;
          const active = n === current;
          return (
            <div key={n} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done   ? "bg-[#c0555a] border-[#c0555a]" :
                  active ? "bg-white border-[#c0555a]" :
                           "bg-white border-gray-200"
                }`}
              >
                {done
                  ? <Check size={14} className="text-white" strokeWidth={2.5} />
                  : <Icon size={15} className={active ? "text-[#c0555a]" : "text-gray-300"} />
                }
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${
                active ? "text-[#c0555a]" : done ? "text-[#1a1a1a]" : "text-gray-400"
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}