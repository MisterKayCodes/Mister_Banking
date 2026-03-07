import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Toast from '../../components/ui/Toast';
import NotificationBell from '../../components/ui/NotificationBell';

// Local Components
import SupportHero from './components/SupportHero';
import SupportChat from './components/SupportChat';
import SupportForm from './components/SupportForm';

const Support = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchSupportHistory();
        // Polling for new messages every 30 seconds
        const interval = setInterval(fetchSupportHistory, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSupportHistory = async () => {
        try {
            const response = await api.get('/users/me/support/history');
            setMessages(response.data);
        } catch (error) {
            console.error('Support synchronization failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (formData) => {
        try {
            setIsSending(true);
            await api.post('/users/me/support', formData);
            setNotification({ message: "Your message has been dispatched to our concierge team.", type: 'success' });
            await fetchSupportHistory();
        } catch (error) {
            setNotification({
                message: error.response?.data?.detail || "Failed to transmit message.",
                type: 'error'
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SidebarNavigation isCollapsed={isSidebarCollapsed} userRole="customer" />

            <div className={`transition-smooth min-h-screen flex flex-col ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
                <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-8 py-4 flex justify-between items-center h-20">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">
                            Concierge Desk
                        </h1>
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                            Priority Support Active
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                            <Icon name="MessageSquare" size={20} />
                        </div>
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden lg:flex items-center justify-center p-2.5 hover:bg-muted rounded-xl transition-smooth text-muted-foreground"
                        >
                            <Icon name={isSidebarCollapsed ? 'Maximize' : 'Minimize'} size={20} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 md:px-6 lg:px-8 py-8 md:py-12 max-w-5xl mx-auto w-full flex flex-col gap-8">
                    <SupportHero />

                    <div className="flex-1 flex flex-col bg-card border border-border rounded-[2.5rem] shadow-warm-lg overflow-hidden min-h-[600px]">
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                            <SupportChat messages={messages} loading={loading} />
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-6 md:p-8 bg-muted/30 border-t border-border">
                            <SupportForm onSend={handleSendMessage} isSending={isSending} />
                        </div>
                    </div>
                </main>
            </div>

            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default Support;
