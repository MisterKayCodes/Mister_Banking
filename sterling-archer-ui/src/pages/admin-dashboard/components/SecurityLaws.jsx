import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import { useToast } from 'hooks/useToast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SecurityLaws = () => {
    const { showToast, ToastComponent } = useToast();
    const [loading, setLoading] = useState(true);

    // System States
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [broadcast, setBroadcast] = useState({ title: '', message: '', n_type: 'info' });

    // KYC States
    const [pendingKYC, setPendingKYC] = useState([]);
    const [kycRules, setKycRules] = useState([]);
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewData, setReviewData] = useState({ status: 'approved', comment: '' });
    const [newRule, setNewRule] = useState({ name: '', description: '', is_required: true });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [maintRes, pendingRes, rulesRes] = await Promise.all([
                api.get('/admin/system/maintenance'),
                api.get('/admin/kyc/pending-approvals'),
                api.get('/users/me/kyc/requirements') // Standard endpoint for rules
            ]);
            setMaintenanceMode(maintRes.data.maintenance_mode);
            setPendingKYC(pendingRes.data);
            setKycRules(rulesRes.data);
        } catch (error) {
            showToast('Failed to synchronize security parameters.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleMaintenance = async () => {
        const newState = !maintenanceMode;
        try {
            await api.post(`/admin/system/maintenance?enabled=${newState}`);
            setMaintenanceMode(newState);
            showToast(`System protocol: Maintenance mode ${newState ? 'enacted' : 'deactivated'}.`, newState ? 'warning' : 'success');
        } catch (error) {
            showToast('Failed to toggle storage vault access.', 'error');
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/system/broadcast?title=${broadcast.title}&message=${broadcast.message}&n_type=${broadcast.n_type}`);
            showToast('Global alert transmitted successfully.', 'success');
            setBroadcast({ title: '', message: '', n_type: 'info' });
        } catch (error) {
            showToast('Failed to transmit global alert.', 'error');
        }
    };

    const handleKYCReview = async (subId) => {
        try {
            await api.patch(`/admin/kyc/submissions/${subId}/review?status=${reviewData.status}${reviewData.comment ? `&comment=${reviewData.comment}` : ''}`);
            showToast(`Verdict issued: ${reviewData.status.toUpperCase()}`, 'success');
            setReviewingId(null);
            setReviewData({ status: 'approved', comment: '' });
            fetchData();
        } catch (error) {
            showToast('Failed to process KYC verdict.', 'error');
        }
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/kyc/rules', newRule);
            showToast('New security mandate published.', 'success');
            setNewRule({ name: '', description: '', is_required: true });
            fetchData();
        } catch (error) {
            showToast('Failed to publish security mandate.', 'error');
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {ToastComponent}
            <div>
                <h2 className="text-2xl font-heading font-bold text-foreground italic uppercase">System & Security</h2>
                <p className="text-sm text-muted-foreground font-medium">Governance, global enforcement, and identity verification</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* 1. System Controls (Maintenance & Broadcast) */}
                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                        <div className="flex items-center justify-between mb-8 overflow-hidden relative">
                            <div className="flex items-center gap-3">
                                <div className={`p-4 rounded-2xl ${maintenanceMode ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                                    <Icon name="Power" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-heading font-bold uppercase italic">Maintenance Mode</h3>
                                    <p className="text-[10px] font-black tracking-widest uppercase opacity-60">Global Access Lock</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleMaintenance}
                                className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${maintenanceMode ? 'bg-error text-white' : 'bg-foreground text-background'
                                    }`}
                            >
                                {maintenanceMode ? 'Open Vaults' : 'Enact Lockout'}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                            {maintenanceMode
                                ? "The system is currently restricted. Only administrative identities can authenticate."
                                : "Standard user authentication is active. Flip the switch to lock the system for repairs."}
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                                <Icon name="Radio" size={24} />
                            </div>
                            <h3 className="text-lg font-heading font-bold uppercase italic">Global Alert Broadcast</h3>
                        </div>
                        <form onSubmit={handleBroadcast} className="space-y-4">
                            <Input
                                label="Alert Headline"
                                placeholder="e.g. Scheduled Maintenance Notice"
                                value={broadcast.title}
                                onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                                required
                            />
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Message Body</label>
                                <textarea
                                    className="w-full bg-muted/30 border border-border rounded-2xl p-4 text-sm focus:outline-none min-h-[100px]"
                                    placeholder="Enter message for all users..."
                                    value={broadcast.message}
                                    onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                {['info', 'success', 'warning', 'error'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setBroadcast({ ...broadcast, n_type: type })}
                                        className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase border transition-all ${broadcast.n_type === type ? 'bg-foreground text-background border-foreground' : 'text-muted-foreground border-border hover:bg-muted'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <Button type="submit" fullWidth>Transmit Global Alert</Button>
                        </form>
                    </div>
                </div>

                {/* 2. KYC Governance */}
                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <Icon name="UserCheck" size={24} />
                                </div>
                                <h3 className="text-lg font-heading font-bold uppercase italic">ID Verification Queue</h3>
                            </div>
                            <span className="bg-muted px-3 py-1 rounded-full text-[10px] font-black">{pendingKYC.length} Pending</span>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
                            {loading ? (
                                <div className="text-center py-12 text-muted-foreground animate-pulse">Syncing ID database...</div>
                            ) : pendingKYC.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground font-bold italic opacity-40">Review queue empty.</div>
                            ) : pendingKYC.map(sub => (
                                <div key={sub.id} className="p-5 bg-muted/20 border border-border rounded-2xl space-y-4 transition-all hover:bg-muted/40 group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-black uppercase text-accent mb-1">User #{sub.user_id}</p>
                                            <p className="text-sm font-bold text-foreground">Evidence for Mandate #{sub.requirement_id}</p>
                                        </div>
                                        <a href={sub.document_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary p-2">
                                            <Icon name="ExternalLink" size={18} />
                                        </a>
                                    </div>

                                    {reviewingId === sub.id ? (
                                        <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setReviewData({ ...reviewData, status: 'approved' })}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${reviewData.status === 'approved' ? 'bg-success text-white border-success' : 'border-border text-muted-foreground'}`}
                                                > Approve </button>
                                                <button
                                                    onClick={() => setReviewData({ ...reviewData, status: 'rejected' })}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${reviewData.status === 'rejected' ? 'bg-error text-white border-error' : 'border-border text-muted-foreground'}`}
                                                > Reject </button>
                                            </div>
                                            <textarea
                                                className="w-full bg-card border border-border rounded-xl p-3 text-xs focus:outline-none min-h-[60px]"
                                                placeholder="Verdict narrative (optional)..."
                                                value={reviewData.comment}
                                                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => setReviewingId(null)} className="flex-1 text-[10px] font-bold text-muted-foreground">Abort</button>
                                                <Button fullWidth className="h-9 text-xs" onClick={() => handleKYCReview(sub.id)}>Publish Verdict</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReviewingId(sub.id)}
                                            className="w-full py-2 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                                        > Initiate Review </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* KYC Mandates Section */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <Icon name="Gavel" size={24} />
                        </div>
                        <h3 className="text-lg font-heading font-bold uppercase italic">Security Mandates</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 mb-2">Active Enforcement Rules</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {kycRules.map(rule => (
                                <div key={rule.id} className="p-4 bg-muted/10 border border-border rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon name={rule.is_required ? "BadgeCheck" : "Info"} size={18} className={rule.is_required ? "text-primary" : "text-muted-foreground"} />
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{rule.name}</p>
                                            <p className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">{rule.description}</p>
                                        </div>
                                    </div>
                                    <button className="text-muted-foreground hover:text-error transition-colors">
                                        <Icon name="Trash2" size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-l border-border pl-8">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Enact New Mandate</label>
                        <form onSubmit={handleCreateRule} className="space-y-4">
                            <Input
                                label="Rule Title"
                                placeholder="e.g. Utility Bill"
                                value={newRule.name}
                                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Requirement Logic"
                                placeholder="Evidence instructions..."
                                value={newRule.description}
                                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                                required
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={newRule.is_required}
                                    onChange={(e) => setNewRule({ ...newRule, is_required: e.target.checked })}
                                    id="req-set"
                                    className="accent-primary"
                                />
                                <label htmlFor="req-set" className="text-xs font-bold text-foreground">Mandatory Participation</label>
                            </div>
                            <Button type="submit" fullWidth variant="outline">Publish Rule</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityLaws;
