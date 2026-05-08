"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  icon,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={`w-full flex items-center gap-2 px-3 py-2 bg-white border rounded-xl text-sm font-medium transition-all cursor-pointer ${
          isOpen
            ? "border-[#0A0A0A] ring-1 ring-[#0A0A0A]"
            : "border-[#C8C4BC] hover:border-[#8A8680]"
        } text-[#4A4845]`}
      >
        {icon && <span className="text-[#8A8680] shrink-0">{icon}</span>}
        <span className="flex-1 text-left truncate">
          {selected ? selected.label : <span className="text-[#8A8680]">{placeholder}</span>}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#8A8680] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[160px] right-0 bg-white border border-[#C8C4BC] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-left transition-colors ${
                  isSelected
                    ? "bg-[#0A0A0A] text-[#F2F0EB]"
                    : "text-[#4A4845] hover:bg-[#F2F0EB]"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                {isSelected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
