import React from 'react';
import { AdminScheduleQueueManager } from '@plugins/content-scheduling/components/AdminScheduleQueueManager';

export const metadata = {
  title: 'Admin Schedule Queue & Worker Oversight | CreatorPulse Admin',
  description: 'System-wide schedule queue monitoring, background job worker status, and failure retry audit log.',
};

export default function AdminScheduleQueuePage() {
  return <AdminScheduleQueueManager />;
}
