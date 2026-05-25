import React, { useState } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import { useToast } from 'hooks/useToast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LedgerTimeMachine = () => {
    const { showToast, ToastComponent } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('manual');

    // Manual Entry State
    const [manualEntry, setManualEntry] = useState({
        account_id: '',
        amount: '',
        tag: '',
        custom_date: '',
        apply_to_balance: false
    });

    // Auto-Generator State
    const [autoGen, setAutoGen] = useState({
        account_id: '',
        start_date: '',
        end_date: '',
        activity_level: 'medium',
        custom_anchors: ''
    });

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/deposits/fiat', {
                account_id: parseInt(manualEntry.account_id),
                amount: parseFloat(manualEntry.amount),
                tag: manualEntry.tag,
                custom_date: manualEntry.custom_date ? new Date(manualEntry.custom_date).toISOString() : null,
                apply_to_balance: manualEntry.apply_to_balance
            });
            showToast('Manual historical transaction created.', 'success');
            setManualEntry({ account_id: '', amount: '', tag: '', custom_date: '', apply_to_balance: false });
        } catch (error) {
            showToast('Failed to create manual entry.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoGenerate = async (e) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to generate a full historical ledger? This action cannot be easily undone.")) return;
        
        setLoading(true);
        try {
            await api.post('/admin/ledger/auto-generate', {
                account_id: parseInt(autoGen.account_id),
                start_date: autoGen.start_date,
                end_date: autoGen.end_date,
                activity_level: autoGen.activity_level,
                custom_anchors: autoGen.custom_anchors
            });
            showToast('Historical ledger successfully generated!', 'success');
            setAutoGen({ account_id: '', start_date: '', end_date: '', activity_level: 'medium', custom_anchors: '' });
        } catch (error) {
            showToast(error.response?.data?.detail || 'Failed to generate ledger.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm col-span-1 lg:col-span-2 mt-8">
            {ToastComponent}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                        <Icon name="Clock" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-heading font-bold uppercase italic">Ledger Time Machine</h3>
                        <p className="text-xs text-muted-foreground font-medium">Manipulate or generate historical transaction data.</p>
                    </div>
                </div>

                <div className="flex bg-muted/50 p-1 rounded-xl">
                    <button 
                        className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === 'manual' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab('manual')}
                    >
                        Manual Entry
                    </button>
                    <button 
                        className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === 'auto' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab('auto')}
                    >
                        Auto-Generator
                    </button>
                </div>
            </div>

            {activeTab === 'manual' ? (
                <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Target Account ID"
                            placeholder="e.g. 1"
                            value={manualEntry.account_id}
                            onChange={(e) => setManualEntry({ ...manualEntry, account_id: e.target.value })}
                            required
                        />
                        <Input
                            label="Transaction Date & Time (Optional)"
                            type="datetime-local"
                            value={manualEntry.custom_date}
                            onChange={(e) => setManualEntry({ ...manualEntry, custom_date: e.target.value })}
                        />
                        <Input
                            label="Amount (Positive=Deposit, Negative=Withdrawal)"
                            placeholder="e.g. 5000.00 or -200.00"
                            type="number"
                            step="0.01"
                            value={manualEntry.amount}
                            onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                            required
                        />
                        <Input
                            label="Transaction Tag / Description"
                            placeholder="e.g. Payment from Global Export Corp"
                            value={manualEntry.tag}
                            onChange={(e) => setManualEntry({ ...manualEntry, tag: e.target.value })}
                            required
                        />
                    </div>
                    
                    <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl cursor-pointer border border-border/50 hover:border-border transition-all">
                        <input 
                            type="checkbox" 
                            checked={manualEntry.apply_to_balance}
                            onChange={(e) => setManualEntry({ ...manualEntry, apply_to_balance: e.target.checked })}
                            className="w-5 h-5 rounded text-foreground focus:ring-foreground bg-background border-border"
                        />
                        <div>
                            <p className="text-sm font-bold">Apply to Current Balance</p>
                            <p className="text-xs text-muted-foreground">If checked, this will alter their spendable money today. If unchecked, it only adds the visual receipt.</p>
                        </div>
                    </label>

                    <Button type="submit" className="w-full" loading={loading}>Insert Historical Record</Button>
                </form>
            ) : (
                <form onSubmit={handleAutoGenerate} className="space-y-4 animate-in fade-in">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <Icon name="AlertTriangle" size={14} className="inline mr-2 mb-1" />
                            The generator will automatically calculate an opening balance to ensure the final history perfectly tallies with their current dashboard balance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Target Account ID"
                            placeholder="e.g. 1"
                            value={autoGen.account_id}
                            onChange={(e) => setAutoGen({ ...autoGen, account_id: e.target.value })}
                            required
                        />
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Activity Level</label>
                            <select 
                                className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                                value={autoGen.activity_level}
                                onChange={(e) => setAutoGen({ ...autoGen, activity_level: e.target.value })}
                            >
                                <option value="low">Low (2-3 times a month)</option>
                                <option value="medium">Medium (Weekly)</option>
                                <option value="high">High (Daily)</option>
                            </select>
                        </div>
                        <Input
                            label="Start Date"
                            type="date"
                            value={autoGen.start_date}
                            onChange={(e) => setAutoGen({ ...autoGen, start_date: e.target.value })}
                            required
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={autoGen.end_date}
                            onChange={(e) => setAutoGen({ ...autoGen, end_date: e.target.value })}
                            required
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Custom Names / Anchors (Optional)</label>
                        <textarea
                            className="w-full min-h-[80px] p-4 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-smooth resize-none"
                            placeholder="e.g. Google Payroll, Netflix, Starbucks, John Doe (Comma separated)"
                            value={autoGen.custom_anchors}
                            onChange={(e) => setAutoGen({ ...autoGen, custom_anchors: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground ml-1">These names will be randomly mixed in with AI-generated realistic company names.</p>
                    </div>

                    <Button type="submit" className="w-full bg-foreground text-background" loading={loading}>Generate Time-Machine Ledger</Button>
                </form>
            )}
        </div>
    );
};

export default LedgerTimeMachine;
