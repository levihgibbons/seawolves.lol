"use client";

import { useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";
import { cx } from "./ui";

export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cx(
          "w-full rounded-2xl border border-navy-100 bg-white px-4 py-2.5 pr-11 text-sm text-navy-900 transition duration-200 placeholder:text-navy-300 hover:border-navy-200 focus:border-surf-400 focus:ring-4 focus:ring-surf-400/15",
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-navy-300 transition-colors duration-150 hover:text-navy-600"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
