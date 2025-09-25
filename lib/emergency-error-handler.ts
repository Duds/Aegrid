/**
 * Emergency API Error Handler
 *
 * Comprehensive error handling for emergency APIs with proper logging,
 * monitoring, and user-friendly error responses
 */

import { NextResponse } from 'next/server';

export interface EmergencyAPIError extends Error {
  code: string;
  statusCode: number;
  context?: Record<string, any>;
  timestamp: Date;
  organisationId?: string;
  userId?: string;
}

export class EmergencyError extends Error implements EmergencyAPIError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly organisationId?: string;
  public readonly userId?: string;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, any>,
    organisationId?: string,
    userId?: string
  ) {
    super(message);
    this.name = 'EmergencyError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();
    this.organisationId = organisationId;
    this.userId = userId;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EmergencyError);
    }
  }
}

// Predefined error types
export const EmergencyErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'EMERGENCY_UNAUTHORIZED',
  FORBIDDEN: 'EMERGENCY_FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'EMERGENCY_INSUFFICIENT_PERMISSIONS',

  // Data Validation
  INVALID_REQUEST: 'EMERGENCY_INVALID_REQUEST',
  MISSING_REQUIRED_FIELDS: 'EMERGENCY_MISSING_REQUIRED_FIELDS',
  INVALID_FORMAT: 'EMERGENCY_INVALID_FORMAT',
  INVALID_SEVERITY: 'EMERGENCY_INVALID_SEVERITY',
  INVALID_STATUS: 'EMERGENCY_INVALID_STATUS',

  // Resource Management
  RESOURCE_NOT_FOUND: 'EMERGENCY_RESOURCE_NOT_FOUND',
  RESOURCE_UNAVAILABLE: 'EMERGENCY_RESOURCE_UNAVAILABLE',
  RESOURCE_CONFLICT: 'EMERGENCY_RESOURCE_CONFLICT',

  // System Errors
  SIMULATION_UNAVAILABLE: 'EMERGENCY_SIMULATION_UNAVAILABLE',
  DATABASE_ERROR: 'EMERGENCY_DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EMERGENCY_EXTERNAL_API_ERROR',
  RATE_LIMIT_EXCEEDED: 'EMERGENCY_RATE_LIMIT_EXCEEDED',

  // Emergency Specific
  EMERGENCY_SCENARIO_NOT_FOUND: 'EMERGENCY_SCENARIO_NOT_FOUND',
  EMERGENCY_ALERT_NOT_FOUND: 'EMERGENCY_ALERT_NOT_FOUND',
  EMERGENCY_RESOURCE_BUSY: 'EMERGENCY_RESOURCE_BUSY',
  EMERGENCY_ESCALATION_FAILED: 'EMERGENCY_ESCALATION_FAILED',
} as const;

export type EmergencyErrorCode = typeof EmergencyErrorCodes[keyof typeof EmergencyErrorCodes];

// Error logging service
class EmergencyErrorLogger {
  private static instance: EmergencyErrorLogger;

  static getInstance(): EmergencyErrorLogger {
    if (!EmergencyErrorLogger.instance) {
      EmergencyErrorLogger.instance = new EmergencyErrorLogger();
    }
    return EmergencyErrorLogger.instance;
  }

  logError(error: EmergencyAPIError, additionalContext?: Record<string, any>): void {
    const logEntry = {
      timestamp: error.timestamp.toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
        context: error.context,
        organisationId: error.organisationId,
        userId: error.userId,
      },
      additionalContext,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || 'unknown',
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Emergency API Error:', logEntry);
    }

    // In production, you would send this to your logging service
    // e.g., Application Insights, CloudWatch, etc.
    this.sendToLoggingService(logEntry);
  }

  private sendToLoggingService(logEntry: any): void {
    // TODO: Implement actual logging service integration
    // For now, we'll just store in a local log file or send to monitoring service
    if (process.env.EMERGENCY_LOG_ENDPOINT) {
      fetch(process.env.EMERGENCY_LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      }).catch(err => {
        console.error('Failed to send error to logging service:', err);
      });
    }
  }
}

// Error response formatter
export function formatEmergencyErrorResponse(error: EmergencyAPIError): NextResponse {
  const logger = EmergencyErrorLogger.getInstance();
  logger.logError(error);

  // Determine if we should include sensitive information
  const includeDetails = process.env.NODE_ENV === 'development' ||
                        process.env.EMERGENCY_DEBUG_MODE === 'true';

  const responseBody: any = {
    error: {
      code: error.code,
      message: getPublicErrorMessage(error.code, error.message),
      timestamp: error.timestamp.toISOString(),
    },
  };

  if (includeDetails) {
    responseBody.error.details = {
      context: error.context,
      organisationId: error.organisationId,
      userId: error.userId,
    };
  }

  // Add helpful information for specific error types
  switch (error.code) {
    case EmergencyErrorCodes.MISSING_REQUIRED_FIELDS:
      responseBody.error.requiredFields = error.context?.requiredFields || [];
      break;
    case EmergencyErrorCodes.INVALID_FORMAT:
      responseBody.error.supportedFormats = error.context?.supportedFormats || [];
      break;
    case EmergencyErrorCodes.RESOURCE_NOT_FOUND:
      responseBody.error.resourceType = error.context?.resourceType;
      break;
    case EmergencyErrorCodes.RATE_LIMIT_EXCEEDED:
      responseBody.error.retryAfter = error.context?.retryAfter || 60;
      break;
  }

  return NextResponse.json(responseBody, {
    status: error.statusCode,
    headers: {
      'X-Emergency-Error-Code': error.code,
      'X-Emergency-Timestamp': error.timestamp.toISOString(),
    }
  });
}

