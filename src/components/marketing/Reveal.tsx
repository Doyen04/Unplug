'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';
import type { ReactNode } from 'react';

type RevealVariant = 'fade' | 'slide-up' | 'scale' | 'blur';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    as?: 'section' | 'div';
    id?: string;
    variant?: RevealVariant;
    /** When true, staggers children with 0.08s delay between each */
    stagger?: boolean;
}

const variants: Record<RevealVariant, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
    fade: {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
    },
    'slide-up': {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.97 },
        animate: { opacity: 1, scale: 1 },
    },
    blur: {
        initial: { opacity: 0, filter: 'blur(6px)' },
        animate: { opacity: 1, filter: 'blur(0px)' },
    },
};

export function Reveal({
    children,
    className,
    delay = 0,
    as = 'section',
    id,
    variant = 'fade',
    stagger = false,
}: RevealProps) {
    const prefersReducedMotion = useReducedMotion();
    const Component = as === 'section' ? motion.section : motion.div;
    const v = variants[variant];

    if (stagger) {
        return (
            <Component
                id={id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.08, delayChildren: delay }}
                className={className}
            >
                {children}
            </Component>
        );
    }

    return (
        <Component
            id={id}
            initial={prefersReducedMotion ? false : v.initial}
            whileInView={prefersReducedMotion ? undefined : v.animate}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut', delay }}
            className={className}
        >
            {children}
        </Component>
    );
}

/** Use as a child of a staggered Reveal to auto-animate each item. */
export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            variants={{
                hidden: prefersReducedMotion ? {} : { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
