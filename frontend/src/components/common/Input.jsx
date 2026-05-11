// src/components/common/Input.jsx
// ----------------------------------------------------------------------------
// Form input with label, optional error/helper text, and prefix/suffix slots.
// Works for type="text", "email", "number", "password", etc.
// ----------------------------------------------------------------------------

import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helper,
    prefix,
    suffix,
    required = false,
    className = '',
    id,
    ...rest
  },
  ref
) {
  const inputId = id || rest.name || `input-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 outline-none transition disabled:bg-slate-50 disabled:text-slate-500 ${
            prefix ? 'pl-9' : 'pl-3'
          } ${suffix ? 'pr-9' : 'pr-3'} py-2 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
          }`}
          aria-invalid={!!error}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helper ? (
        <p className="mt-1 text-xs text-slate-500">{helper}</p>
      ) : null}
    </div>
  );
});

export default Input;
