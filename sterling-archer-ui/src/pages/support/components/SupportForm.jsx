import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SupportForm = ({ onSend, isSending }) => {
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.message.trim()) return;

        onSend(formData);
        setFormData({ ...formData, message: '' }); // Clear message but keep subject for follow-ups
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-3">
                        Inquiry Category
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-accent/20 transition-all text-foreground"
                        placeholder="e.g., Transaction Limit, Technical Issue, Withdrawal Request"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-accent ml-3">
                    Your Message
                </label>
                <div className="relative group">
                    <textarea
                        required
                        className="w-full bg-card border border-border rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-accent/20 transition-all min-h-[120px] resize-none pr-16"
                        placeholder="Describe your request in detail. Your privacy is our priority."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isSending || !formData.message.trim()}
                        className="absolute right-4 bottom-4 h-12 w-12 bg-foreground text-background rounded-2xl flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group-hover:shadow-accent/20"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        ) : (
                            <Icon name="Send" size={20} />
                        )}
                    </button>
                </div>
                <p className="text-[9px] text-muted-foreground px-4 opacity-70">
                    Press <span className="font-bold">Enter</span> to send, <span className="font-bold">Shift+Enter</span> for new line.
                </p>
            </div>
        </form>
    );
};

export default SupportForm;
