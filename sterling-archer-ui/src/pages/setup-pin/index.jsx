import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import api from '../../api/axios';
import AuthLayout from '../../components/ui/AuthLayout';

const SetupPin = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (pin.length !== 4 || confirmPin.length !== 4) {
            setError('PIN must be exactly 4 digits.');
            return;
        }
        if (pin !== confirmPin) {
            setError('PINs do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/set-pin', { pin });

            // Update local storage so we don't get routed back here
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.has_pin = true;
                localStorage.setItem('user', JSON.stringify(user));
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to set PIN. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Setup Security PIN - Sterling-Archer Trust</title>
            </Helmet>
            <AuthLayout>
                <div className="space-y-8 text-center">
                    <div className="mx-auto bg-accent/20 text-accent rounded-full w-16 h-16 flex items-center justify-center">
                        <Icon name="Lock" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
                            Secure Your Vault
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Please create a 4-digit security PIN. This will be required for all transfers and cryptocurrency executions.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-2">
                                    4-Digit PIN
                                </label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    required
                                    className="w-full bg-muted border-none rounded-2xl p-5 text-center tracking-[1em] text-2xl focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                                    placeholder="••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-2">
                                    Confirm 4-Digit PIN
                                </label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    required
                                    className="w-full bg-muted border-none rounded-2xl p-5 text-center tracking-[1em] text-2xl focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                                    placeholder="••••"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-error/10 border border-error/20 rounded-xl">
                                <Icon name="AlertCircle" size={16} color="var(--color-error)" />
                                <p className="text-sm text-error">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || pin.length !== 4 || confirmPin.length !== 4}
                            className="w-full py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-[0.1em] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Securing...' : 'Set Security PIN'}
                        </button>
                    </form>
                </div>
            </AuthLayout>
        </>
    );
};

export default SetupPin;
