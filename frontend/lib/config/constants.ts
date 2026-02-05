/**
 * Application-wide configuration constants
 */

export const APP_CONFIG = {
  /** Toast notification duration in milliseconds */
  TOAST_DURATION: 4000,

  /** Business hours for availability */
  BUSINESS_HOURS: {
    START: 8, // 8 AM
    END: 20,  // 8 PM
  },

  /** Appointment durations in minutes */
  APPOINTMENT_DURATIONS: {
    SHORT: 60,
    LONG: 120,
  },

  /** Days to show in availability calendar */
  AVAILABILITY_DAYS_AHEAD: 30,

  /** Chat polling intervals */
  CHAT: {
    UNREAD_COUNT_REFRESH_INTERVAL: 30000, // 30 seconds
    TYPING_TIMEOUT: 2000, // 2 seconds
  },
} as const;
