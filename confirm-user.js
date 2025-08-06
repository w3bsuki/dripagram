import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjjdgnfiwvkhrpbvvaoi.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqamRnbmZpd3ZraHJwYnZ2YW9pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMxNjEzNCwiZXhwIjoyMDY5ODkyMTM0fQ.flv3aiEHh_Ak4diDP2SRek_50TXF7jID_Woy2mSssCw';

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmUser(email) {
  console.log(`Manually confirming user: ${email}\n`);
  
  // First, get the user
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }
  
  const user = users.users.find(u => u.email === email);
  
  if (!user) {
    console.error('User not found:', email);
    return;
  }
  
  console.log('Found user:', user.id);
  
  // Update the user to confirm email
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { 
      email_confirmed_at: new Date().toISOString(),
      user_metadata: { ...user.user_metadata, email_verified: true }
    }
  );
  
  if (updateError) {
    console.error('Error confirming user:', updateError);
  } else {
    console.log('✅ User confirmed successfully!');
    console.log('   Email confirmed at:', updatedUser.user.email_confirmed_at);
    
    // Now test signin
    const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqamRnbmZpd3ZraHJwYnZ2YW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTYxMzQsImV4cCI6MjA2OTg5MjEzNH0.eq6mW4ew6jOOkkfzDD1O07ElNAkKbKo6_74hKpUHcDA');
    
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: email,
      password: 'TestPassword123!'
    });
    
    if (signInError) {
      console.error('\n❌ Signin still failed:', signInError.message);
    } else {
      console.log('\n✅ Signin now works!');
      console.log('   Session token:', signInData.session?.access_token?.substring(0, 30) + '...');
    }
  }
}

// Confirm the test user
confirmUser('testuser@gmail.com').catch(console.error);