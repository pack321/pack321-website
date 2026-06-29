# Pack 321 Portal Architecture

This document captures the planned Pack 321 Portal architecture. The current public website is static GitHub Pages, so it cannot enforce Google login, server-side permissions, private data access, or secure writes by itself.

## Authentication

- Google OAuth only.
- No local passwords.
- No password storage.
- No forgot password workflow.
- Google authenticates identity.
- The portal authorizes the user from Users, Roles, Permissions, and RolePermissions records.

## Routes

- /portal/admin
- /portal/admin/users
- /portal/admin/roles
- /portal/admin/security
- /portal/admin/audit-log
- /portal/admin/settings

## Core Tables

### Users

userId, googleId, email, displayName, photoUrl, familyId, denId, active, lastLogin, createdAt, updatedAt

### Roles

roleId, roleName, description, active

### UserRoles

userRoleId, userId, roleId, assignedBy, assignedAt, active

### Permissions

permissionId, permissionKey, description, category

### RolePermissions

rolePermissionId, roleId, permissionId, allowed

### AccessRequests

requestId, name, email, familyName, scoutNames, requestedRole, notes, status, reviewedBy, reviewedAt, createdAt

### AuditLog

auditId, timestamp, userId, action, module, tableName, recordId, oldValue, newValue, ipAddress, userAgent

## Access Logic

1. Google login verifies identity.
2. Portal checks Users table for matching email.
3. If no active user exists, block access.
4. If active, load assigned roles.
5. Load permissions from RolePermissions.
6. Allow or deny pages/actions by permission keys.
7. Enforce all checks on the server/API layer, not only in the frontend.

## Security Rules

- Parents may only access their own family records.
- Den Leaders may only access their assigned den.
- Treasurer, Committee Chair, and Admin can access financial reports.
- Admin can manage users and roles.
- Committee Chair can view reports but should not manage system security unless also assigned Admin.
- Never expose Google Sheet directly to normal users.
- All writes go through secured API functions.
- Deactivating a user removes access but preserves history.
- Avoid deleting users.

## First Admin Bootstrap

Use an environment variable such as ADMIN_EMAILS. If a signed-in Google email matches ADMIN_EMAILS during initial setup, create or activate that user and grant Admin role. After that, Admin users manage all access inside the portal.

## Build Priority

1. Google OAuth login
2. Users/Roles/Permissions tables
3. Backend permission checks
4. Admin user management page
5. Role assignment
6. Access request workflow
7. Audit log
8. Treasurer and family modules
