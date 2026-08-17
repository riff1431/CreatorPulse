'use client';

import { redirect } from 'next/navigation';

export default function CreatorFollowersPage() {
  redirect('/connections?tab=followers');
}
