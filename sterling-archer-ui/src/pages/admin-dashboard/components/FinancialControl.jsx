import React, { useState } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import { useToast } from 'hooks/useToast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FinancialControl = () => {
    const { showToast, ToastComponent } = useToast();
    const [loading, setLoading] = useState(false);

    // States for various actions
    const [stealthId, setStealthId] = useState('');
    const [stealthBalance, setStealthBalance] = useState('');

    const [deleteAcctId, setDeleteAcctId] = useState('');
    const [deleteTxId, setDeleteTxId] = useState('');

    const [manualDeposit, setManualDeposit] = useState({
        account_id: '',
        amount: '',
        tag: ''
    });

    const handleStealthEdit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/admin/accounts/${stealthId}/stealth-balance`, { new_balance: parseFloat(stealthBalance) });
            showToast('Account balance rewritten successfully.', 'success');
            setStealthId('');
            setStealthBalance('');
        } catch (error) {
            showToast('Failed to execute stealth edit.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleManualDeposit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/deposits/fiat', {
                account_id: parseInt(manualDeposit.account_id),
                amount: parseFloat(manualDeposit.amount),
                tag: manualDeposit.tag
            });
            showToast('Manual deposit executed and record created.', 'success');
            setManualDeposit({ account_id: '', amount: '', tag: '' });
        } catch (error) {
            showToast('Failed to execute manual deposit.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (!window.confirm("Permanently delete this bank account? This history will be erased.")) return;
        setLoading(true);
        try {
            await api.delete(`/admin/accounts/${deleteAcctId}`);
            showToast('Vault has been closed and purged.', 'success');
            setDeleteAcctId('');
        } catch (error) {
            showToast('Failed to delete account.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async (e) => {
        e.preventDefault();
        if (!window.confirm("Erase this transaction record forever?")) return;
        setLoading(true);
        try {
            await api.delete(`/admin/transactions/${deleteTxId}`);
            showToast('Transaction has been erased from history.', 'success');
            setDeleteTxId('');
        } catch (error) {
            showToast('Failed to erase transaction.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {ToastComponent}
            <div>
                <h2 className="text-2xl font-heading font-bold text-foreground italic uppercase">Financial Control</h2>
                <p className="text-sm text-muted-foreground font-medium">Manage transactions, account balances, and vault survival</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Manual Deposits */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-success/10 text-success rounded-2xl">
                            <Icon name="PlusCircle" size={24} />
                        </div>
                        <h3 className="text-lg font-heading font-bold uppercase italic">Manual Deposit</h3>
                    </div>
                    <form onSubmit={handleManualDeposit} className="space-y-4">
                        <Input
                            label="Target Account ID"
                            placeholder="e.g. 1"
                            value={manualDeposit.account_id}
                            onChange={(e) => setManualDeposit({ ...manualDeposit, account_id: e.target.value })}
                            required
                        />
                        <Input
                            label="Deposit Amount"
                            placeholder="e.g. 5000.00"
                            type="number"
                            step="0.01"
                            value={manualDeposit.amount}
                            onChange={(e) => setManualDeposit({ ...manualDeposit, amount: e.target.value })}
                            required
                        />
                        <Input
                            label="Transaction Tag (Publicly visible)"
                            placeholder="e.g. Payment from Global Export Corp"
                            value={manualDeposit.tag}
                            onChange={(e) => setManualDeposit({ ...manualDeposit, tag: e.target.value })}
                            required
                        />
                        <Button type="submit" fullWidth loading={loading}>Execute Deposit</Button>
                    </form>
                </div>

                {/* Stealth Balance Adjustment */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <Icon name="Zap" size={24} />
                        </div>
                        <h3 className="text-lg font-heading font-bold uppercase italic">Stealth Edit</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6 font-medium italic">Instantly rewrite an account balance without creating a transaction record.</p>
                    <form onSubmit={handleStealthEdit} className="space-y-4">
                        <Input
                            label="Target Account ID"
                            placeholder="e.g. 1"
                            value={stealthId}
                            onChange={(e) => setStealthId(e.target.value)}
                            required
                        />
                        <Input
                            label="New Total Balance"
                            placeholder="e.g. 1000000.00"
                            type="number"
                            step="0.01"
                            value={stealthBalance}
                            onChange={(e) => setStealthBalance(e.target.value)}
                            required
                        />
                        <Button type="submit" fullWidth loading={loading} className="bg-foreground text-background">Rewrite History</Button>
                    </form>
                </div>

                {/* Delete Transaction */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-destructive/10 text-destructive rounded-2xl">
                            <Icon name="Eraser" size={24} />
                        </div>
                        <h3 className="text-lg font-heading font-bold uppercase italic">Delete Mistakes</h3>
                    </div>
                    <form onSubmit={handleDeleteTransaction} className="space-y-4">
                        <Input
                            label="Transaction ID to Erase"
                            placeholder="Enter TX ID"
                            value={deleteTxId}
                            onChange={(e) => setDeleteTxId(e.target.value)}
                            required
                        />
                        <Button type="submit" fullWidth variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" loading={loading}>Erase Record</Button>
                    </form>
                </div>

                {/* Close Vaults */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-destructive/10 text-destructive rounded-2xl">
                            <Icon name="Lock" size={24} />
                        </div>
                        <h3 className="text-lg font-heading font-bold uppercase italic">Close Vaults</h3>
                    </div>
                    <form onSubmit={handleDeleteAccount} className="space-y-4">
                        <Input
                            label="Account ID to Purge"
                            placeholder="Enter Account ID"
                            value={deleteAcctId}
                            onChange={(e) => setDeleteAcctId(e.target.value)}
                            required
                        />
                        <Button type="submit" fullWidth variant="danger" loading={loading}>Permanently Delete Account</Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FinancialControl;
