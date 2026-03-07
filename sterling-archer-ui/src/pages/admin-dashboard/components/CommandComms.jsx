import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useToast } from 'hooks/useToast';

const CommandComms = () => {
    const { showToast, ToastComponent } = useToast();
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');

    // Broadcast State
    const [broadcast, setBroadcast] = useState({ title: '', message: '', n_type: 'info' });

    const fetchInbox = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/support/inbox');
            setInbox(response.data);
        } catch (error) {
            showToast('Communications failure: Unable to sync inbox.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInbox();
        const interval = setInterval(fetchInbox, 60000); // Sync every minute
        return () => clearInterval(interval);
    }, []);

    const handleReply = async (userId) => {
        if (!replyMessage.trim()) return;
        try {
            await api.post(`/admin/support/${userId}/reply`, { message: replyMessage });
            showToast(`Response transmitted to Citizen ${userId}.`, 'success');
            setReplyingTo(null);
            setReplyMessage('');
            fetchInbox();
        } catch (error) {
            showToast('Transmission error: Response delivery failed.', 'error');
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/system/broadcast?title=${broadcast.title}&message=${broadcast.message}&n_type=${broadcast.n_type}`);
            showToast('Global broadcast transmitted successfully.', 'success');
            setBroadcast({ title: '', message: '', n_type: 'info' });
        } catch (error) {
            showToast('Broadcast failure: System-wide alert suppressed.', 'error');
        }
    };

    return (
        <div className="space-y-10">
            {ToastComponent}

            {/* 1. Global Broadcast Terminal */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 border border-accent/20 text-accent rounded-2xl">
                        <Icon name="Radio" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-heading font-bold text-foreground">Emergency Broadcast</h2>
                        <p className="text-sm text-muted-foreground font-medium">Transmit mandatory system-wide intelligence to all citizens</p>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    <form onSubmit={handleBroadcast} className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <Input
                                label="Broadcast Headline"
                                placeholder="System update, security alert, etc."
                                value={broadcast.title}
                                onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                                required
                            />
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 px-1">Mandatory Intelligence</label>
                                <textarea
                                    className="w-full bg-muted/30 border border-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]"
                                    placeholder="Enter the message to be transmitted to all terminal users..."
                                    value={broadcast.message}
                                    onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-6 lg:border-l lg:border-border lg:pl-8">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">Alert Classification</label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'info', label: 'Standard Intelligence', color: 'bg-accent' },
                                        { id: 'success', label: 'Operational Success', color: 'bg-success' },
                                        { id: 'warning', label: 'Security Warning', color: 'bg-warning' },
                                        { id: 'error', label: 'Critical Alert', color: 'bg-error' },
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setBroadcast({ ...broadcast, n_type: type.id })}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${broadcast.n_type === type.id ? 'bg-card border-border shadow-sm ring-1 ring-border' : 'opacity-60 border-transparent hover:opacity-100'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${type.color}`} />
                                            <span className="text-xs font-bold text-foreground">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" fullWidth size="lg">Initiate Broadcast</Button>
                        </div>
                    </form>
                </div>
            </section>

            {/* 2. Private Client Relations Inbox */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-2xl">
                        <Icon name="Inbox" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-heading font-bold text-foreground">Communications Inbox</h2>
                        <p className="text-sm text-muted-foreground font-medium">Manage pending private client inquiries</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)
                    ) : inbox.length === 0 ? (
                        <div className="bg-card border border-border rounded-3xl p-12 text-center">
                            <Icon name="MessagesSquare" size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground caption font-bold uppercase tracking-widest text-xs">Foundation comms clear.</p>
                        </div>
                    ) : (
                        inbox.map((msg) => (
                            <div key={msg.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                            <Icon name="User" size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">CITIZEN {msg.user_id}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium leading-none">•</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">{new Date(msg.created_at).toLocaleString()}</span>
                                            </div>
                                            <h4 className="font-bold text-foreground mb-1">{msg.subject}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2 italic leading-relaxed">"{msg.message}"</p>
                                        </div>
                                    </div>

                                    {replyingTo === msg.id ? (
                                        <div className="flex-1 max-w-md animate-in slide-in-from-right-4 duration-300">
                                            <textarea
                                                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs mb-3 focus:outline-none min-h-[80px]"
                                                placeholder="Enter secure response..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => setReplyingTo(null)} className="flex-1 py-2 text-[10px] font-black uppercase text-muted-foreground hover:text-foreground">Abort</button>
                                                <Button onClick={() => handleReply(msg.user_id)} className="flex-1 text-xs">Transmit Response</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button onClick={() => setReplyingTo(msg.id)} variant="outline" className="shrink-0 text-xs border-accent/20 text-accent hover:bg-accent/5">
                                            Compose Response
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default CommandComms;
