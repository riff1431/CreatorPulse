import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtxbkzabhqsblqecoaba.supabase.co';
const supabaseKey = 'sb_publishable_Qk_A6u8IsWb9UGXjNQvGLw_dJTNG_0m';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUsers() {
  const users = [
    { email: 'admin@creatorpulse.local', password: 'Password123!', username: 'admin', full_name: 'System Admin', role: 'admin' },
    { email: 'creator@creatorpulse.local', password: 'Password123!', username: 'creator', full_name: 'Top Creator', role: 'creator' },
    { email: 'fan@creatorpulse.local', password: 'Password123!', username: 'fan', full_name: 'Super Fan', role: 'member' }
  ];

  for (const u of users) {
    console.log(`Signing up ${u.email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
    });

    if (authError) {
      console.error(`Error signing up ${u.email}:`, authError.message);
      continue;
    }

    const userId = authData.user?.id;
    if (!userId) {
      console.log(`Failed to get user ID for ${u.email}`);
      continue;
    }

    console.log(`User ${u.email} created with ID ${userId}. Session exists? ${!!authData.session}`);

    // Insert into profiles
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: u.email,
      full_name: u.full_name,
      username: u.username,
      role: u.role,
      is_verified: u.role === 'creator' || u.role === 'admin'
    });

    if (profileError) {
      console.error(`Error creating profile for ${u.email}:`, profileError.message);
    } else {
      console.log(`Profile created for ${u.email}`);
    }
    
    // If creator, insert into creator_profiles
    if (u.role === 'creator') {
      const { error: creatorError } = await supabase.from('creator_profiles').upsert({
        id: userId,
        headline: 'Creating awesome content',
        category: 'Art & Design'
      });
      if (creatorError) {
        console.error(`Error creating creator profile for ${u.email}:`, creatorError.message);
      } else {
        console.log(`Creator profile created for ${u.email}`);
      }
    }
  }
}

createTestUsers();
