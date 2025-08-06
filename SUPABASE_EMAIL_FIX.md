# Fix Supabase Email Verification Issues

## Problem
Supabase reported high email bounce rates, which means emails are not being delivered properly.

## Solution Steps

### 1. Check Supabase Dashboard Settings

Go to your Supabase dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/configuration

#### A. Email Settings Tab
1. Go to **Authentication** → **Configuration** → **Email**
2. Ensure these settings are correct:
   - **Enable email confirmation**: ON ✅
   - **Confirm email change**: ON ✅
   - **Email OTP expiry**: 3600 (1 hour)

#### B. SMTP Settings (IMPORTANT!)
1. Go to **Authentication** → **Configuration** → **SMTP Settings**
2. **Current Status**: Using Supabase default SMTP (noreply@mail.app.supabase.io)
3. **Issue**: Default SMTP has sending limits and may be blocked by some email providers

### 2. Temporary Fix - Use Supabase Default SMTP

For testing and development:
1. Keep using Supabase default SMTP
2. **IMPORTANT**: Add test emails to **Allowed Email Domains** in Auth settings:
   - Go to **Authentication** → **Configuration** → **Email**
   - Add your test domains (e.g., `gmail.com`, `outlook.com`)

### 3. Production Fix - Configure Custom SMTP

#### Option A: Resend (Recommended)
```env
# .env.local
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_YOUR_API_KEY
SMTP_FROM=noreply@yourdomain.com
```

#### Option B: Gmail SMTP (For Testing)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=your-email@gmail.com
```

### 4. Update Email Templates

In Supabase Dashboard → Authentication → Email Templates:

#### Confirm Signup Template
```html
<h2>Confirm your email</h2>
<p>Welcome to Driplo!</p>
<p>Click the link below to confirm your email:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

#### Magic Link Template
```html
<h2>Sign in to Driplo</h2>
<p>Click the link below to sign in:</p>
<a href="{{ .ConfirmationURL }}">Sign In</a>
```

### 5. Test Email Flow

```javascript
// Test script to verify email sending
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
)

// Test signup
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'TestPassword123!',
  options: {
    emailRedirectTo: 'http://localhost:3000/auth/callback'
  }
})

if (error) {
  console.error('Signup error:', error)
} else {
  console.log('Check your email for verification link!')
}
```

### 6. Monitor Email Delivery

1. Check Supabase Logs:
   - Dashboard → Logs → Auth Logs
   - Look for email sending errors

2. Check Email Provider:
   - Check spam/junk folder
   - Add `noreply@mail.app.supabase.io` to safe senders

### 7. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Email not confirmed" error | User needs to click verification link in email |
| No email received | Check spam folder, verify SMTP settings |
| High bounce rate | Configure custom SMTP, verify email addresses |
| Link expired | Increase email OTP expiry time in settings |
| Wrong redirect after verification | Update `emailRedirectTo` in signup options |

## Current Implementation

The authentication system is now properly configured with:
- ✅ Server-side authentication with `@supabase/ssr`
- ✅ Email verification callback at `/auth/callback`
- ✅ Proper cookie handling for sessions
- ✅ TypeScript types for Supabase
- ✅ Svelte 5 patterns throughout

## Next Steps

1. **For Development**: Keep using Supabase default SMTP
2. **For Production**: 
   - Purchase domain
   - Configure Resend with your domain
   - Update SMTP settings in Supabase dashboard
   - Test with real email addresses

## Testing Commands

```bash
# Run development server
pnpm run dev

# Test signup flow
# 1. Go to http://localhost:3000/auth/signup
# 2. Sign up with a real email
# 3. Check email for verification link
# 4. Click link to verify
# 5. Should redirect to dashboard/profile
```