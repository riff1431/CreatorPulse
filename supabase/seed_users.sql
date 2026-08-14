-- 1. Create the pgcrypto extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
  creator_id UUID := gen_random_uuid();
  fan_id UUID := gen_random_uuid();
BEGIN
  -- 2. Create Admin User
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (
    admin_id, 
    '00000000-0000-0000-0000-000000000000', 
    'admin@creatorpulse.com', 
    crypt('AdminPass123!', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{}', 
    now(), 
    now(), 
    'authenticated', 
    'authenticated'
  );

  INSERT INTO public.profiles (id, email, full_name, username, role, is_verified)
  VALUES (admin_id, 'admin@creatorpulse.com', 'System Admin', 'admin', 'admin', true);

  -- 3. Create Creator User
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (
    creator_id, 
    '00000000-0000-0000-0000-000000000000', 
    'creator@creatorpulse.com', 
    crypt('CreatorPass123!', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{}', 
    now(), 
    now(), 
    'authenticated', 
    'authenticated'
  );

  INSERT INTO public.profiles (id, email, full_name, username, role, is_verified)
  VALUES (creator_id, 'creator@creatorpulse.com', 'Top Creator', 'creator', 'creator', true);

  INSERT INTO public.creator_profiles (id, headline, category)
  VALUES (creator_id, 'Creating awesome content', 'Art & Design');

  -- 4. Create Fan (Member) User
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (
    fan_id, 
    '00000000-0000-0000-0000-000000000000', 
    'fan@creatorpulse.com', 
    crypt('FanPass123!', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{}', 
    now(), 
    now(), 
    'authenticated', 
    'authenticated'
  );

  INSERT INTO public.profiles (id, email, full_name, username, role, is_verified)
  VALUES (fan_id, 'fan@creatorpulse.com', 'Super Fan', 'fan', 'member', false);

END $$;
