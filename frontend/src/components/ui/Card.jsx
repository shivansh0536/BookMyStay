import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export function Card({ className, children, hover = false, ...props }) {
    return (
        <motion.div
            whileHover={hover ? { y: -4, boxShadow: "0 10px 30px -4px rgba(0, 0, 0, 0.1)" } : {}}
            transition={{ duration: 0.2 }}
            className={twMerge(
                "bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
