import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import api from '../../api/axios';
import Toast from '../../components/ui/Toast';

const Settings = () => {
    const [formData, setFormData] = useState({ email: '', newPin: '', confirmPin: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const handlePinReset = async (e) => {
        e.preventDefault();
        if (formData.newPin.length !== 4 || formData.confirmPin.length !== 4) {
            setNotification({ type: 'error', message: 'PIN must be exactly 4 digits.' });
            return;
        }
        if (formData.newPin !== formData.confirmPin) {
            setNotification({ type: 'error', message: 'PINs do not match.' });
            return;
        }

        // Verify email matches the logged in user before allowing reset.
        // In a real system, you'd send an email OTP, but to simulate security internally:
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const storedEmail = user?.email || '';
        const inputEmail = formData.email || '';

        if (!user || storedEmail.trim().toLowerCase() !== inputEmail.trim().toLowerCase()) {
            setNotification({ type: 'error', message: 'Identity verification failed. Invalid email address.' });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/set-pin', { pin: formData.newPin });
            setNotification({ type: 'success', message: 'Security PIN has been updated successfully.' });
            setFormData({ email: '', newPin: '', confirmPin: '' });

            // Update local storage
            user.has_pin = true;
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            setNotification({ type: 'error', message: error.response?.data?.detail || 'Failed to update PIN.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Helmet>
                <title>Account Settings - Sterling-Archer Trust</title>
            </Helmet>

            <SidebarNavigation userRole="customer" />

            <main className="lg:ml-64 px-4 md:px-8 py-8 max-w-4xl mx-auto transition-all duration-300">
                <header className="mb-10">
                    <h1 className="text-3xl font-heading font-bold mb-2">Account Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage your security and preferences.</p>
                </header>

                <section className="bg-card border border-border rounded-[2.5rem] p-8 mb-8">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                        <div className="bg-accent/10 p-3 rounded-2xl text-accent">
                            <Icon name="Shield" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold">Security & Authorization</h2>
                            <p className="text-xs text-muted-foreground mt-1">Reset your 4-digit transaction PIN.</p>
                        </div>
                    </div>

                    <form onSubmit={handlePinReset} className="max-w-md space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-2">
                                Verify Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full bg-muted border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-2">
                                    New 4-Digit PIN
                                </label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    required
                                    className="w-full bg-muted border-none rounded-xl p-4 text-center tracking-[0.5em] text-lg focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                                    placeholder="••••"
                                    value={formData.newPin}
                                    onChange={(e) => setFormData({ ...formData, newPin: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-2">
                                    Confirm PIN
                                </label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    required
                                    className="w-full bg-muted border-none rounded-xl p-4 text-center tracking-[0.5em] text-lg focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                                    placeholder="••••"
                                    value={formData.confirmPin}
                                    onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || formData.newPin.length !== 4 || formData.confirmPin.length !== 4}
                            className="py-4 px-6 bg-foreground text-background rounded-xl font-bold text-sm tracking-wide hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Update Transaction PIN'}
                        </button>
                    </form>
                </section>
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
