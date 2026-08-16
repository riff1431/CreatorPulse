'use client';

import React, { useState, useEffect } from 'react';
import { 
  Share2, Link as LinkIcon, Copy, Check, DollarSign, TrendingUp, Users, 
  MousePointerClick, Plus, Clock, CheckCircle2, XCircle, AlertTriangle, 
  Wallet, ExternalLink, QrCode, RefreshCw, Eye, X, ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

import { 
  ReferralLink, ReferralConversion, ReferralPayout, UserReferralEarnings 
} from '@/lib/referrals/types';

export default function CreatorReferralsPage() {
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [earnings, setEarnings] = useState<UserReferralEarnings | null>(null);
  const [conversions, setConversions] = useState<ReferralConversion[]>([]);
  const [payouts, setPayouts] = useState<ReferralPayout[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { showToast } = useToast();

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Form states
  const [generateForm, setGenerateForm] = useState({ campaignId: '', couponId: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: '', payoutMethod: 'bank_transfer', accountDetails: '' });
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [linksRes, earningsRes, conversionsRes, payoutsRes] = await Promise.all([
        fetch('/api/referrals?action=my_links').then(r => r.json()),
        fetch('/api/referrals?action=my_earnings').then(r => r.json()),
        fetch('/api/referrals?action=my_conversions').then(r => r.json()),
        fetch('/api/referrals?action=my_payouts').then(r => r.json()),
      ]);
      
      if (linksRes.data) setLinks(linksRes.data);
      if (earningsRes.data) setEarnings(earningsRes.data);
      if (conversionsRes.data) setConversions(conversionsRes.data);
      if (payoutsRes.data) setPayouts(payoutsRes.data);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      showToast('Failed to load referral data', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'generate_link',
          campaignId: generateForm.campaignId || undefined,
          couponId: generateForm.couponId || undefined
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        showToast('Referral link generated successfully', 'success');
        setShowGenerateModal(false);
        setGenerateForm({ campaignId: '', couponId: '' });
        fetchData();
      } else {
        showToast(data.error || 'Failed to generate link', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutForm.amount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    
    if (earnings && amount > earnings.availableForPayout) {
      showToast('Amount exceeds available balance', 'error');
      return;
    }

    setIsRequestingPayout(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_payout',
          amount,
          payoutMethod: payoutForm.payoutMethod,
          accountDetails: payoutForm.accountDetails || undefined
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        showToast('Payout requested successfully', 'success');
        setShowPayoutModal(false);
        setPayoutForm({ amount: '', payoutMethod: 'bank_transfer', accountDetails: '' });
        fetchData();
      } else {
        showToast(data.error || 'Failed to request payout', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const handleToggleLink = async (linkId: string, currentState: boolean) => {
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_link',
          linkId,
          isActive: !currentState
        })
      });
      if (res.ok) {
        showToast(`Link ${!currentState ? 'activated' : 'deactivated'}`, 'success');
        fetchData();
      } else {
        showToast('Failed to toggle link status', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copied to clipboard', 'success');
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="emerald" size="sm">Approved</Badge>;
      case 'pending': return <Badge variant="amber" size="sm">Pending</Badge>;
      case 'rejected': return <Badge variant="rose" size="sm">Rejected</Badge>;
      case 'paid': return <Badge variant="cyan" size="sm">Paid</Badge>;
      case 'completed': return <Badge variant="emerald" size="sm">Completed</Badge>;
      default: return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-[#EC4899]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="text-[#EC4899]" size={28} />
            <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Referral Program</h1>
          </div>
          <p className="text-sm text-[#71717A] mt-1 font-medium">Earn commissions by inviting users and creators to the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchData} 
            disabled={isRefreshing}
            className="text-[#71717A] border-[#F3DCE8] bg-white hover:bg-[#FFF9FC] hover:text-[#EC4899]"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowGenerateModal(true)}
            leftIcon={<Plus size={16} />}
          >
            Generate New Link
          </Button>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 border-[#F3DCE8] hover:border-[#FBCFE8] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Total Earned</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">{formatCurrency(earnings?.totalEarned)}</div>
          <div className="text-[11px] text-emerald-600 font-bold">Lifetime earnings</div>
        </Card>
        
        <Card className="p-5 space-y-2 border-[#F3DCE8] hover:border-[#FBCFE8] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Pending</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">{formatCurrency(earnings?.pendingCommission)}</div>
          <div className="text-[11px] text-amber-600 font-bold">Awaiting approval</div>
        </Card>
        
        <Card className="p-5 space-y-2 border-[#F3DCE8] hover:border-[#FBCFE8] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Available</span>
            <Wallet size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">{formatCurrency(earnings?.availableForPayout)}</div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#BE185D] font-bold">Ready for payout</span>
            {earnings && earnings.availableForPayout > 0 && (
              <button 
                onClick={() => setShowPayoutModal(true)}
                className="text-[10px] font-bold text-[#EC4899] hover:underline"
              >
                Request
              </button>
            )}
          </div>
        </Card>
        
        <Card className="p-5 space-y-2 border-[#F3DCE8] hover:border-[#FBCFE8] transition-colors bg-gradient-to-tr from-[#FFF1F7]/50 to-white">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold uppercase tracking-wider">Total Referrals</span>
            <Users size={16} className="text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#18181B]">{earnings?.totalReferrals || 0}</div>
          <div className="text-[11px] text-[#71717A] font-bold flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <span>{(earnings?.conversionRate || 0).toFixed(1)}% conversion rate</span>
          </div>
        </Card>
      </div>

      {/* Referral Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#18181B]">My Referral Links</h2>
        </div>
        
        {links.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map(link => {
              const url = link.url || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${link.referral_code || link.code}` : '');
              const isActive = link.isActive ?? link.is_active ?? true;
              
              return (
                <Card key={link.id} className={`p-5 space-y-4 transition-all ${!isActive ? 'opacity-70 bg-slate-50' : 'bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <LinkIcon size={16} className="text-[#EC4899]" />
                        <span className="font-mono font-bold text-[#18181B]">{link.referral_code || link.code}</span>
                        {!isActive && <Badge variant="slate" size="sm">Inactive</Badge>}
                      </div>
                      {(link.campaign_id || link.campaignId) && (
                        <p className="text-[11px] text-[#71717A] font-semibold flex items-center gap-1">
                          Campaign: {link.campaign_id || link.campaignId}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleToggleLink(link.id, isActive)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
                        isActive 
                          ? 'text-[#F43F5E] border-[#F43F5E]/30 hover:bg-[#FFF1F7]' 
                          : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                  
                  <div className="p-3 bg-[#FFF9FC] rounded-xl border border-[#F3DCE8] flex items-center justify-between group">
                    <span className="text-xs text-[#71717A] truncate max-w-[200px] sm:max-w-[280px] font-medium">{url}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => copyToClipboard(url, `url-${link.id}`)}
                        className="p-1.5 text-[#A1A1AA] hover:text-[#EC4899] hover:bg-[#FCE7F3] rounded-md transition-colors"
                        title="Copy Link"
                      >
                        {copiedId === `url-${link.id}` ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-[#71717A] font-bold uppercase">Clicks</p>
                      <p className="text-sm font-black text-[#18181B]">{link.click_count || link.clickCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#71717A] font-bold uppercase">Conversions</p>
                      <p className="text-sm font-black text-[#18181B]">{link.conversion_count || link.conversionCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#71717A] font-bold uppercase">Earned</p>
                      <p className="text-sm font-black text-emerald-600">{formatCurrency(link.total_earned)}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-[#F3DCE8]">
            <div className="w-16 h-16 bg-[#FFF1F7] rounded-full flex items-center justify-center mb-4 text-[#EC4899]">
              <LinkIcon size={24} />
            </div>
            <h3 className="text-lg font-black text-[#18181B] mb-2">No Referral Links Yet</h3>
            <p className="text-sm text-[#71717A] max-w-sm mb-6 font-medium">Create your first referral link to start earning commissions by sharing our platform.</p>
            <Button variant="primary" onClick={() => setShowGenerateModal(true)}>Generate First Link</Button>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion History */}
        <Card className="p-0 overflow-hidden flex flex-col h-full border-[#F3DCE8]">
          <div className="p-5 border-b border-[#F3DCE8] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Recent Conversions</h3>
              <p className="text-[10px] text-[#71717A] mt-0.5 font-medium">Users who signed up via your links.</p>
            </div>
            <MousePointerClick size={18} className="text-[#A1A1AA]" />
          </div>
          
          <div className="overflow-auto max-h-[400px]">
            {conversions.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#FFF9FC] sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Commission</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3DCE8]">
                  {conversions.map((conv) => (
                    <tr key={conv.id} className="hover:bg-[#FFF9FC]/50 transition-colors">
                      <td className="px-5 py-3 text-xs text-[#71717A] font-medium">
                        {new Date(conv.created_at || conv.createdAt || '').toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-[#18181B]">
                        {formatCurrency(conv.transaction_amount || conv.transactionAmount)}
                      </td>
                      <td className="px-5 py-3 text-xs font-black text-emerald-600">
                        +{formatCurrency(conv.commission_amount || conv.commissionAmount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {getStatusBadge(conv.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-[#71717A]">
                <p className="text-xs font-bold">No conversions yet.</p>
                <p className="text-[10px] mt-1">Share your links to get started.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Payout History */}
        <Card className="p-0 overflow-hidden flex flex-col h-full border-[#F3DCE8]">
          <div className="p-5 border-b border-[#F3DCE8] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Payout History</h3>
              <p className="text-[10px] text-[#71717A] mt-0.5 font-medium">Your withdrawal requests and status.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPayoutModal(true)}
              className="text-xs h-8 border-[#F3DCE8] text-[#EC4899] hover:bg-[#FFF1F7]"
              disabled={!earnings || earnings.availableForPayout <= 0}
            >
              Request Payout
            </Button>
          </div>
          
          <div className="overflow-auto max-h-[400px]">
            {payouts.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#FFF9FC] sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Net Amount</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Method</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#71717A] uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3DCE8]">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-[#FFF9FC]/50 transition-colors">
                      <td className="px-5 py-3 text-xs text-[#71717A] font-medium">
                        {new Date(payout.created_at || payout.createdAt || '').toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-xs font-black text-[#18181B]">
                        {formatCurrency(payout.net_amount || payout.netAmount || payout.amount)}
                      </td>
                      <td className="px-5 py-3 text-[11px] text-[#71717A] font-semibold">
                        {(payout.payout_method || payout.payoutMethod || '').replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {getStatusBadge(payout.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-[#71717A]">
                <p className="text-xs font-bold">No payouts yet.</p>
                <p className="text-[10px] mt-1">Earnings will appear here once requested.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Generate Link Modal Overlay */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-5 animate-scale-up shadow-xl border-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#18181B]">Generate New Link</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1.5">Campaign ID (Optional)</label>
                <input 
                  type="text"
                  value={generateForm.campaignId}
                  onChange={(e) => setGenerateForm({...generateForm, campaignId: e.target.value})}
                  placeholder="e.g. summer-sale-2024"
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-sm text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1.5">Coupon ID (Optional)</label>
                <input 
                  type="text"
                  value={generateForm.couponId}
                  onChange={(e) => setGenerateForm({...generateForm, couponId: e.target.value})}
                  placeholder="e.g. SAVE20"
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-sm text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                />
                <p className="text-[10px] text-[#A1A1AA] mt-1.5 font-medium">Attach a coupon to automatically apply it when users click this link.</p>
              </div>
              
              <div className="pt-2 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  isLoading={isGenerating}
                  onClick={handleGenerateLink}
                >
                  Generate Link
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Request Payout Modal Overlay */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-5 animate-scale-up shadow-xl border-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#18181B]">Request Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-[#A1A1AA] hover:text-[#18181B]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 bg-gradient-to-tr from-[#FFF1F7] to-white rounded-xl border border-[#F3DCE8] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-wider">Available to Withdraw</p>
                <p className="text-2xl font-black text-[#18181B] tracking-tight mt-0.5">
                  {formatCurrency(earnings?.availableForPayout || 0)}
                </p>
              </div>
              <div className="p-2.5 bg-[#FCE7F3] rounded-xl text-[#EC4899]"><Wallet size={18} /></div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1.5">Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] font-black">$</span>
                  <input 
                    type="number"
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})}
                    placeholder="0.00"
                    max={earnings?.availableForPayout || 0}
                    className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1.5">Payout Method</label>
                <select
                  value={payoutForm.payoutMethod}
                  onChange={(e) => setPayoutForm({...payoutForm, payoutMethod: e.target.value})}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-sm text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe Connect</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1.5">Account Details (Optional)</label>
                <textarea 
                  value={payoutForm.accountDetails}
                  onChange={(e) => setPayoutForm({...payoutForm, accountDetails: e.target.value})}
                  placeholder="PayPal email or bank details if not saved..."
                  rows={3}
                  className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-sm text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium resize-none"
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowPayoutModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  isLoading={isRequestingPayout}
                  onClick={handleRequestPayout}
                  disabled={!payoutForm.amount || parseFloat(payoutForm.amount) > (earnings?.availableForPayout || 0) || parseFloat(payoutForm.amount) <= 0}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