// Public error messages (user-friendly)
function getPublicErrorMessage(code: EmergencyErrorCode, originalMessage: string): string {
  const publicMessages: Record<EmergencyErrorCode, string> = {
    [EmergencyErrorCodes.UNAUTHORIZED]: 'Authentication required to access emergency services',
    [EmergencyErrorCodes.FORBIDDEN]: 'Access denied to emergency resources',
    [EmergencyErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for emergency operations',
    [EmergencyErrorCodes.INVALID_REQUEST]: 'Invalid request format or parameters',
    [EmergencyErrorCodes.MISSING_REQUIRED_FIELDS]: 'Required fields are missing from the request',
    [EmergencyErrorCodes.INVALID_FORMAT]: 'Requested format is not supported',
    [EmergencyErrorCodes.INVALID_SEVERITY]: 'Invalid emergency severity level',
    [EmergencyErrorCodes.INVALID_STATUS]: 'Invalid emergency status',
    [EmergencyErrorCodes.RESOURCE_NOT_FOUND]: 'Requested emergency resource not found',
    [EmergencyErrorCodes.RESOURCE_UNAVAILABLE]: 'Emergency resource is currently unavailable',
    [EmergencyErrorCodes.RESOURCE_CONFLICT]: 'Resource conflict detected',
    [EmergencyErrorCodes.SIMULATION_UNAVAILABLE]: 'Emergency simulation service is temporarily unavailable',
    [EmergencyErrorCodes.DATABASE_ERROR]: 'Database error occurred while processing emergency request',
    [EmergencyErrorCodes.EXTERNAL_API_ERROR]: 'External emergency service is currently unavailable',
    [EmergencyErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later',
    [EmergencyErrorCodes.EMERGENCY_SCENARIO_NOT_FOUND]: 'Emergency scenario not found',
    [EmergencyErrorCodes.EMERGENCY_ALERT_NOT_FOUND]: 'Emergency alert not found',
    [EmergencyErrorCodes.EMERGENCY_RESOURCE_BUSY]: 'Emergency resource is currently busy',
    [EmergencyErrorCodes.EMERGENCY_ESCALATION_FAILED]: 'Emergency escalation failed',
  };

  return publicMessages[code] || originalMessage;
}

// Error handler middleware
export function handleEmergencyError(error: unknown, context?: Record<string, any>): NextResponse {
  if (error instanceof EmergencyError) {
    return formatEmergencyErrorResponse(error);
  }

  // Handle other types of errors
  if (error instanceof Error) {
    const emergencyError = new EmergencyError(
      error.message,
      EmergencyErrorCodes.DATABASE_ERROR,
      500,
      { ...context, originalError: error.name },
    );
    return formatEmergencyErrorResponse(emergencyError);
  }

  // Handle unknown errors
  const unknownError = new EmergencyError(
    'An unexpected error occurred',
    EmergencyErrorCodes.DATABASE_ERROR,
    500,
    { ...context, errorType: typeof error },
  );
  return formatEmergencyErrorResponse(unknownError);
}

// Validation helpers
export function validateEmergencySeverity(severity: string): boolean {
  return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity.toUpperCase());
}

export function validateEmergencyStatus(status: string): boolean {
  return ['ACTIVE', 'RESPONDING', 'INVESTIGATING', 'RESOLVED', 'ESCALATED'].includes(status.toUpperCase());
}

export function validateEmergencyFormat(format: string): boolean {
  return ['json', 'xml', 'csv', 'yaml', 'geojson', 'cap', 'eas'].includes(format.toLowerCase());
}

// Rate limiting helper
export function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  // Simple in-memory rate limiting (in production, use Redis or similar)
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!global.emergencyRateLimit) {
    global.emergencyRateLimit = new Map();
  }

  const userLimits = global.emergencyRateLimit.get(identifier) || [];
  const recentRequests = userLimits.filter((timestamp: number) => timestamp > windowStart);

  if (recentRequests.length >= limit) {
    return false;
  }

  recentRequests.push(now);
  global.emergencyRateLimit.set(identifier, recentRequests);

  return true;
}

// Export types for global declaration
declare global {
  var emergencyRateLimit: Map<string, number[]> | undefined;
}
