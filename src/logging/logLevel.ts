/**
 * This module provides an enumeration for different log levels.
 * @module
 */

/**
 * LogLevel represents the different log levels available in the application.
 */
export enum LogLevel {
  /**
   * Debug level. Used for debugging messages.
   */
  Debug = "D",
  /**
   * Warn level. Used for warning messages.
   */
  Warn = "W",
  /**
   * Info level. Used for informational messages.
   */
  Info = "I",
  /**
   * Error level. Used for error messages.
   */
  Error = "E",
  /**
   * Critical level. Used for critical error messages.
   */
  Critical = "C",
}
