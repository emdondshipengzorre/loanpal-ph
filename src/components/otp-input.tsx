"use client";

import { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  length?: number;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  length = 6,
}: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, "").slice(0, length).split("");

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function handleChange(index: number, char: string) {
    if (!/^\d?$/.test(char)) return;

    const next = [...digits];
    next[index] = char;
    const newValue = next.join("").replace(/\s/g, "");
    onChange(newValue);

    if (char && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (char && newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, length - 1);
      inputs.current[focusIndex]?.focus();
      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
    }
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="h-12 w-10 rounded-lg border bg-background text-center text-lg font-semibold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
