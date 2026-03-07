import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useToast } from 'hooks/useToast';

const VerificationVault = () => {
    const { showToast, ToastComponent } = useToast();
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewData, setReviewData] = useState({ status: 'approved', comment: '' });

    // Rule Creation State
    const [newRule, setNewRule] = useState({ name: '', description: '', is_required: true });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pendingRes, rulesRes] = await Promise.all([
                api.get('/admin/kyc/pending-approvals'),
                api.get('/users/me/kyc/requirements')
            ]);
            setPendingSubmissions(pendingRes.data);
            setRules(rulesRes.data);
        } catch (error) {
            showToast('Registry error: Unable to verify credentials.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReview = async (subId) => {
        try {
            // Updated to match the refined fast_review logic
            await api.patch(`/admin/kyc/submissions/${subId}/review?status=${reviewData.status}${reviewData.comment ? `&comment=${reviewData.comment}` : ''}`);
            showToast(`Evidence verdict submitted: ${reviewData.status.toUpperCase()}`, 'success');
            setReviewingId(null);
            setReviewData({ status: 'approved', comment: '' });
            fetchData();
        } catch (error) {
            showToast('Operational failure: Verdict rejected by system.', 'error');
        }
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/kyc/rules', newRule);
            showToast('New mandate enacted: Registry rules updated.', 'success');
            setNewRule({ name: '', description: '', is_required: true });
            fetchData();
        } catch (error) {
            showToast('Protocol failure: Mandate enactment failed.', 'error');
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (!window.confirm("Abolish this requirement and purge associated citizen evidence?")) return;
        try {
            await api.delete(`/admin/kyc/rules/${ruleId}`);
            showToast('Mandate abolished.', 'success');
            fetchData();
        } catch (error) {
            showToast('Error abolishing requirement.', 'error');
        }
    };

    return (
        <div className="space-y-10">
            {ToastComponent}

            {/* 1. Pending Submissions */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground">Pending Verifications</h2>
                    <p className="text-sm text-muted-foreground font-medium">Review citizen evidence and issue secure verdicts</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        [1, 2].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)
                    ) : pendingSubmissions.length === 0 ? (
                        <div className="bg-card border border-border rounded-2xl p-12 text-center">
                            <Icon name="ShieldCheck" size={48} className="mx-auto mb-4 text-success opacity-20" />
                            <p className="text-muted-foreground caption">Foundation records are clean. No pending reviews.</p>
                        </div>
                    ) : (
                        pendingSubmissions.map((sub) => (
                            <div key={sub.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="p-3 bg-accent/10 text-accent rounded-xl">
                                            <Icon name="FileText" size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Citizen {sub.user_id}</span>
                                                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] font-bold rounded">SUBMISSION ID: {sub.id}</span>
                                            </div>
                                            <h4 className="font-heading font-bold text-foreground mb-2">Evidence for Mandate {sub.requirement_id}</h4>
                                            <a
                                                href={sub.document_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-xs text-accent hover:underline font-bold"
                                            >
                                                Inspect Digital Evidence
                                                <Icon name="ExternalLink" size={14} />
                                            </a>
                                        </div>
                                    </div>

                                    {reviewingId === sub.id ? (
                                        <div className="flex-1 max-w-sm space-y-4 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setReviewData({ ...reviewData, status: 'approved' })}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${reviewData.status === 'approved' ? 'bg-success text-success-foreground border-success' : 'bg-muted/30 border-border text-muted-foreground'}`}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setReviewData({ ...reviewData, status: 'rejected' })}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${reviewData.status === 'rejected' ? 'bg-error text-error-foreground border-error' : 'bg-muted/30 border-border text-muted-foreground'}`}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                            <Input
                                                placeholder="Add secure comment..."
                                                value={reviewData.comment}
                                                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                            />
                                            <div className="flex gap-2">
                                                <Button onClick={() => setReviewingId(null)} variant="ghost" className="flex-1 text-xs">Cancel</Button>
                                                <Button onClick={() => handleReview(sub.id)} className="flex-1 text-xs">Issue Verdict</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button onClick={() => setReviewingId(sub.id)} className="shrink-0 bg-foreground text-background hover:bg-foreground/90">
                                            Initiate Review
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* 2. Requirement Mandates */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground">Institutional Mandates</h2>
                    <p className="text-sm text-muted-foreground font-medium">Define and abolish global verification requirements</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Active Rules List */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Active Requirements</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {rules.map(rule => (
                                <div key={rule.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between group">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <Icon name={rule.is_required ? "AlertCircle" : "Info"} size={16} className={rule.is_required ? "text-accent" : "text-muted-foreground"} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground mb-0.5">{rule.name}</p>
                                            <p className="text-[11px] text-muted-foreground line-clamp-1">{rule.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="p-2 opacity-0 group-hover:opacity-100 text-error hover:bg-error/10 rounded-lg transition-all"
                                    >
                                        <Icon name="X" size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* New Rule Formulation */}
                    <div className="bg-card border border-border rounded-[2rem] p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Enact New Mandate</h3>
                        <form onSubmit={handleCreateRule} className="space-y-4">
                            <Input
                                label="Mandate Name"
                                placeholder="e.g., Proof of Residence"
                                value={newRule.name}
                                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Detailed Instruction"
                                placeholder="Instructions for users..."
                                value={newRule.description}
                                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                                required
                            />
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                                <input
                                    type="checkbox"
                                    checked={newRule.is_required}
                                    onChange={(e) => setNewRule({ ...newRule, is_required: e.target.checked })}
                                    id="req-toggle"
                                    className="accent-primary"
                                />
                                <label htmlFor="req-toggle" className="text-xs font-bold text-foreground">Critical Enforcement Required</label>
                            </div>
                            <Button type="submit" fullWidth className="bg-foreground text-background">
                                Publish Mandate
                            </Button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default VerificationVault;
