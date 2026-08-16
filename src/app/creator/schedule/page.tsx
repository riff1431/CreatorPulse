import React from 'react';
import { CreatorScheduleDashboard } from '@plugins/content-scheduling/components/CreatorScheduleDashboard';

export const metadata = {
  title: 'Schedule Queue & Auto-Publishing | Creator Studio',
  description: 'Manage scheduled posts, reels, and stories with calendar & queue controls.',
};

export default function CreatorSchedulePage() {
  return <CreatorScheduleDashboard />;
}
