/**
 * Pagination configuration constants
 */

export const PAGINATION = {
    /** Default items per page */
    DEFAULT_PAGE_SIZE: 4,

    /** Minimum pagination value */
    MIN_PAGE: 1,

    /** Maximum items that can be returned per request */
    MAX_PAGE_SIZE: 100,

    /** Clamp page size between min and max values */
    clampPageSize: (size: number): number => {
        return Math.min(PAGINATION.MAX_PAGE_SIZE, Math.max(1, size));
    },
} as const;
