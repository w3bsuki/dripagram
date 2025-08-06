import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjjdgnfiwvkhrpbvvaoi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqamRnbmZpd3ZraHJwYnZ2YW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTYxMzQsImV4cCI6MjA2OTg5MjEzNH0.eq6mW4ew6jOOkkfzDD1O07ElNAkKbKo6_74hKpUHcDA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailSignup() {
  const timestamp = Date.now();
  const email = `test${timestamp}@gmail.com`;
  const password = 'TestPassword123!';
  
  console.log('Testing email confirmation flow...\n');
  console.log('Signing up with:', email);
  console.log('Check your email (including SPAM folder) for confirmation from noreply@mail.app.supabase.io\n');
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:5190/auth/verify',
      data: {
        username: `user${timestamp}`,
        account_type: 'personal'
      }
    }
  });
  
  if (error) {
    console.error('❌ Signup failed:', error.message);
  } else {
    console.log('✅ Signup successful!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Confirmation required:', !data.user?.email_confirmed_at);
    console.log('\n⚠️ IMPORTANT:');
    console.log('1. Check your email inbox AND spam folder');
    console.log('2. Look for email from: noreply@mail.app.supabase.io');
    console.log('3. Click the confirmation link to verify your account');
    console.log('4. Then you can sign in at http://localhost:5190/auth/login');
  }
}

testEmailSignup().catch(console.error);