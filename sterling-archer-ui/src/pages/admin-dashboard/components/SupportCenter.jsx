import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import { useToast } from 'hooks/useToast';
import Button from '../../../components/ui/Button';

const SupportCenter = () => {
    const { showToast, ToastComponent } = useToast();
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [transmitting, setTransmitting] = useState(false);

    const fetchInbox = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/support/inbox');
            setInbox(response.data);
        } catch (error) {
            showToast('Failed to synchronize support inbox.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInbox();
    }, []);

    const handleReply = async (userId) => {
        if (!replyMessage.trim()) return;
        setTransmitting(true);
        try {
            await api.post(`/admin/support/${userId}/reply`, { message: replyMessage });
            showToast('Response transmitted successfully.', 'success');
            setReplyingTo(null);
            setReplyMessage('');
            fetchInbox();
        } catch (error) {
            showToast('Communication failure: Response delivery failed.', 'error');
        } finally {
            setTransmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {ToastComponent}
            <div>
                <h2 className="text-2xl font-heading font-bold text-foreground italic uppercase">Support Command Center</h2>
                <p className="text-sm text-muted-foreground font-medium">Official help desk for inquiry management and resolution</p>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-muted/30 border-b border-border px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Icon name="Inbox" size={20} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Main Support Feed</span>
                    </div>
                </div>

                <div className="flex-1 divide-y divide-border">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-black uppercase tracking-widest">Accessing secure messages...</p>
                        </div>
                    ) : inbox.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40">
                            <Icon name="MessagesSquare" size={64} />
                            <p className="text-xl font-heading font-bold italic uppercase">All inquiries resolved</p>
                            <Button onClick={fetchInbox} variant="outline" className="text-[10px] uppercase font-black uppercase tracking-widest">Refresh Feed</Button>
                        </div>
                    ) : (
                        inbox.map(msg => (
                            <div key={msg.id} className={`p-8 transition-colors ${replyingTo === msg.id ? 'bg-primary/5' : 'hover:bg-muted/10'}`}>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-2xl ${msg.is_from_admin ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'} border border-border flex items-center justify-center shrink-0 shadow-sm`}>
                                            <Icon name={msg.is_from_admin ? "ShieldCheck" : "User"} size={20} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-foreground">User #{msg.user_id}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">•</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{new Date(msg.created_at).toLocaleString()}</span>
                                            </div>
                                            <h4 className="font-heading font-bold text-foreground text-lg italic uppercase tracking-tight">{msg.subject}</h4>
                                            <div className={`bg-card border ${msg.is_from_admin ? 'border-primary/50' : 'border-border'} rounded-2xl p-4 text-sm text-foreground italic relative`}>
                                                <div className={`absolute top-0 left-4 -mt-2.5 bg-card px-2 text-[9px] font-black uppercase ${msg.is_from_admin ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {msg.is_from_admin ? 'Admin Reply' : 'Original Message'}
                                                </div>
                                                "{msg.message}"
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 pt-1">
                                        {!msg.is_from_admin && (
                                            replyingTo !== msg.id ? (
                                                <Button onClick={() => setReplyingTo(msg.id)} size="sm" className="bg-foreground text-background">
                                                    Compose Reply
                                                </Button>
                                            ) : (
                                                <button onClick={() => setReplyingTo(null)} className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground underline underline-offset-4">
                                                    Collapse Thread
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                {replyingTo === msg.id && (
                                    <div className="mt-8 ml-16 animate-in slide-in-from-top-4 duration-300">
                                        <div className="bg-card border-2 border-primary/30 rounded-3xl p-6 shadow-xl shadow-primary/5 space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon name="Reply" size={16} className="text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Official Resolution</span>
                                            </div>
                                            <textarea
                                                className="w-full bg-muted/20 border border-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px]"
                                                placeholder="Enter secure message to be transmitted to the user..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            />
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="px-6 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    Discard
                                                </button>
                                                <Button
                                                    loading={transmitting}
                                                    onClick={() => handleReply(msg.user_id)}
                                                    className="px-8 shadow-lg shadow-primary/20"
                                                >
                                                    Transmit official response
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportCenter;
