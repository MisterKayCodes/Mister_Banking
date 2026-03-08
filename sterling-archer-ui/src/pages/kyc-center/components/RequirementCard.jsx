import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../api/axios';

const RequirementCard = ({ requirement, submission, isVerified, onSubmit, isSubmitting }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [mode, setMode] = useState(null); // 'file' or 'link'

    const status = submission?.status || 'missing';

    const getStatusConfig = (s) => {
        if (isVerified) return { color: 'text-success', bg: 'bg-success/5', border: 'border-success/20', icon: 'CheckCircle', label: 'Verified' };
        switch (s) {
            case 'approved': return { color: 'text-success', bg: 'bg-success/5', border: 'border-success/20', icon: 'CheckCircle', label: 'Verified' };
            case 'pending': return { color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/20', icon: 'Clock', label: 'Under Review' };
            case 'rejected': return { color: 'text-error', bg: 'bg-error/5', border: 'border-error/20', icon: 'AlertCircle', label: 'Rejected' };
            default: return { color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border', icon: 'FilePlus', label: 'Action Required' };
        }
    };

    const config = getStatusConfig(status);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/users/me/kyc/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const uploadedUrl = response.data.document_url;
            await onSubmit(uploadedUrl);
            setMode(null);
            setShowOptions(false);
        } catch (error) {
            console.error("The upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleUrlSubmit = async (e) => {
        e.preventDefault();
        if (urlInput.trim()) {
            await onSubmit(urlInput);
            setMode(null);
            setShowOptions(false);
            setUrlInput('');
        }
    };

    const reset = () => {
        setMode(null);
        setShowOptions(false);
    };

    return (
        <div className={`group relative bg-card border ${config.border} rounded-[2rem] p-6 transition-all duration-300 hover:shadow-warm-md`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
                    <Icon name={config.icon} size={20} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${config.bg} ${config.color} ${config.border}`}>
                    {config.label}
                </span>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-heading font-bold text-foreground mb-1">{requirement.name}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {requirement.description || "Provide valid digital proof for this requirement."}
                </p>
            </div>

            {status !== 'approved' && !isVerified && (
                <div className="space-y-3">
                    {!showOptions ? (
                        <button
                            onClick={() => setShowOptions(true)}
                            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border bg-muted border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {status === 'missing' ? 'Submit Proof' : 'Update Proof'}
                            </span>
                            <Icon name="ArrowRight" size={14} />
                        </button>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-2 duration-200">
                            {!mode ? (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="w-full h-12 flex items-center justify-center gap-2 bg-accent/10 text-accent rounded-xl text-[10px] font-black uppercase hover:bg-accent/20 transition-all border border-accent/20"
                                    >
                                        <Icon name="Camera" size={16} />
                                        Upload Photo/Video
                                    </button>
                                    <button
                                        onClick={() => setMode('link')}
                                        className="w-full h-12 flex items-center justify-center gap-2 bg-muted text-foreground rounded-xl text-[10px] font-black uppercase hover:bg-border transition-all border border-border"
                                    >
                                        <Icon name="Link" size={16} />
                                        Paste Link
                                    </button>
                                    <button
                                        onClick={reset}
                                        className="w-full py-2 text-[9px] text-muted-foreground uppercase font-bold hover:text-foreground"
                                    >
                                        Cancel
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*,video/*"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            ) : (
                                <form onSubmit={handleUrlSubmit} className="space-y-3">
                                    <input
                                        type="url"
                                        autoFocus
                                        required
                                        className="w-full bg-muted border-border rounded-xl px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-accent/20 transition-all"
                                        placeholder="https://storage.link/your-doc.pdf"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-foreground text-background text-[10px] font-black uppercase py-3 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Processing...' : 'Submit Link'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode(null)}
                                            className="px-4 py-3 border border-border rounded-xl hover:bg-muted transition-all"
                                        >
                                            <Icon name="X" size={14} />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            )}

            {(uploading || isSubmitting) && mode === 'file' && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-accent/20 overflow-hidden rounded-b-[2rem]">
                    <div className="h-full bg-accent animate-progress w-full" style={{ animation: 'progress 1s infinite' }} />
                </div>
            )}

            {submission?.admin_comment && (
                <div className="mt-4 p-3 bg-error/5 border border-error/10 rounded-xl">
                    <p className="text-[10px] text-error font-medium italic">
                        " {submission.admin_comment} "
                    </p>
                </div>
            )}
        </div>
    );
};

export default RequirementCard;
