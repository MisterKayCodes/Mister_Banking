import React from 'react';
import Icon from '../../../components/AppIcon';

const SupportChat = ({ messages, loading }) => {
    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className="w-2/3 h-24 bg-muted animate-pulse rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                <div className="p-6 bg-muted rounded-full">
                    <Icon name="MessagesSquare" size={48} className="text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-lg font-heading font-bold">Start a Conversation</h3>
                    <p className="text-sm max-w-xs mx-auto">Your communication history with our support team will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-4">
            {messages.map((msg, index) => {
                const isAdmin = msg.is_from_admin;
                const showAvatar = index === 0 || messages[index - 1].is_from_admin !== isAdmin;

                return (
                    <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                        <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] group ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                            {/* Avatar / Icon */}
                            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-accent text-white shadow-lg' : 'bg-muted text-muted-foreground'
                                } ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                <Icon name={isAdmin ? 'UserCheck' : 'User'} size={14} />
                            </div>

                            {/* Message Bubble */}
                            <div className="space-y-1">
                                <div className={`px-5 py-4 rounded-2xl shadow-sm border ${isAdmin
                                        ? 'bg-card border-border rounded-tl-none text-foreground'
                                        : 'bg-foreground border-foreground rounded-tr-none text-background'
                                    }`}>
                                    {msg.subject && (
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isAdmin ? 'text-accent' : 'text-accent'
                                            }`}>
                                            Re: {msg.subject}
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                        {msg.message}
                                    </p>
                                </div>

                                <p className={`text-[9px] font-bold uppercase tracking-tighter text-muted-foreground ${isAdmin ? 'text-left' : 'text-right'
                                    }`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {isAdmin ? 'Concierge' : 'Identity Verified'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SupportChat;
