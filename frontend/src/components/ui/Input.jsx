import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(({ className, error, ...props }, ref) => {
    return (
        <div className="w-full">
            <input
                ref={ref}
                className={twMerge(
                    "w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm hover:shadow-md",
                    error && "border-rose-500 focus:ring-rose-200",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-rose-500 text-center">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
