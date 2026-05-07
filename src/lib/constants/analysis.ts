/**
 * Analysis and calculation thresholds for subscription behavior
 */

export const ANALYSIS_THRESHOLDS = {
    /** Maximum days between transactions to consider subscription "weekly" */
    WEEKLY_MAX_DAYS: 10,

    /** Days threshold between transactions to consider subscription "monthly" */
    MONTHLY_MIN_DAYS: 20,
    MONTHLY_MAX_DAYS: 35,

    /** Minimum days between transactions to consider subscription "yearly" */
    YEARLY_MIN_DAYS: 300,

    /** Median gap calculation for low confidence assignments */
    LOW_CONFIDENCE_MEDIAN_GAP: 300,

    /** Percentage threshold for considering transaction an outlier (beyond 2x IQR) */
    OUTLIER_THRESHOLD: 2,
} as const;

/**
 * Usage scoring configuration for subscription analysis
 */
export const USAGE_SCORING = {
    /** Days of no activity to mark subscription as unused */
    UNUSED_THRESHOLD_DAYS: 60,

    /** Days to observe before marking subscription as actively used */
    ACTIVE_USAGE_DAYS: 30,

    /** Days of declining activity to flag as "at risk" */
    AT_RISK_THRESHOLD_DAYS: 90,
} as const;
