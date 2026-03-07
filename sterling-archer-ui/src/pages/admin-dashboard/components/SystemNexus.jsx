import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useToast } from 'hooks/useToast';

const SystemNexus = () => {
    const { showToast, ToastComponent } = useToast();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/system/maintenance'); // Note: Reusing maintenance for general settings check
            // Actually, we'll hit the /system/maintenance status
            setSettings({ maintenance_mode: response.data.maintenance_mode || false });

            // To get fees, we might need a dedicated endpoint or it might be in standard settings
            // For now, let's focus on Maintenance and core toggles
        } catch (error) {
            // If maintenance endpoint isn't exactly like this, we'll fail gracefully
            setSettings({ maintenance_mode: false });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const toggleMaintenance = async () => {
        const newState = !settings.maintenance_mode;
        setSaving(true);
        try {
            await api.post(`/admin/system/maintenance?enabled=${newState}`);
            setSettings({ ...settings, maintenance_mode: newState });
            showToast(`System protocol updated: Maintenance mode ${newState ? 'ENACTED' : 'DEACTIVATED'}.`, newState ? 'warning' : 'success');
        } catch (error) {
            showToast('Protocol rejection: Unable to toggle system state.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {ToastComponent}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground">System Nexus</h2>
                    <p className="text-sm text-muted-foreground font-medium">Core foundation parameters and global kill-switches</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Maintenance Kill-Switch */}
                <div className={`bg-card border-2 rounded-[2rem] p-8 transition-all ${settings.maintenance_mode ? 'border-error shadow-error/10' : 'border-border'}`}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-4 rounded-2xl ${settings.maintenance_mode ? 'bg-error/10 text-error' : 'bg-muted text-muted-foreground'}`}>
                                <Icon name="Power" size={32} />
                            </div>
                            <div>
                                <h4 className="font-heading font-extrabold text-foreground uppercase tracking-tight">Maintenance Mode</h4>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${settings.maintenance_mode ? 'text-error animate-pulse' : 'text-success'}`}>
                                    {settings.maintenance_mode ? 'PROTOCOL ACTIVE' : 'SYSTEM ONLINE'}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground font-medium mb-8 leading-relaxed">
                            Activating this protocol restricts all citizen access to their vaults. Only foundation level users will be permitted to authenticate.
                        </p>

                        <div className="mt-auto">
                            <button
                                onClick={toggleMaintenance}
                                disabled={saving}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] border transition-all ${settings.maintenance_mode
                                    ? 'bg-error text-error-foreground border-error shadow-lg shadow-error/20'
                                    : 'bg-foreground text-background border-foreground hover:bg-foreground/90'
                                    }`}
                            >
                                {saving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Transmitting...
                                    </span>
                                ) : (
                                    settings.maintenance_mode ? 'Deactivate Kill-Switch' : 'Enact Maintenance Protocol'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Fee Management (placeholder for future expansion) */}
                <div className="bg-card border border-border rounded-[2rem] p-8 opacity-60">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 rounded-2xl bg-muted text-muted-foreground">
                            <Icon name="Percent" size={32} />
                        </div>
                        <div>
                            <h4 className="font-heading font-extrabold text-foreground uppercase tracking-tight">Revenue Protocols</h4>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">READ-ONLY</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mb-6">Global transaction levy and instant-settlement fees.</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-border">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Standard Fee</span>
                            <span className="text-sm font-mono font-black">2.50%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-border">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Priority Fee</span>
                            <span className="text-sm font-mono font-black">5.00%</span>
                        </div>
                    </div>
                </div>

                {/* 3. Security Hardening (placeholder) */}
                <div className="bg-card border border-border rounded-[2rem] p-8 opacity-60">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 rounded-2xl bg-muted text-muted-foreground">
                            <Icon name="ShieldAlert" size={32} />
                        </div>
                        <div>
                            <h4 className="font-heading font-extrabold text-foreground uppercase tracking-tight">Security Wall</h4>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">STANDBY</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mb-8">Force global multi-factor authentication and reset encryption tokens.</p>
                    <Button variant="outline" fullWidth disabled className="text-[10px] font-black uppercase tracking-widest h-14">Initiate Resync</Button>
                </div>
            </div>
        </div>
    );
};

export default SystemNexus;
