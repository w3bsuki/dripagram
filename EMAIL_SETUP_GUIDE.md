# Email Confirmation Setup Guide for Driplo

## 🚨 Current Issue
- Email confirmations are ENABLED in your Supabase project
- But NO SMTP is configured, so emails aren't being sent
- Default Supabase SMTP is limited to 2-4 emails/hour (testing only)

## 📧 Option 1: Use Resend (Recommended - Free tier available)

### Step 1: Create Resend Account
1. Sign up at https://resend.com (free tier: 100 emails/day)
2. Verify your domain or use their testing domain
3. Get your API key from the dashboard

### Step 2: Configure Supabase SMTP
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bjjdgnfiwvkhrpbvvaoi/settings/auth
2. Scroll to **SMTP Settings**
3. Toggle **Enable Custom SMTP** to ON
4. Enter these settings:

```
Sender email: noreply@yourdomain.com (or use onboarding@resend.dev for testing)
Sender name: Driplo
Host: smtp.resend.com
Port: 465
Username: resend
Password: [Your Resend API Key starting with re_]
```

5. Click **Save**

### Step 3: Update Environment Variables
Add to your `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
```

## 📧 Option 2: Use SendGrid (More features)

### Step 1: Create SendGrid Account
1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Verify your sender identity
3. Create an API key with "Mail Send" permissions

### Step 2: Configure in Supabase
```
Sender email: noreply@yourdomain.com
Sender name: Driplo
Host: smtp.sendgrid.net
Port: 465
Username: apikey (literally this word)
Password: [Your SendGrid API Key]
```

## 📧 Option 3: Use Gmail (Quick testing)

⚠️ **Not recommended for production**

1. Enable 2FA on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Configure in Supabase:

```
Sender email: your-email@gmail.com
Sender name: Driplo
Host: smtp.gmail.com
Port: 465
Username: your-email@gmail.com
Password: [Your App Password]
```

## 🎨 Customize Email Templates

1. Go to: https://supabase.com/dashboard/project/bjjdgnfiwvkhrpbvvaoi/auth/templates
2. Customize these templates:

### Confirm Signup Template
```html
<h2>Welcome to Driplo!</h2>
<p>Thanks for signing up. Please confirm your email to get started:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>Or enter this code: {{ .Token }}</p>
```

### Magic Link Template
```html
<h2>Your Driplo Login Link</h2>
<p>Click below to sign in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In to Driplo</a></p>
<p>This link expires in 1 hour.</p>
```

### Reset Password Template
```html
<h2>Reset Your Driplo Password</h2>
<p>Click below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
```

## 🔧 Update Your Code

The signup page already has the correct redirect URL:

```javascript
const { data: authData, error } = await data.supabase.auth.signUp({
  email,
  password,
  options: {
    data: metadata,
    emailRedirectTo: `${window.location.origin}/auth/verify`
  }
});
```

## ✅ Testing Email Flow

1. **Configure SMTP** (use Resend for quick setup)
2. **Sign up a new user** at `/auth/signup`
3. **Check email** for confirmation link
4. **Click link** to confirm email
5. **Sign in** at `/auth/login`

## 🚀 Quick Fix for Development

If you just want to test without emails:

### Option A: Disable Email Confirmation
1. Go to: https://supabase.com/dashboard/project/bjjdgnfiwvkhrpbvvaoi/auth/providers
2. Click "Email" provider
3. Turn OFF "Confirm email"
4. Save

### Option B: Manual Confirmation
Run this SQL in Supabase SQL Editor:
```sql
-- Confirm all unconfirmed users (dev only!)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

## 📊 Rate Limits

- **No SMTP**: 2-4 emails/hour (Supabase default)
- **Custom SMTP**: 30 emails/hour initially
- **Resend Free**: 100 emails/day, 3000/month
- **SendGrid Free**: 100 emails/day forever

## 🔒 Security Notes

1. **Never commit API keys** - Use environment variables
2. **Verify sender domain** for better deliverability
3. **Use SPF/DKIM/DMARC** records for production
4. **Monitor bounce rates** in your email provider dashboard

## 💡 Pro Tips

1. **Use Resend for simplicity** - It's built for developers
2. **Test with Mailpit locally** - Run `supabase start` locally
3. **Set up webhooks** to track email events
4. **Use custom domain** for professional appearance
5. **Monitor email analytics** to improve deliverability

## 🆘 Troubleshooting

**"Email not confirmed" error:**
- Check if SMTP is configured
- Verify email was sent (check spam folder)
- Manually confirm user if needed

**Emails not sending:**
- Check SMTP credentials
- Verify sender email is allowed
- Check rate limits
- Look at Supabase logs

**Emails in spam:**
- Verify domain with SPF/DKIM
- Use a reputable email service
- Avoid spam trigger words
- Add unsubscribe links