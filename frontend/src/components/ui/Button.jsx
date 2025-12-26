import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
    const variants = {
        primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg',
        secondary: 'bg-rose-500 text-white hover:bg-rose-600 shadow-md hover:shadow-lg', // Rose
        outline: 'border-2 border-slate-200 text-slate-700 hover:border-teal-600 hover:text-teal-600 bg-white shadow-sm hover:shadow-md',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    };

    const sizes = {
        sm: 'px-4 py-1.5 text-sm',
        md: 'px-6 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={twMerge(
                'rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}
