import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
    return (
        <div
            className={`
                bg-white rounded-xl shadow-sm border border-slate-200 
                overflow-hidden transition-all duration-200
                ${hover ? 'hover:-translate-y-1 hover:shadow-md' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`p-6 border-b border-slate-100 ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = '' }) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}
