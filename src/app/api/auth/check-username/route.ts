import { NextResponse } from 'next/server';
import { AUTH_ACCOUNTS } from '@/lib/auth/users';
import { MOCK_USERS } from '@/lib/supabase/store';

// Set of system reserved usernames that cannot be registered
const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'superadmin',
  'root',
  'system',
  'support',
  'help',
  'official',
  'creatorpulse',
  'mod',
  'moderator',
  'api',
  'null',
  'undefined'
]);

function getExistingUsernames(): Set<string> {
  const usernames = new Set<string>();

  // Add reserved list
  RESERVED_USERNAMES.forEach((u) => usernames.add(u.toLowerCase()));

  // Add AUTH_ACCOUNTS usernames
  Object.values(AUTH_ACCOUNTS).forEach((account) => {
    if (account.username) {
      usernames.add(account.username.toLowerCase());
    }
  });

  // Add MOCK_USERS usernames
  Object.values(MOCK_USERS).forEach((user) => {
    if (user.username) {
      usernames.add(user.username.toLowerCase());
    }
  });

  // Common sample usernames in app
  ['jordanlee', 'fitdavid', 'miacooking', 'ryanphoto', 'lisasound', 'emmabakes', 'banned_user'].forEach((u) => {
    usernames.add(u.toLowerCase());
  });

  return usernames;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username') || '';
  const cleanedUsername = rawUsername.trim().toLowerCase();

  if (!cleanedUsername) {
    return NextResponse.json(
      { available: false, reason: 'Username cannot be empty.' },
      { status: 400 }
    );
  }

  // Format validation
  if (cleanedUsername.length < 3) {
    return NextResponse.json({
      available: false,
      reason: 'Username must be at least 3 characters long.'
    });
  }

  if (cleanedUsername.length > 25) {
    return NextResponse.json({
      available: false,
      reason: 'Username cannot exceed 25 characters.'
    });
  }

  const validRegex = /^[a-z0-9_]+$/;
  if (!validRegex.test(cleanedUsername)) {
    return NextResponse.json({
      available: false,
      reason: 'Username can only contain letters, numbers, and underscores.'
    });
  }

  const existingUsernames = getExistingUsernames();
  const isTaken = existingUsernames.has(cleanedUsername);

  if (isTaken) {
    // Generate 3 unique dynamic suggestions
    const suggestions: string[] = [];
    const randomNums = [
      Math.floor(100 + Math.random() * 900),
      Math.floor(10 + Math.random() * 90),
      Math.floor(1000 + Math.random() * 9000)
    ];

    for (const num of randomNums) {
      const candidate = `${cleanedUsername}_${num}`;
      if (!existingUsernames.has(candidate)) {
        suggestions.push(candidate);
      }
    }

    return NextResponse.json({
      username: cleanedUsername,
      available: false,
      reason: 'Username is already taken.',
      suggestions
    });
  }

  return NextResponse.json({
    username: cleanedUsername,
    available: true,
    reason: 'Username is available.'
  });
}
