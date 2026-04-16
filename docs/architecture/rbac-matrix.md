# RBAC Matrix

This document defines the Role-Based Access Control (RBAC) structure for the Lungilicious platform. It serves as the source of truth for implementing authorization guards and session management policies.

## Roles

| Role | Description | Holder |
| :--- | :--- | :--- |
| **CUSTOMER** | Registered users of the platform. | External clients and shoppers. |
| **ADMIN** | System administrators with full platform control. | Technical leads and platform owners. |
| **EDITOR** | Content and product management specialists. | Marketing and catalog management teams. |
| **OPS** | Operations and fulfillment staff. | Warehouse and logistics personnel. |
| **SUPPORT** | Customer service representatives. | Help desk and support agents. |

## Permission Matrix

| Permission Domain | Permission | CUSTOMER | ADMIN | EDITOR | OPS | SUPPORT |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Catalog** | `products:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| | `products:create` | — | ✓ | ✓ | — | — |
| | `products:update` | — | ✓ | ✓ | — | — |
| | `products:delete` | — | ✓ | ✓ | — | — |
| **Categories** | `categories:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| | `categories:create` | — | ✓ | ✓ | — | — |
| | `categories:update` | — | ✓ | ✓ | — | — |
| | `categories:delete` | — | ✓ | ✓ | — | — |
| **Orders** | `orders:read:own` | ✓ | ✓ | — | — | — |
| | `orders:read:all` | — | ✓ | — | ✓ | ✓ |
| | `orders:update` | — | ✓ | — | ✓ | ✓ |
| | `orders:cancel` | ✓ limited | ✓ | — | ✓ | ✓ |
| **Customers** | `customers:read:own` | ✓ | ✓ | — | — | — |
| | `customers:read:all` | — | ✓ | — | — | ✓ |
| | `customers:update:own` | ✓ | ✓ | — | — | — |
| | `customers:update:all` | — | ✓ | — | — | ✓ limited |
| **Payments** | `payments:read` | — | ✓ | — | — | ✓ limited |
| | `refunds:issue` | — | ✓ | — | — | — |
| **Content** | `content:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| | `content:create` | — | ✓ | ✓ | — | — |
| | `content:update` | — | ✓ | ✓ | — | — |
| | `content:delete` | — | ✓ | ✓ | — | — |
| **Inventory** | `inventory:read` | — | ✓ | ✓ | ✓ | — |
| | `inventory:adjust` | — | ✓ | — | ✓ | — |
| **Admin Tools** | `admin:dashboard` | — | ✓ | ✓ | ✓ | ✓ |
| | `admin:users` | — | ✓ | — | — | — |
| | `admin:roles` | — | ✓ | — | — | — |
| **Audit** | `audit:read` | — | ✓ | — | — | — |
| **Notifications** | `notifications:manage` | — | ✓ | ✓ | ✓ | ✓ |

## MFA Requirements

| Role | Requirement | Methods |
| :--- | :--- | :--- |
| **ADMIN** | Mandatory | TOTP, SMS |
| **OPS** | Mandatory | TOTP, SMS |
| **EDITOR** | Recommended | TOTP, SMS |
| **SUPPORT** | Recommended | TOTP, SMS |
| **CUSTOMER** | Optional | Future Phase |

## Session Policy

### Expiry and Rotation
- **Customer Sessions**: 7-day expiry. Sessions rotate automatically upon any privilege change.
- **Staff Sessions (ADMIN, EDITOR, OPS, SUPPORT)**: 8-hour expiry. Mandatory rotation occurs every 4 hours to maintain security.
- **Revocation**: All sessions are revocable. The system stores session data in a dedicated table featuring a `revokedAt` field for immediate invalidation.

## Data Access Rules

- **Customer Isolation**: Customers can only access their own data. This restriction is strictly enforced server-side via user ID filtering.
- **Support Limitations**: Support staff can view customer data to assist with inquiries but cannot modify payment information or issue refunds.
- **Editor Scope**: Editors manage content and the product catalog. They lack permissions to issue refunds or view sensitive financial data.
- **Operations Scope**: Operations staff manage fulfillment and inventory levels. They cannot manage user roles or system configurations.
- **Admin Authority**: Admins hold full access across the platform. Every administrative action is recorded in the audit logs for accountability.
