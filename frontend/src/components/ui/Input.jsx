import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Input({ label, error, className, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <input
                className={twMerge(
                    'px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300',
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
