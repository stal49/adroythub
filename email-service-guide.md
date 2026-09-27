# Email Service Integration Guide

This guide explains how the email service works in this project using [Resend](https://resend.com/) and how to integrate it into any project.

## Overview

The email service uses Resend's API to send transactional emails. It is designed with graceful degradation — if the API key is not configured, the application continues to run without crashing, and email failures are logged for debugging.

## Architecture

```
┌─────────────────────┐
│   Application Code   │
│  (e.g., Auth Hook)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   lib/email.ts       │
│  (Email Functions)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Resend API         │
│  (resend.emails.send)│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   User's Inbox       │
└─────────────────────┘
```

## Setup

### 1. Install the Dependency

```bash
npm install resend
```

### 2. Configure Environment Variables

Add these variables to your `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_xxxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Verified sender email address | `noreply@yourdomain.com` |

### 3. Create the Email Service

Create `lib/email.ts` with the core Resend client initialization:

```typescript
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;
```

This pattern ensures the client is only created when the API key is available, allowing the app to run in development without email configuration.

## Sending Emails

### Basic Email Function Pattern

Each email type follows this structure:

```typescript
export async function sendEmailType({ email, name, userId }: EmailInput) {
    // 1. Validate configuration
    if (!resend) { /* log error, return */ }
    if (!resendFromEmail) { /* log error, return */ }

    // 2. Prepare content (escape HTML for safety)
    const safeName = escapeHtml(name?.trim() || 'there');

    // 3. Send via Resend API
    const { data, error } = await resend.emails.send(
        {
            from: resendFromEmail,
            to: [email],
            subject: 'Your Subject',
            html: `...`,
            text: `...`,
        },
        {
            idempotencyKey: `unique-key/${userId}`,
        },
    );

    // 4. Handle response
    if (error) { /* log error */ }
    else { /* log success */ }
}
```

### HTML Escape Utility

Always escape user-provided values in HTML templates to prevent XSS:

```typescript
function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
```

### Idempotency Keys

Use idempotency keys to prevent duplicate emails:

```typescript
{
    idempotencyKey: `welcome-user/${userId}`,
}
```

This ensures that even if the function is called multiple times for the same event, the email is only sent once.

## Adding a New Email Type

To add a new email type (e.g., password reset):

1. **Define the input interface:**
```typescript
interface PasswordResetEmailInput {
    email: string;
    name?: string | null;
    resetToken: string;
}
```

2. **Create the send function in `lib/email.ts`:**
```typescript
export async function sendPasswordResetEmail({ email, name, resetToken }: PasswordResetEmailInput) {
    if (!resend) { /* ... */ }
    if (!resendFromEmail) { /* ... */ }

    const safeName = escapeHtml(name?.trim() || 'there');
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const { data, error } = await resend.emails.send(
        {
            from: resendFromEmail,
            to: [email],
            subject: 'Reset Your Password',
            html: `<p>Hello ${safeName}, <a href="${resetUrl}">click here</a> to reset.</p>`,
            text: `Hello ${safeName}, visit ${resetUrl} to reset your password.`,
        },
        { idempotencyKey: `password-reset-${resetToken}` },
    );

    // Handle response...
}
```

3. **Trigger it from your application logic:**
```typescript
await sendPasswordResetEmail({ email: user.email, name: user.name, resetToken });
```

## Integration with Auth (Example)

In this project, the welcome email is triggered via a Better Auth database hook:

```typescript
// lib/auth.ts
import { sendWelcomeEmail } from './email';

export const auth = betterAuth({
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await sendWelcomeEmail({
                        email: user.email,
                        name: user.name,
                        userId: user.id,
                    });
                },
            },
        },
    },
});
```

This fires after every user creation (email/password sign-up or OAuth).

## Key Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Graceful degradation** | Service returns early with a log if not configured |
| **Non-blocking** | Email sends are async and don't block the main flow |
| **Error isolation** | Email failures are logged but don't crash the app |
| **Idempotency** | Keys prevent duplicate sends for the same event |
| **Security** | HTML escaping prevents XSS in templates |
| **Dual format** | Both HTML and plain text versions are provided |

## Current Email Types

| Email | Trigger | Idempotency Key |
|-------|---------|-----------------|
| Welcome Email | User account created | `welcome-user/{userId}` |

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Emails not sending | Missing `RESEND_API_KEY` | Add the key to `.env` |
| Emails not sending | Missing `RESEND_FROM_EMAIL` | Add a verified sender email to `.env` |
| Emails not sending | Unverified domain | Verify your domain in the Resend dashboard |
| Duplicate emails | Missing idempotency key | Add `idempotencyKey` to the send options |
