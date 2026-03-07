import React from 'react';
import Icon from '../../../components/AppIcon';

const SubmissionHistory = ({ submissions, loading }) => {
    if (loading) {
        return <div className="w-full h-64 bg-muted animate-pulse rounded-3xl" />;
    }

    return (
        <div className="bg-card border border-border rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-heading font-bold text-sm uppercase tracking-tighter">Audit Trail</h4>
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                    <Icon name="Activity" size={16} />
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="py-12 text-center opacity-40">
                    <Icon name="Search" size={32} className="mx-auto mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No history found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {submissions.slice().reverse().map((sub) => (
                        <div key={sub.id} className="p-4 bg-muted/40 rounded-2xl border border-transparent hover:border-border transition-all">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-foreground truncate">{sub.requirement?.name || "Requirement #" + sub.requirement_id}</p>
                                    <p className="text-[9px] text-muted-foreground font-mono truncate">{sub.document_url}</p>
                                </div>
                                <span className={`shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${sub.status === 'approved' ? 'bg-success/10 text-success' :
                                        sub.status === 'rejected' ? 'bg-error/10 text-error' :
                                            'bg-warning/10 text-warning'
                                    }`}>
                                    {sub.status}
                                </span>
                            </div>
                            <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
                                {new Date(sub.created_at).toLocaleDateString()} at {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubmissionHistory;
