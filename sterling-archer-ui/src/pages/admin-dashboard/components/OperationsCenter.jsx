import React, { useState } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useToast } from 'hooks/useToast';

const OperationsCenter = () => {
    const { showToast, ToastComponent } = useToast();
    const [targetId, setTargetId] = useState('');
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState('balance'); // balance, profile, maintenance, nuclear

    // 1. Balance Edit State
    const [newBalance, setNewBalance] = useState('');

    // 2. Profile Edit State
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        password: ''
    });

    const handleBalanceUpdate = async (e) => {
        e.preventDefault();
        if (!targetId || !newBalance) return;
        setLoading(true);
        try {
            await api.patch(`/admin/accounts/${targetId}/stealth-balance`, { new_balance: parseFloat(newBalance) });
            showToast(`Asset allocation adjusted for Account ${targetId}.`, 'success');
            setNewBalance('');
        } catch (error) {
            showToast('Authorization failure: Balance intervention rejected.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!targetId) return;
        setLoading(true);
        try {
            const data = {};
            if (profileData.full_name) data.full_name = profileData.full_name;
            if (profileData.email) data.email = profileData.email;
            if (profileData.password) data.password = profileData.password;

            await api.patch(`/admin/users/${targetId}/edit-profile`, data);
            showToast(`Identity records updated for Citizen ${targetId}.`, 'success');
            setProfileData({ full_name: '', email: '', password: '' });
        } catch (error) {
            showToast('Operational failure: Identity rewrite denied.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNuclearWipe = async () => {
        if (!targetId) return;
        if (!window.confirm("CRITICAL: This will permanently erase this identity and all associated assets from the timeline. Proceed with extreme caution. This action cannot be undone.")) return;

        setLoading(true);
        try {
            await api.delete(`/admin/users/${targetId}/nuclear`);
            showToast(`Citizen ${targetId} has been successfully wiped from existence.`, 'success');
            setTargetId('');
        } catch (error) {
            showToast('Protocol failure: Nuclear strike aborted.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {ToastComponent}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground">Operations Control</h2>
                    <p className="text-sm text-muted-foreground font-medium">Active intervention and ledger manipulation protocols</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Protocol Selection */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Select Active Protocol</h3>
                    {[
                        { id: 'balance', label: 'Balance Intervention', icon: 'PlusCircle', desc: 'Stealth-adjust account totals' },
                        { id: 'profile', label: 'Identity Rewrite', icon: 'UserCircle', desc: 'Modify core citizen records' },
                        { id: 'nuclear', label: 'Nuclear Wipe', icon: 'Trash2', desc: 'Permanent registry erasure', danger: true },
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setAction(p.id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all ${action === p.id
                                ? (p.danger ? 'bg-error/10 border-error/20' : 'bg-accent/10 border-accent/20 shadow-sm')
                                : 'bg-card border-border hover:bg-muted/50'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <Icon name={p.icon} size={18} className={action === p.id ? (p.danger ? 'text-error' : 'text-accent') : 'text-muted-foreground'} />
                                <span className={`font-bold text-sm ${action === p.id ? (p.danger ? 'text-error' : 'text-foreground') : 'text-muted-foreground'}`}>
                                    {p.label}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium pl-7">{p.desc}</p>
                        </button>
                    ))}
                </div>

                {/* Direct Action Terminal */}
                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-[2rem] p-8 shadow-warm-lg">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-foreground text-background rounded-2xl">
                                <Icon name="Cpu" size={24} />
                            </div>
                            <div>
                                <h4 className="font-heading font-bold text-lg uppercase tracking-tight">Access Terminal</h4>
                                <p className="text-xs text-muted-foreground font-medium">Foundation authorization required for all commands</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Input
                                label="Target Identifier (User/Account ID)"
                                placeholder="Enter ID..."
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                            />

                            {action === 'balance' && (
                                <form onSubmit={handleBalanceUpdate} className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <Input
                                        label="New Balance Allocation"
                                        type="number"
                                        placeholder="0.00"
                                        value={newBalance}
                                        onChange={(e) => setNewBalance(e.target.value)}
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        loading={loading}
                                        className="bg-accent text-accent-foreground border-accent-foreground/10"
                                    >
                                        Execute Stealth Adjustment
                                    </Button>
                                </form>
                            )}

                            {action === 'profile' && (
                                <form onSubmit={handleProfileUpdate} className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <Input
                                        label="Full Name Rewrite"
                                        placeholder="New name..."
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    />
                                    <Input
                                        label="Secure Email Update"
                                        placeholder="New email..."
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                    <Input
                                        label="New Encryption Key (Password)"
                                        type="password"
                                        placeholder="Leave blank to retain original"
                                        value={profileData.password}
                                        onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                                    />
                                    <Button type="submit" fullWidth loading={loading}>
                                        Commit Identity Changes
                                    </Button>
                                </form>
                            )}

                            {action === 'nuclear' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="p-6 bg-error/5 border border-error/10 rounded-2xl">
                                        <div className="flex items-start gap-3">
                                            <Icon name="AlertOctagon" size={20} className="text-error mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-error mb-1">DANGER: Permanent Purge</p>
                                                <p className="text-xs text-error/80 leading-relaxed">
                                                    Executing this command will destroy all fiat accounts, digital vaults,
                                                    transaction histories, and identity records for the target ID.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleNuclearWipe}
                                        fullWidth
                                        loading={loading}
                                        variant="destructive"
                                    >
                                        Authorize Nuclear Wipe
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationsCenter;
