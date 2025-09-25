import { prisma } from "@/lib/prisma";
import { AuditAction, Role } from "@prisma/client";

// Re-export AuditAction for convenience
export { AuditAction };

/**
 * Audit logging utility for tracking sensitive operations
 * @param action - The action being performed
 * @param userId - ID of the user performing the action
 * @param organisationId - ID of the organisation
 * @param details - Additional details about the action
 * @param ipAddress - IP address of the request
 * @param userAgent - User agent string
 */
export async function logAuditEvent(
  action: AuditAction,
  userId?: string,
  organisationId?: string,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // Only create audit log if userId exists and is valid
    if (userId) {
      // Verify user exists before creating audit log
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!userExists) {
        console.warn(`Cannot log audit event: User ${userId} does not exist`);
        return;
      }
    }

    await prisma.auditLog.create({
      data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        userId,
        organisationId,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(
  organisationId?: string,
  userId?: string,
  action?: AuditAction,
  limit = 50,
  offset = 0
) {
  const where: any = {};

  if (organisationId) where.organisationId = organisationId;
  if (userId) where.userId = userId;
  if (action) where.action = action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Role hierarchy for permission checking
 * Higher roles inherit permissions from lower roles
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.CITIZEN]: 1,
  [Role.PARTNER]: 2,
  [Role.CONTRACTOR]: 3,
  [Role.CREW]: 4,
  [Role.SUPERVISOR]: 5,
  [Role.MANAGER]: 6,
  [Role.EXEC]: 7,
  [Role.ADMIN]: 8,
  [Role.MAINTENANCE_PLANNER]: 3, // Same level as CONTRACTOR
};

/**
 * Check if a user has the required role or higher
 */
export function hasRole(userRole: Role, requiredRoles: Role[]): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  return requiredRoles.some(role => userLevel >= ROLE_HIERARCHY[role]);
}

/**
 * Check if a user can perform an action on another user
 */
export function canManageUser(currentUserRole: Role, targetUserRole: Role): boolean {
  const currentLevel = ROLE_HIERARCHY[currentUserRole];
  const targetLevel = ROLE_HIERARCHY[targetUserRole];

  // Users can only manage users with lower or equal roles
  // ADMIN can manage everyone, MANAGER can manage SUPERVISOR, CREW, CITIZEN, etc.
  return currentLevel >= targetLevel;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  const roleNames: Record<Role, string> = {
    [Role.ADMIN]: "Administrator",
    [Role.MANAGER]: "Manager",
    [Role.SUPERVISOR]: "Supervisor",
    [Role.CREW]: "Crew Member",
    [Role.EXEC]: "Executive",
    [Role.CONTRACTOR]: "Contractor",
    [Role.PARTNER]: "Partner",
    [Role.CITIZEN]: "Citizen",
  };

  return roleNames[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    [Role.ADMIN]: "Full system access, user management, and configuration",
    [Role.MANAGER]: "Asset management, work order oversight, and reporting",
    [Role.SUPERVISOR]: "Team management, work order assignment, and field operations",
    [Role.CREW]: "Field work execution, inspections, and work order completion",
    [Role.EXEC]: "High-level reporting and strategic oversight",
    [Role.CONTRACTOR]: "External contractor access for assigned work orders and inspections",
    [Role.PARTNER]: "Partner organisation access for collaborative projects and data sharing",
    [Role.CITIZEN]: "Read-only access to public information and issue reporting",
  };

  return descriptions[role];
}
