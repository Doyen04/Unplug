'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    as?: 'section' | 'div';
}

export function Reveal({ children, className, delay = 0, as = 'section' }: RevealProps) {
    const prefersReducedMotion = useReducedMotion();
    const Component = as === 'section' ? motion.section : motion.div;

    return (
        <Component
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut', delay }}
            className={className}
        >
            {children}
        </Component>
    );
}
