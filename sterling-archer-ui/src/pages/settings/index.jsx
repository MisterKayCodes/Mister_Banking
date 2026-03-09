import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import api from '../../api/axios';
import Toast from '../../components/ui/Toast';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Form States
    const [pinData, setPinData] = useState({ email: '', newPin: '', confirmPin: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [notifications, setNotifications] = useState({ security: true, marketing: false });

    useEffect(() => {
        // Sync theme with document class on mount
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const cachedUser = JSON.parse(localStorage.getItem('user') || 'null');

        try {
            const response = await api.get('/users/me');
            const userData = response.data;
            // Ensure full_name is present (fallback to name if needed)
            const saturatedUser = { ...userData, full_name: userData.full_name || userData.name };
            setUser(saturatedUser);

            if (cachedUser) {
                localStorage.setItem('user', JSON.stringify({ ...cachedUser, ...saturatedUser }));
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            if (cachedUser) {
                const saturatedCached = { ...cachedUser, full_name: cachedUser.full_name || cachedUser.name };
                setUser(saturatedCached);
                setNotification({ type: 'warning', message: 'Displaying cached profile data.' });
            } else {
                setNotification({ type: 'error', message: 'Failed to synchronize vault profile.' });
            }
        }
    };

    const handlePinReset = async (e) => {
        e.preventDefault();
        if (pinData.newPin.length !== 4) {
            setNotification({ type: 'error', message: 'PIN must be exactly 4 digits.' });
            return;
        }
        if (pinData.newPin !== pinData.confirmPin) {
            setNotification({ type: 'error', message: 'PINs do not match.' });
            return;
        }

        if (pinData.email.trim().toLowerCase() !== user?.email?.toLowerCase()) {
            setNotification({ type: 'error', message: 'Identity verification failed. Invalid email address.' });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/set-pin', { pin: pinData.newPin });
            setNotification({ type: 'success', message: 'Security PIN has been updated successfully.' });
            setPinData({ email: '', newPin: '', confirmPin: '' });
            fetchProfile();
        } catch (error) {
            setNotification({ type: 'error', message: error.response?.data?.detail || 'Failed to update PIN.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setNotification({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setNotification({ type: 'error', message: 'Password must be at least 6 characters.' });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/change-password', {
                old_password: passwordData.oldPassword,
                new_password: passwordData.newPassword
            });
            setNotification({ type: 'success', message: 'Login password updated successfully.' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setNotification({ type: 'error', message: error.response?.data?.detail || 'Failed to update password.' });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark');
    };

    const handleSimulatedSignOutAll = () => {
        setNotification({ type: 'success', message: 'All other sessions have been invalidated.' });
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <Helmet>
                <title>Settings Center - Sterling-Archer Trust</title>
            </Helmet>

            <SidebarNavigation userRole="customer" />

            <main className="lg:ml-64 px-4 md:px-8 py-8 max-w-5xl mx-auto transition-all duration-300">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight uppercase italic">Vault Settings</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-1">Configure your financial identity and security protocols.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Profile & Preferences */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Profile Card */}
                        <section className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                                    <Icon name="User" size={40} />
                                </div>
                                <h2 className="text-xl font-heading font-bold">{user?.full_name || 'Loading...'}</h2>
                                <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground">Status</span>
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${user?.kyc_status === 'verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                        {user?.kyc_status || 'Checking...'}
                                    </span>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground">Born</span>
                                    <span className="text-[11px] font-bold">{user?.date_of_birth || 'N/A'}</span>
                                </div>
                            </div>
                        </section>

                        {/* Display Card */}
                        <section className="bg-card border border-border rounded-[2rem] p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Interface Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon name={theme === 'dark' ? 'Moon' : 'Sun'} size={18} className="text-accent" />
                                        <span className="text-sm font-bold">Dark Mode</span>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${theme === 'dark' ? 'bg-accent/30' : 'bg-muted border border-border'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full shadow-sm transition-all ${theme === 'dark' ? 'translate-x-6 bg-accent' : 'translate-x-0 bg-muted-foreground'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon name="Bell" size={18} className="text-accent" />
                                        <span className="text-sm font-bold">Market Alerts</span>
                                    </div>
                                    <button
                                        onClick={() => setNotifications({ ...notifications, marketing: !notifications.marketing })}
                                        className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${notifications.marketing ? 'bg-accent' : 'bg-muted border border-border'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notifications.marketing ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Forms */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Personal Information */}
                        <section className="bg-card border border-border rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-info/10 p-3 rounded-2xl text-info">
                                    <Icon name="User" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-heading font-bold">Personal Profile</h2>
                                    <p className="text-xs text-muted-foreground">Manage your legal identity details.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Full Legal Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-muted border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-info/20 transition-all"
                                        value={user?.full_name || ''}
                                        onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Date of Birth</label>
                                    <input
                                        type="text"
                                        className="w-full bg-muted border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-info/20 transition-all font-mono"
                                        placeholder="YYYY-MM-DD"
                                        value={user?.date_of_birth || ''}
                                        onChange={(e) => setUser({ ...user, date_of_birth: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        onClick={async () => {
                                            setIsLoading(true);
                                            try {
                                                await api.patch('/users/me', {
                                                    full_name: user.full_name,
                                                    date_of_birth: user.date_of_birth
                                                });
                                                setNotification({ type: 'success', message: 'Identity records updated successfully.' });
                                                fetchProfile();
                                            } catch (err) {
                                                setNotification({ type: 'error', message: 'Failed to update identity records.' });
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="w-full py-4 bg-info text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? 'Updating Vault...' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Security Section */}
                        <div className="space-y-6">
                            {/* PIN Reset */}
                            <section className="bg-card border border-border rounded-[2.5rem] p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-accent/10 p-3 rounded-2xl text-accent">
                                        <Icon name="Shield" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-heading font-bold">Transaction PIN</h2>
                                        <p className="text-xs text-muted-foreground">The digital signature for your funds.</p>
                                    </div>
                                </div>

                                <form onSubmit={handlePinReset} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Confirm Identity (Email)</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-muted border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                                            placeholder="Verify your email..."
                                            value={pinData.email}
                                            onChange={(e) => setPinData({ ...pinData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">New 4-Digit PIN</label>
                                        <input
                                            type="password"
                                            maxLength={4}
                                            required
                                            className="w-full bg-muted border-none rounded-xl p-4 text-center tracking-[0.5em] text-lg focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                                            placeholder="••••"
                                            value={pinData.newPin}
                                            onChange={(e) => setPinData({ ...pinData, newPin: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Confirm PIN</label>
                                        <input
                                            type="password"
                                            maxLength={4}
                                            required
                                            className="w-full bg-muted border-none rounded-xl p-4 text-center tracking-[0.5em] text-lg focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                                            placeholder="••••"
                                            value={pinData.confirmPin}
                                            onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? 'Updating Vault...' : 'Authorize PIN Reset'}
                                        </button>
                                    </div>
                                </form>
                            </section>

                            {/* Password Change */}
                            <section className="bg-card border border-border rounded-[2.5rem] p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                                        <Icon name="Key" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-heading font-bold">Access Credentials</h2>
                                        <p className="text-xs text-muted-foreground">Protect your primary entry point.</p>
                                    </div>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-6 text-left">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-muted border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full bg-muted border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full bg-muted border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? 'Updating Key...' : 'Update Login Password'}
                                    </button>
                                </form>
                            </section>

                            {/* Danger Zone */}
                            <section className="bg-destructive/5 border border-destructive/20 rounded-[2.5rem] p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-destructive/10 p-3 rounded-2xl text-destructive">
                                        <Icon name="Zap" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-heading font-bold text-destructive">Danger Zone</h2>
                                        <p className="text-xs text-muted-foreground">High-risk administrative actions.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 bg-card border border-border rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-bold">Invalidate All Sessions</h4>
                                            <p className="text-[10px] text-muted-foreground">Immediately sign out of every device globally.</p>
                                        </div>
                                        <button
                                            onClick={handleSimulatedSignOutAll}
                                            className="px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-destructive hover:text-white transition-all shadow-sm"
                                        >
                                            Flash Wipe Sessions
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

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

export default Settings;

