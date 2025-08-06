import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjjdgnfiwvkhrpbvvaoi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqamRnbmZpd3ZraHJwYnZ2YW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTYxMzQsImV4cCI6MjA2OTg5MjEzNH0.eq6mW4ew6jOOkkfzDD1O07ElNAkKbKo6_74hKpUHcDA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing Supabase Authentication...\n');
  
  // Test with existing user or create new
  const email = `testuser@gmail.com`;
  const password = 'TestPassword123!';
  
  console.log('1. Testing signup with:', email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: 'testuser',
        account_type: 'personal'
      }
    }
  });
  
  if (signUpError) {
    console.error('❌ Signup failed:', signUpError.message);
  } else {
    console.log('✅ Signup successful!');
    console.log('   User ID:', signUpData.user?.id);
    console.log('   Email confirmation required:', signUpData.user?.email_confirmed_at === null);
  }
  
  // Test signin
  console.log('\n2. Testing signin...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (signInError) {
    console.error('❌ Signin failed:', signInError.message);
  } else {
    console.log('✅ Signin successful!');
    console.log('   Session token:', signInData.session?.access_token?.substring(0, 20) + '...');
  }
  
  // Check if profile was created
  if (signUpData?.user) {
    console.log('\n3. Checking profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError.message);
    } else {
      console.log('✅ Profile found:', profile);
    }
  }
  
  // Get auth settings
  console.log('\n4. Testing email configuration...');
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    console.log('   Current user:', user.email);
    console.log('   Email confirmed:', user.email_confirmed_at !== null);
  }
}

testAuth().catch(console.error);