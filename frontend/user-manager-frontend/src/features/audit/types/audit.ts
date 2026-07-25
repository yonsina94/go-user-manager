export const AuditAction = {
    USER_LOGIN: "USER_LOGIN",
    USER_LOGIN_FAILED: "USER_LOGIN_FAILED",
    USER_CREATED: "USER_CREATED",
    USER_UPDATED: "USER_UPDATED",
    USER_DELETED: "USER_DELETED",
    AVATAR_UPLOADED: "AVATAR_UPLOADED",
    PASSWORD_CHANGED: "PASSWORD_CHANGED",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const AuditEntity = {
    AUTH: "Auth",
    USER: "User",
    PROFILE: "Profile",
} as const;

export type AuditEntity = (typeof AuditEntity)[keyof typeof AuditEntity];

export const AuditStatus = {
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
} as const;

export type AuditStatus = (typeof AuditStatus)[keyof typeof AuditStatus];

export interface AuditLog {
    id: number;
    userId?: number;
    userEmail: string;
    action: AuditAction;
    entity: AuditEntity;
    entityId?: number;
    status: AuditStatus;
    method?: string;
    path?: string;
    details: string;
    payload?: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}
