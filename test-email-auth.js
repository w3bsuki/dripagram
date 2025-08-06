import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.log('Make sure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailAuth() {
  console.log('🔧 Testing Supabase Email Authentication...\n');
  
  // Generate a unique test email
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';
  
  console.log(`📧 Testing with email: ${testEmail}`);
  
  // Test 1: Sign up
  console.log('\n1️⃣ Testing sign up...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      emailRedirectTo: 'http://localhost:3000/auth/callback',
      data: {
        username: `testuser${timestamp}`,
        account_type: 'personal'
      }
    }
  });
  
  if (signUpError) {
    console.error('❌ Sign up failed:', signUpError.message);
    return;
  }
  
  console.log('✅ Sign up successful!');
  console.log('   User ID:', signUpData.user?.id);
  console.log('   Email:', signUpData.user?.email);
  console.log('   Confirmation sent:', signUpData.user?.confirmation_sent_at);
  
  // Test 2: Check if email confirmation is required
  console.log('\n2️⃣ Checking email confirmation requirement...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (signInError) {
    if (signInError.message.includes('Email not confirmed')) {
      console.log('✅ Email confirmation is required (expected behavior)');
      console.log('   Please check the email for verification link');
    } else {
      console.error('❌ Sign in error:', signInError.message);
    }
  } else {
    console.log('⚠️  User signed in without email confirmation');
    console.log('   This might mean email confirmation is disabled');
  }
  
  // Test 3: Check current auth settings
  console.log('\n3️⃣ Current configuration:');
  console.log('   Supabase URL:', supabaseUrl);
  console.log('   Using default SMTP: noreply@mail.app.supabase.io');
  console.log('   Redirect URL: http://localhost:3000/auth/callback');
  
  console.log('\n📋 Next steps:');
  console.log('1. Check the test email inbox for verification email');
  console.log('2. If no email received, check spam folder');
  console.log('3. Check Supabase dashboard for auth logs');
  console.log('4. Consider configuring custom SMTP for production');
}

// Run the test
testEmailAuth().catch(console.error);