'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Filter, RefreshCw, Download, Trash2, 
  Eye, AlertTriangle, ShieldAlert, CheckCircle2, Info, Lock, 
  Terminal, Copy, Check, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { 
  getSystemLogs, 
  clearSystemLogs, 
  SystemLogEntry, 
  SystemLogCategory, 
  SystemLogSeverity 
} from '@/lib/logs/audit-logger';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { RoleGuard } from '@/components/auth/RoleGuard';

const CATEGORY_TABS: { id: SystemLogCategory | 'all'; label: string; count?: number }[] = [
  { id: 'all', label: 'All System Logs' },
  { id: 'admin_actions', label: 'Admin Actions' },
  { id: 'login_activity', label: 'Login & Auth' },
  { id: 'plugin_theme', label: 'Plugins & Themes' },
  { id: 'system_errors', label: 'System Errors' },
  { id: 'payment_events', label: 'Payments & Fees' },
  { id: 'security_events', label: 'Security & RLS' },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<SystemLogCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<SystemLogEntry | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { showToast } = useToast();

  const loadData = () => {
    setLogs(getSystemLogs());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('creatorpulse_system_log_added', handleUpdate);
    return () => {
      window.removeEventListener('creatorpulse_system_log_added', handleUpdate);
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (activeTab !== 'all' && log.category !== activeTab) return false;
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchEntity = log.targetEntity.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchUser = log.user.toLowerCase().includes(q);
      const matchIp = log.ipAddress?.toLowerCase().includes(q);
      const matchPayload = log.payloadJson?.toLowerCase().includes(q);
      return matchAction || matchEntity || matchDetails || matchUser || matchIp || matchPayload;
    }
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    if (logs.length === 0) {
      showToast('No logs available for export.', 'error');
      return;
    }

    const headers = ['Timestamp', 'Category', 'Action', 'Target Entity', 'Severity', 'User', 'Role', 'IP Address', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${l.targetEntity}"`,
      `"${l.severity}"`,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.ipAddress || 'N/A'}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `creatorpulse_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV audit log ledger successfully.', 'success');
  };

  const handleExportJSON = () => {
    if (logs.length === 0) {
      showToast('No logs available for export.', 'error');
      return;
    }

    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creatorpulse_system_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported JSON system log ledger successfully.', 'success');
  };

  const handleExecuteClearLogs = () => {
    clearSystemLogs();
    setLogs([]);
    setIsClearConfirmOpen(false);
    showToast('Platform system log ledger has been cleared.', 'info');
  };

  const handleCopyPayload = (payloadText: string) => {
    navigator.clipboard.writeText(payloadText);
    setCopiedPayload(true);
    showToast('Payload copied to clipboard.', 'success');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const renderSeverityBadge = (severity: SystemLogSeverity) => {
    switch (severity) {
      case 'success':
        return <Badge variant="emerald" size="sm">Success</Badge>;
      case 'info':
        return <Badge variant="blue" size="sm">Info</Badge>;
      case 'warning':
        return <Badge variant="amber" size="sm">Warning</Badge>;
      case 'error':
        return <Badge variant="rose" size="sm">Error</Badge>;
      case 'critical':
        return <Badge variant="rose" size="sm" className="bg-red-950 text-red-200 border-red-800 animate-pulse">Critical</Badge>;
      default:
        return <Badge variant="slate" size="sm">{severity}</Badge>;
    }
  };

  return (
    <RoleGuard
      requiredPermission="view_audit_logs"
      fallbackTitle="Audit Access Restricted"
      fallbackMessage="You do not have administrative clearance to inspect system audit logs or security event trails."
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={24} />
              <h1 className="text-xl font-black text-[#18181B] tracking-tight">System Logs & Audit Center</h1>
            </div>
            <p className="text-xs text-[#71717A] mt-1 font-medium">
              Immutable ledger recording administrator actions, authentication events, plugin states, payment webhooks, system errors, and security access checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download size={13} />} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" leftIcon={<FileText size={13} />} onClick={handleExportJSON}>
              Export JSON
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={13} />} onClick={loadData}>
              Sync Logs
            </Button>
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={13} />} onClick={() => setIsClearConfirmOpen(true)}>
              Purge Ledger
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.id === 'all' 
              ? logs.length 
              : logs.filter(l => l.category === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search actions, targets, users, IP address, or payload..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-indigo-500 font-medium shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={13} className="text-[#A1A1AA]" />
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="success">Success</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] font-bold text-[#71717A]">
            Showing {filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
          </div>
        </div>

        {/* Logs Data Table */}
        <Card className="overflow-hidden p-0 border-slate-200/80 shadow-sm">
          <div className="overflow-x-auto relative">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[#71717A] font-bold">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-medium">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#71717A] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-extrabold text-slate-500">
                      {log.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-indigo-600 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#18181B] max-w-[200px] truncate">
                      {log.targetEntity}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-[#18181B]">{log.user}</span>
                      <span className="text-[10px] text-[#71717A] ml-1 font-normal">({log.role})</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderSeverityBadge(log.severity)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye size={13} />}
                        onClick={() => setSelectedLog(log)}
                      >
                        Inspect Payload
                      </Button>
                    </td>
                  </tr>
                ))}

                {paginatedLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#71717A] font-bold">
                      No system log entries match your active category and severity filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
              <span className="text-xs text-[#71717A] font-bold">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  leftIcon={<ChevronLeft size={13} />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  rightIcon={<ChevronRight size={13} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Modal: Detailed Log Inspection & Payload View */}
        <Modal
          isOpen={selectedLog !== null}
          onClose={() => setSelectedLog(null)}
          title={selectedLog ? `Audit Event Inspector: ${selectedLog.action}` : ''}
        >
          {selectedLog && (
            <div className="space-y-4">
              {/* Event Summary Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-[#71717A] font-bold uppercase">Target Entity</span>
                  <p className="font-extrabold text-[#18181B] truncate">{selectedLog.targetEntity}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-[#71717A] font-bold uppercase">Timestamp</span>
                  <p className="font-mono font-bold text-[#18181B] truncate">{selectedLog.timestamp}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-[#71717A] font-bold uppercase">Actor Account</span>
                  <p className="font-bold text-[#18181B] truncate">{selectedLog.user} ({selectedLog.role})</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-[#71717A] font-bold uppercase">IP & Client</span>
                  <p className="font-mono text-[11px] font-bold text-indigo-600 truncate">
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </p>
                </div>
              </div>

              {/* Description Details */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Event Explanation</span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">{selectedLog.details}</p>
              </div>

              {/* User-Agent String */}
              {selectedLog.userAgent && (
                <div className="p-2.5 bg-slate-100/80 rounded-xl border border-slate-200/80 text-[10px] font-mono text-slate-600 truncate">
                  <span className="font-bold text-slate-700 mr-2">User-Agent:</span>
                  {selectedLog.userAgent}
                </div>
              )}

              {/* JSON Payload Viewer */}
              {selectedLog.payloadJson && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#71717A] tracking-wider flex items-center gap-1.5">
                      <Terminal size={12} className="text-indigo-600" />
                      JSON Metadata Payload
                    </span>
                    <button
                      onClick={() => handleCopyPayload(selectedLog.payloadJson!)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPayload ? <Check size={12} /> : <Copy size={12} />}
                      {copiedPayload ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 border border-slate-800 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
                    {selectedLog.payloadJson}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                  Close Inspector
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Confirm Purge System Logs */}
        <Modal
          isOpen={isClearConfirmOpen}
          onClose={() => setIsClearConfirmOpen(false)}
          title="Confirm System Log Ledger Purge"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-900 text-xs">
              <ShieldAlert className="shrink-0 mt-0.5 text-rose-600" size={18} />
              <div>
                <p className="font-extrabold">Irreversible Administrative Action</p>
                <p className="mt-1 leading-snug">
                  You are about to purge all recorded system audit logs. This operation cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#71717A] leading-relaxed">
              Before clearing logs, it is recommended to download a CSV or JSON export of the active ledger for compliance and security audit trails.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsClearConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleExecuteClearLogs}>
                Purge All Audit Logs
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
