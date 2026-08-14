'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, ShieldCheck, AlertTriangle, 
  Info, CheckCircle2, RefreshCw, Trash2, Download 
} from 'lucide-react';
import { getAuditLogs, logAuditEvent } from '@/lib/extensions/package-installer';
import { AuditLogEntry } from '@/lib/extensions/plugin-types';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const loadLogs = () => {
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs();
    }, 0);
    const handleUpdate = () => loadLogs();
    window.addEventListener('creatorpulse_audit_log_updated', handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('creatorpulse_audit_log_updated', handleUpdate);
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const handleExportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Timestamp,Action,Entity,User,Role,Severity,Details"]
      .concat(logs.map(l => `"${l.timestamp}","${l.action}","${l.entityName}","${l.user}","${l.role}","${l.severity}","${l.details}"`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `creatorpulse_extension_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear the audit logs?')) {
      localStorage.removeItem('creatorpulse_audit_logs');
      loadLogs();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Extension Audit Logs & Security Trail</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Immutable tracking ledger recording all theme activations, add-on state modifications, configuration revisions, and security events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExportLogs}
          >
            Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={loadLogs}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'success', 'info', 'warning', 'error'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-indigo-50 text-indigo-700 border border-slate-300 shadow-xs'
                  : 'bg-white text-[#71717A] border border-slate-200 hover:text-[#18181B]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[#71717A] bg-slate-50">
              <th className="py-3 px-4 font-bold">Timestamp</th>
              <th className="py-3 px-4 font-bold">Action</th>
              <th className="py-3 px-4 font-bold">Target Entity</th>
              <th className="py-3 px-4 font-bold">Details</th>
              <th className="py-3 px-4 font-bold">Admin User</th>
              <th className="py-3 px-4 font-bold">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[#18181B]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#71717A] font-medium">
                  No audit log records found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#71717A] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#18181B] whitespace-nowrap">
                    <span className="capitalize">{log.entityType}</span>: {log.entityName}
                  </td>
                  <td className="py-3 px-4 text-[#71717A] max-w-md font-medium">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-[#18181B]">
                    {log.user} <span className="text-[10px] text-[#A1A1AA]">({log.role})</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {log.severity === 'success' && <Badge variant="emerald" size="sm">Success</Badge>}
                    {log.severity === 'info' && <Badge variant="pink" size="sm">Info</Badge>}
                    {log.severity === 'warning' && <Badge variant="amber" size="sm">Warning</Badge>}
                    {log.severity === 'error' && <Badge variant="rose" size="sm">Error</Badge>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
