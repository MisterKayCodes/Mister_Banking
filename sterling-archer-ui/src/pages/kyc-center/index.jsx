import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Toast from '../../components/ui/Toast';
import NotificationBell from '../../components/ui/NotificationBell';

// Local Components
import KYCHero from './components/KYCHero';
import RequirementCard from './components/RequirementCard';
import SubmissionHistory from './components/SubmissionHistory';

const KYCCenter = () => {
    const [requirements, setRequirements] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [notification, setNotification] = useState(null);
    const [submittingId, setSubmittingId] = useState(null);

    useEffect(() => {
        fetchKYCData();
    }, []);

    const fetchKYCData = async () => {
        try {
            setLoading(true);
            const [reqRes, statusRes] = await Promise.all([
                api.get('/users/me/kyc/requirements'),
                api.get('/users/me/kyc/status')
            ]);
            setRequirements(reqRes.data);
            setStatus(statusRes.data);
        } catch (error) {
            console.error('Surveillance failure:', error);
            setNotification({ message: "Verification system synchronization failed.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDoc = async (requirementId, documentUrl) => {
        try {
            setSubmittingId(requirementId);
            await api.post('/users/me/kyc/submit', {
                requirement_id: requirementId,
                document_url: documentUrl
            });
            setNotification({ message: "Document submitted for review successfully.", type: 'success' });
            await fetchKYCData(); // Refresh folder
        } catch (error) {
            setNotification({
                message: error.response?.data?.detail || "Document submission failed.",
                type: 'error'
            });
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SidebarNavigation isCollapsed={isSidebarCollapsed} userRole="customer" />

            <div className={`transition-smooth min-h-screen flex flex-col ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
                <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-8 py-4 flex justify-between items-center h-20">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">
                            Verification Center
                        </h1>
                        <div className={`hidden md:flex items-center gap-2 px-3 py-1 ${status?.is_fully_verified ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'} rounded-full text-[10px] font-black uppercase tracking-widest border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status?.is_fully_verified ? 'bg-success' : 'bg-warning animate-pulse'}`}></span>
                            {status?.is_fully_verified ? 'Account Verified' : 'Action Required'}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                            <Icon name="Shield" size={20} />
                        </div>
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden lg:flex items-center justify-center p-2.5 hover:bg-muted rounded-xl transition-smooth text-muted-foreground"
                        >
                            <Icon name={isSidebarCollapsed ? 'Maximize' : 'Minimize'} size={20} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 md:px-6 lg:px-8 py-8 md:py-12 max-w-7xl mx-auto w-full">
                    <KYCHero
                        status={status}
                        requirementsCount={requirements.length}
                        loading={loading}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-heading font-bold text-foreground">Document Requirements</h2>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-lg">
                                    {requirements.length} Items Requested
                                </span>
                            </div>

                            {loading ? (
                                [1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-[2rem]" />)
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {requirements.map(req => {
                                        const submission = status?.submissions.find(s => s.requirement_id === req.id);
                                        return (
                                            <RequirementCard
                                                key={req.id}
                                                requirement={req}
                                                submission={submission}
                                                onSubmit={(url) => handleSubmitDoc(req.id, url)}
                                                isSubmitting={submittingId === req.id}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-8">
                            <SubmissionHistory submissions={status?.submissions || []} loading={loading} />

                            <div className="bg-accent/5 border border-accent/10 rounded-3xl p-6">
                                <div className="flex items-center gap-3 mb-4 text-accent">
                                    <Icon name="Info" size={20} />
                                    <h4 className="font-heading font-bold text-sm uppercase tracking-tighter">Verification Policy</h4>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Our compliance engine requires high-resolution documentation for all citizens.
                                    Standard review time is 24-48 hours. Once all required documents are marked
                                    <span className="text-success font-bold mx-1">APPROVED</span>, your account limits will be automatically upgraded.
                                </p>
                            </div>
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

export default KYCCenter;
