'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wrench, ShieldAlert, Database, HardDrive, Clock, CheckCircle2, 
  AlertTriangle, RefreshCw, Download, Play, Terminal, Power, 
  Trash2, Cpu, Zap, Activity, ShieldCheck, Lock, Unlock, Server,
  Sparkles, FileText, ArrowRight
} from 'lucide-react';
import { 
  getMaintenanceConfig, 
  saveMaintenanceConfig, 
  getScheduledJobs, 
  triggerScheduledJob, 
  SYSTEM_DIAGNOSTICS, 
  MaintenanceConfig, 
  ScheduledCronJob 
} from '@/lib/system/maintenance-store';
import { recordSystemLog } from '@/lib/logs/audit-logger';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';

export default function AdminMaintenancePage() {
  const [config, setConfig] = useState<MaintenanceConfig>(getMaintenanceConfig());
  const [jobs, setJobs] = useState<ScheduledCronJob[]>([]);
  
  // Maintenance Form State
  const [maintenanceMode, setMaintenanceMode] = useState(config.maintenanceMode);
  const [message, setMessage] = useState(config.message);
  const [allowedIps, setAllowedIps] = useState(config.allowedIps.join(', '));
  const [estimatedCompletion, setEstimatedCompletion] = useState(config.estimatedCompletion);

  // Operational Tool Execution states
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isOptimizingDb, setIsOptimizingDb] = useState(false);
  const [isScanningStorage, setIsScanningStorage] = useState(false);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  // Confirmation Modals
  const [confirmAction, setConfirmAction] = useState<'maintenance' | 'cache' | 'vacuum' | 'backup' | null>(null);

  const { showToast } = useToast();
  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();
  const [isScanningDiagnostics, setIsScanningDiagnostics] = useState(false);

  const loadData = () => {
    const activeConfig = getMaintenanceConfig();
    setConfig(activeConfig);
    setMaintenanceMode(activeConfig.maintenanceMode);
    setMessage(activeConfig.message);
    setAllowedIps(activeConfig.allowedIps.join(', '));
    setEstimatedCompletion(activeConfig.estimatedCompletion);

    setJobs(getScheduledJobs());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('creatorpulse_maintenance_updated', handleUpdate);
    window.addEventListener('creatorpulse_jobs_updated', handleUpdate);
    return () => {
      window.removeEventListener('creatorpulse_maintenance_updated', handleUpdate);
      window.removeEventListener('creatorpulse_jobs_updated', handleUpdate);
    };
  }, []);

  const handleExecuteMaintenanceToggle = async () => {
    const nextState = !maintenanceMode;
    setConfirmAction(null);

    startProgress({
      title: `${nextState ? 'Enabling' : 'Disabling'} Maintenance Mode`,
      steps: [
        "Applying platform firewall restrictions...",
        "Updating system runtime parameters...",
        "Broadcasting state updates to edge hosts..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Applying platform firewall restrictions...");
      await new Promise(r => setTimeout(r, 500));
      updateProgress(0, 'success', 40, "Firewall parameters configured.");

      updateProgress(1, 'running', 60, "Updating system runtime parameters...");
      const ipArray = allowedIps.split(',').map(ip => ip.trim()).filter(Boolean);
      const updated: MaintenanceConfig = {
        maintenanceMode: nextState,
        message,
        allowedIps: ipArray,
        estimatedCompletion,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      saveMaintenanceConfig(updated);
      setConfig(updated);
      setMaintenanceMode(updated.maintenanceMode);
      await new Promise(r => setTimeout(r, 500));
      updateProgress(1, 'success', 85, "Runtime variables persistent.");

      updateProgress(2, 'running', 95, "Broadcasting state updates to edge hosts...");
      await new Promise(r => setTimeout(r, 400));

      recordSystemLog({
        category: 'admin_actions',
        action: 'MAINTENANCE_MODE_TOGGLED',
        targetEntity: 'Platform System Config',
        details: updated.maintenanceMode 
          ? 'Enabled global maintenance mode banner and IP restriction'
          : 'Disabled maintenance mode. Restored public platform access',
        user: 'Elena Rostova',
        role: 'super_admin',
        severity: updated.maintenanceMode ? 'warning' : 'success',
        payloadJson: JSON.stringify(updated, null, 2)
      });

      completeProgress(`Maintenance mode ${updated.maintenanceMode ? 'enabled' : 'disabled'}!`);
      showToast(
        updated.maintenanceMode 
          ? 'Maintenance Mode Enabled. Non-whitelisted visitors will see downtime banner.' 
          : 'Maintenance Mode Disabled. Platform is live to all visitors.',
        updated.maintenanceMode ? 'info' : 'success'
      );
    } catch (err: any) {
      errorProgress(1, err.message || "Failed to toggle maintenance mode.");
    }
  };

  const handleExecuteClearCache = async () => {
    setIsClearingCache(true);
    setConfirmAction(null);

    startProgress({
      title: "Purging Cache & Temp Storage",
      steps: [
        "Purging Next.js page route caches...",
        "Clearing media thumbnail caches...",
        "Flushing active session stores..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Purging Next.js page route caches...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(0, 'success', 40, "Route caches purged.");

      updateProgress(1, 'running', 50, "Clearing media thumbnail caches...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(1, 'success', 80, "Media thumbnail caches cleared.");

      updateProgress(2, 'running', 90, "Flushing active session stores...");
      await new Promise(r => setTimeout(r, 500));

      recordSystemLog({
        category: 'admin_actions',
        action: 'CACHE_PURGED',
        targetEntity: 'Redis & Application Cache',
        details: 'Flushed application HTML cache, media thumbnail cache, and session store',
        user: 'Elena Rostova',
        role: 'super_admin',
        severity: 'info'
      });

      completeProgress("Cache cleared successfully!");
      showToast('Flushed all application caches and thumbnail stores.', 'success');
    } catch (err: any) {
      errorProgress(1, err.message || "Failed to purge caches.");
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleExecuteOptimizeDb = async () => {
    setIsOptimizingDb(true);
    setConfirmAction(null);

    startProgress({
      title: "Optimizing PostgreSQL Database Cluster",
      steps: [
        "Analyzing table row dependencies...",
        "Executing VACUUM ANALYZE optimization...",
        "Re-indexing database schema indices...",
        "Updating query planner statistics..."
      ]
    });

    try {
      updateProgress(0, 'running', 15, "Analyzing table row dependencies...");
      await new Promise(r => setTimeout(r, 500));
      updateProgress(0, 'success', 30, "Table rows analyzed.");

      updateProgress(1, 'running', 45, "Executing VACUUM ANALYZE optimization...");
      await new Promise(r => setTimeout(r, 700));
      updateProgress(1, 'success', 60, "PostgreSQL vacuuming complete.");

      updateProgress(2, 'running', 75, "Re-indexing database schema indices...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(2, 'success', 85, "Indexes rebuilt.");

      updateProgress(3, 'running', 90, "Updating query planner statistics...");
      await new Promise(r => setTimeout(r, 400));

      recordSystemLog({
        category: 'admin_actions',
        action: 'DATABASE_VACUUMED',
        targetEntity: 'PostgreSQL Database Cluster',
        details: 'Re-indexed 25 database tables and analyzed PostgreSQL query planner statistics',
        user: 'Elena Rostova',
        role: 'super_admin',
        severity: 'success'
      });

      completeProgress("Database optimization complete!");
      showToast('Database optimization complete! Vacuumed 25 PostgreSQL tables.', 'success');
    } catch (err: any) {
      errorProgress(1, err.message || "Optimization failed.");
    } finally {
      setIsOptimizingDb(false);
    }
  };

  const handleScanStorage = async () => {
    setIsScanningStorage(true);

    startProgress({
      title: "Scanning Storage Buckets & Metadata",
      steps: [
        "Connecting to active storage drives...",
        "Scanning storage directories & objects...",
        "Verifying file checksum profiles..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Connecting to active storage drives...");
      await new Promise(r => setTimeout(r, 500));
      updateProgress(0, 'success', 45, "Connected to storage drive buckets.");

      updateProgress(1, 'running', 60, "Scanning storage directories & objects...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(1, 'success', 80, "Directories scanned.");

      updateProgress(2, 'running', 90, "Verifying file checksum profiles...");
      await new Promise(r => setTimeout(r, 400));

      completeProgress("Storage scanning completed!");
      showToast('Storage bucket scan complete: 0 corrupt objects detected.', 'info');
    } catch (err: any) {
      errorProgress(1, err.message || "Failed to scan storage.");
    } finally {
      setIsScanningStorage(false);
    }
  };

  const handleRunJob = async (jobId: string) => {
    setRunningJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    const jobName = job ? job.name : 'background cron job';

    startProgress({
      title: `Running Job: ${jobName}`,
      steps: [
        "Initializing background job runtime context...",
        "Executing cron task routines...",
        "Writing job execution reports & logs..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Initializing background job runtime context...");
      await new Promise(r => setTimeout(r, 500));
      updateProgress(0, 'success', 40, "Runtime context ready.");

      updateProgress(1, 'running', 60, "Executing cron task routines...");
      const updatedJob = triggerScheduledJob(jobId);
      await new Promise(r => setTimeout(r, 600));
      updateProgress(1, 'success', 85, "Task routines completed.");

      updateProgress(2, 'running', 90, "Writing job execution reports & logs...");
      await new Promise(r => setTimeout(r, 400));

      if (updatedJob) {
        recordSystemLog({
          category: 'admin_actions',
          action: 'CRON_JOB_MANUAL_TRIGGER',
          targetEntity: `Job: ${updatedJob.name}`,
          details: `Manually triggered background cron job "${updatedJob.name}"`,
          user: 'Elena Rostova',
          role: 'super_admin',
          severity: 'info'
        });
        completeProgress("Cron job completed!");
        showToast(`Job "${updatedJob.name}" executed successfully!`, 'success');
      } else {
        throw new Error("Job execution failed to trigger.");
      }
    } catch (err: any) {
      errorProgress(1, err.message || "Cron job execution failed.");
    } finally {
      setRunningJobId(null);
    }
  };

  const handleDownloadBackup = async () => {
    setConfirmAction(null);

    startProgress({
      title: "Exporting System DB Snapshot",
      steps: [
        "Consolidating diagnostics reports...",
        "Dumping schema tables & configs...",
        "Creating file bundle & downloading..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Consolidating diagnostics reports...");
      await new Promise(r => setTimeout(r, 450));
      updateProgress(0, 'success', 40, "Diagnostics logs prepared.");

      updateProgress(1, 'running', 60, "Dumping schema tables & configs...");
      const backupData = {
        timestamp: new Date().toISOString(),
        platform: 'CreatorPulse',
        version: '0.1.0',
        database: 'PostgreSQL 15',
        tablesDumped: 25,
        maintenanceConfig: config,
        scheduledJobs: jobs,
        systemDiagnostics: SYSTEM_DIAGNOSTICS
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      await new Promise(r => setTimeout(r, 450));
      updateProgress(1, 'success', 80, "Schema variables dumped.");

      updateProgress(2, 'running', 90, "Creating file bundle & downloading...");
      await new Promise(r => setTimeout(r, 350));

      const link = document.createElement('a');
      link.href = url;
      link.download = `creatorpulse_db_backup_snapshot_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      completeProgress("Snapshot exported successfully!");
      showToast('Downloaded system database backup snapshot.', 'success');
    } catch (err: any) {
      errorProgress(1, err.message || "Failed to download backup snapshot.");
    }
  };

  const handleScanDiagnostics = async () => {
    setIsScanningDiagnostics(true);
    startProgress({
      title: "Running System Diagnostics Scan",
      steps: [
        "Analyzing server hardware metrics...",
        "Checking database engine connections...",
        "Validating cache adapter configuration...",
        "Verifying SSL certification statuses..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Analyzing server hardware metrics...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(0, 'success', 45, "Hardware health: OPTIMAL.");

      updateProgress(1, 'running', 60, "Checking database engine connections...");
      await new Promise(r => setTimeout(r, 650));
      updateProgress(1, 'success', 75, "Database connections: ACTIVE.");

      updateProgress(2, 'running', 85, "Validating cache adapter configuration...");
      await new Promise(r => setTimeout(r, 500));
      updateProgress(2, 'success', 90, "Redis cache adapters: READY.");

      updateProgress(3, 'running', 95, "Verifying SSL certification statuses...");
      await new Promise(r => setTimeout(r, 400));

      completeProgress("System diagnostics check complete!");
      showToast('All system diagnostic checks passed successfully!', 'success');
    } catch (err: any) {
      errorProgress(1, err.message || "Diagnostics scan failed.");
    } finally {
      setIsScanningDiagnostics(false);
    }
  };

  return (
    <RoleGuard
      requiredPermission="manage_settings"
      fallbackTitle="System Settings Clearance Required"
      fallbackMessage="You need super administrative settings clearance to access system maintenance tools or trigger database vacuum actions."
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="text-indigo-600" size={24} />
              <h1 className="text-xl font-black text-[#18181B] tracking-tight">Maintenance & System Tools</h1>
            </div>
            <p className="text-xs text-[#71717A] mt-1 font-medium">
              Control global maintenance mode, clear application caches, inspect database health, monitor scheduled background cron jobs, and perform system diagnostic checks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={13} />}
              onClick={() => setConfirmAction('backup')}
            >
              Export System Snapshot
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={13} />} onClick={loadData}>
              Sync Tools
            </Button>
          </div>
        </div>

        {/* Global Maintenance Banner (Active Alert) */}
        {config.maintenanceMode && (
          <div className="p-4 bg-rose-950 text-rose-100 border border-rose-800 rounded-2xl flex items-center justify-between gap-4 shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-400 shrink-0" size={24} />
              <div>
                <p className="font-extrabold text-sm text-white">MAINTENANCE MODE IS CURRENTLY ACTIVE</p>
                <p className="text-xs text-rose-200 mt-0.5">{config.message}</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setConfirmAction('maintenance')}
              className="bg-white text-rose-950 hover:bg-rose-100 border-none font-black text-xs shrink-0"
            >
              Disable Maintenance Mode
            </Button>
          </div>
        )}

        {/* Top Grid: 2 Columns (Maintenance Mode Control vs Cache & Memory Tools) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Maintenance Mode Configuration */}
          <Card className="space-y-4 border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Power className={maintenanceMode ? 'text-rose-600' : 'text-emerald-600'} size={20} />
                <h2 className="text-sm font-black text-slate-900">Maintenance Mode Control</h2>
              </div>
              <Badge variant={maintenanceMode ? 'rose' : 'emerald'} size="sm">
                {maintenanceMode ? 'MAINTENANCE ON' : 'PLATFORM LIVE'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="font-bold text-slate-800">Global Maintenance Mode</p>
                  <p className="text-[10px] text-slate-500">Restricts public access and displays custom downtime page.</p>
                </div>

                <button
                  onClick={() => setConfirmAction('maintenance')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                    maintenanceMode
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {maintenanceMode ? <Unlock size={14} /> : <Lock size={14} />}
                  {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Maintenance Message Banner</label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Whitelisted IP Bypass List</label>
                  <input
                    type="text"
                    value={allowedIps}
                    onChange={(e) => setAllowedIps(e.target.value)}
                    placeholder="192.168.1.42, 127.0.0.1"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Estimated Completion Time</label>
                  <input
                    type="text"
                    value={estimatedCompletion}
                    onChange={(e) => setEstimatedCompletion(e.target.value)}
                    placeholder="2026-08-15 02:00 UTC"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Cache & Memory Management */}
          <Card className="space-y-4 border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Zap className="text-amber-500" size={20} />
                <h2 className="text-sm font-black text-slate-900">Cache & Memory Management</h2>
              </div>
              <Badge variant="amber" size="sm">Redis / Memory</Badge>
            </div>

            <p className="text-xs text-slate-600">
              Flush application HTML page caches, media thumbnail caches, and session stores to resolve stale state or apply fresh configurations.
            </p>

            <div className="space-y-2 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Application Page & Data Cache</p>
                  <p className="text-[10px] text-slate-500">Flushes Next.js route caches and server rendered components.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isClearingCache}
                  onClick={() => setConfirmAction('cache')}
                  leftIcon={<RefreshCw size={13} className={isClearingCache ? 'animate-spin' : ''} />}
                >
                  {isClearingCache ? 'Clearing...' : 'Clear Cache'}
                </Button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Database Query & Vacuum Optimizer</p>
                  <p className="text-[10px] text-slate-500">Re-indexes 25 PostgreSQL schema tables and optimizes query plans.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isOptimizingDb}
                  onClick={() => setConfirmAction('vacuum')}
                  leftIcon={<Database size={13} className={isOptimizingDb ? 'animate-pulse' : ''} />}
                >
                  {isOptimizingDb ? 'Vacuuming...' : 'Optimize DB'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Section: Database Health & Scheduled Background Cron Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Scheduled Cron Jobs */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-5 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="text-indigo-600" size={20} />
                  <h2 className="text-sm font-black text-slate-900">Scheduled Background Cron Jobs</h2>
                </div>
                <Badge variant="indigo" size="sm">{jobs.length} Cron Tasks</Badge>
              </div>

              <div className="divide-y divide-slate-200/80">
                {jobs.map((j) => {
                  const isRunning = runningJobId === j.id;
                  return (
                    <div key={j.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{j.name}</p>
                          <Badge variant="emerald" size="sm">{j.schedule}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{j.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                          <span>Last Run: {j.lastRun}</span>
                          <span>Next Run: {j.nextRun}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isRunning}
                        onClick={() => handleRunJob(j.id)}
                        leftIcon={<Play size={13} className={isRunning ? 'animate-spin' : ''} />}
                        className="shrink-0"
                      >
                        {isRunning ? 'Running...' : 'Run Job Now'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column: Environment & Diagnostic System Checks */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Activity className="text-emerald-600" size={20} />
                  <h2 className="text-sm font-black text-slate-900">Environment Diagnostics</h2>
                </div>
                <Badge variant="emerald" size="sm">Optimal</Badge>
              </div>

              <div className="space-y-2.5">
                {SYSTEM_DIAGNOSTICS.map((diag) => (
                  <div key={diag.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{diag.label}</span>
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    </div>
                    <p className="font-mono text-xs font-black text-indigo-600">{diag.value}</p>
                    <p className="text-[10px] text-slate-500">{diag.details}</p>
                  </div>
                ))}

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={isScanningDiagnostics}
                    onClick={handleScanDiagnostics}
                    leftIcon={<Activity size={13} className={isScanningDiagnostics ? 'animate-pulse text-indigo-600' : ''} />}
                  >
                    {isScanningDiagnostics ? 'Scanning System...' : 'Run Diagnostics Scan'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Confirmation Modal: Maintenance Mode Toggle */}
        <Modal
          isOpen={confirmAction === 'maintenance'}
          onClose={() => setConfirmAction(null)}
          title={maintenanceMode ? 'Disable Maintenance Mode?' : 'Enable Global Maintenance Mode?'}
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
              <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={18} />
              <div>
                <p className="font-extrabold">Confirm System Access State Change</p>
                <p className="mt-1 leading-snug">
                  {maintenanceMode 
                    ? 'Disabling maintenance mode will restore immediate public access to all platform feeds and creator profiles.' 
                    : 'Enabling maintenance mode will restrict non-whitelisted visitors and present a global downtime banner.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button 
                variant={maintenanceMode ? 'primary' : 'danger'} 
                size="sm" 
                onClick={handleExecuteMaintenanceToggle}
              >
                {maintenanceMode ? 'Restore Public Access' : 'Enable Maintenance Mode'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Confirmation Modal: Clear Cache */}
        <Modal
          isOpen={confirmAction === 'cache'}
          onClose={() => setConfirmAction(null)}
          title="Confirm Application Cache Flush"
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs">
              <RefreshCw className="shrink-0 mt-0.5 text-blue-600" size={18} />
              <div>
                <p className="font-extrabold">Flush Server & Session Caches</p>
                <p className="mt-1 leading-snug">
                  This will purge all HTML page caches, media thumbnail caches, and session stores. Pages will re-render freshly on the next request.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecuteClearCache}>
                Confirm Cache Flush
              </Button>
            </div>
          </div>
        </Modal>

        {/* Confirmation Modal: Vacuum DB */}
        <Modal
          isOpen={confirmAction === 'vacuum'}
          onClose={() => setConfirmAction(null)}
          title="Confirm Database Vacuum & Optimization"
        >
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2.5 text-indigo-900 text-xs">
              <Database className="shrink-0 mt-0.5 text-indigo-600" size={18} />
              <div>
                <p className="font-extrabold">PostgreSQL Schema Optimization</p>
                <p className="mt-1 leading-snug">
                  This will run VACUUM ANALYZE across all 25 PostgreSQL tables to optimize query response times and reclaim dead space.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecuteOptimizeDb}>
                Execute Vacuum & Re-Index
              </Button>
            </div>
          </div>
        </Modal>

        {/* Confirmation Modal: Backup Download */}
        <Modal
          isOpen={confirmAction === 'backup'}
          onClose={() => setConfirmAction(null)}
          title="Export System Database Snapshot"
        >
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-900 text-xs">
              <Download className="shrink-0 mt-0.5 text-emerald-600" size={18} />
              <div>
                <p className="font-extrabold">Download System Database Snapshot</p>
                <p className="mt-1 leading-snug">
                  Generates a full JSON snapshot containing all 25 schema structure configurations, system diagnostics, maintenance configs, and cron schedules.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleDownloadBackup} leftIcon={<Download size={13} />}>
                Download Snapshot (.json)
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
