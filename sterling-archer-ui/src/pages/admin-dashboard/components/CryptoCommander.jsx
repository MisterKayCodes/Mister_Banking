import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import { useToast } from 'hooks/useToast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CryptoCommander = () => {
    const { showToast, ToastComponent } = useToast();
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Manual Crypto states
    const [manualCrypto, setManualCrypto] = useState({ user_id: '', coin: 'btc', amount: '', tag: '' });

    // Wallet Surgeon states
    const [surgeon, setSurgeon] = useState({ user_id: '', btc_addr: '', usdt_addr: '' });

    const fetchWallets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/wallets/all');
            setWallets(response.data);
        } catch (error) {
            showToast('Failed to retrieve global wallet ledger.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const handleManualCryptoDeposit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/admin/deposits/crypto', {
                user_id: parseInt(manualCrypto.user_id),
                coin: manualCrypto.coin,
                amount: parseFloat(manualCrypto.amount),
                tag: manualCrypto.tag
            });
            showToast(`Manual ${manualCrypto.coin.toUpperCase()} deposit successful.`, 'success');
            setManualCrypto({ user_id: '', coin: 'btc', amount: '', tag: '' });
            fetchWallets();
        } catch (error) {
            showToast('Failed to execute crypto deposit.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleWalletSurgery = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.patch(`/admin/wallets/${surgeon.user_id}/edit-addresses?btc_addr=${surgeon.btc_addr}&usdt_addr=${surgeon.usdt_addr}`);
            showToast('Wallet addresses restructured successfully.', 'success');
            setSurgeon({ user_id: '', btc_addr: '', usdt_addr: '' });
            fetchWallets();
        } catch (error) {
            showToast('Failed to modify wallet addresses.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleTradeBlock = async (userId, currentBlocked) => {
        const reason = currentBlocked ? "" : window.prompt("Enter reason for trade suspension:");
        if (reason === null) return;

        try {
            await api.post(`/admin/users/${userId}/trade-block?blocked=${!currentBlocked}&reason=${reason}`);
            showToast(`Trading ${currentBlocked ? 'restored' : 'suspended'} for User ${userId}.`, 'success');
            fetchWallets();
        } catch (error) {
            showToast('Failed to toggle trading status.', 'error');
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {ToastComponent}
            <div>
                <h2 className="text-2xl font-heading font-bold text-foreground italic uppercase">Crypto & Trading Control</h2>
                <p className="text-sm text-muted-foreground font-medium">Gatekeeper of the blockchain and trading governance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Global Wallet View */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                            <Icon name="BarChart" size={24} />
                        </div>
                        <h3 className="text-lg font-heading font-bold uppercase italic">Global Wallet Ledger</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground">Owner</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground">BTC Balance</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground">USDT Balance</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground text-right">Trading</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan="4" className="py-8 text-center animate-pulse">Syncing blockchain state...</td></tr>
                                ) : wallets.map(w => (
                                    <tr key={w.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">#{w.user_id} {w.owner_name}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{w.owner_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-mono text-xs font-bold">{w.btc_balance.toFixed(8)} BTC</td>
                                        <td className="px-4 py-4 font-mono text-xs font-bold">{w.usdt_balance.toFixed(2)} USDT</td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => handleTradeBlock(w.user_id, w.trading_blocked)}
                                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${w.trading_blocked ? 'bg-error/10 text-error border-error/20' : 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                                                    }`}
                                            >
                                                {w.trading_blocked ? 'Suspended' : 'Allowed'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Manual Crypto Deposit */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-success/10 text-success rounded-2xl">
                            <Icon name="Download" size={24} />
                        </div>
                        <h3 className="text-lg font-heading font-bold uppercase italic">Manual Crypto Funding</h3>
                    </div>
                    <form onSubmit={handleManualCryptoDeposit} className="space-y-4">
                        <Input
                            label="Target User ID"
                            placeholder="Enter User ID"
                            value={manualCrypto.user_id}
                            onChange={(e) => setManualCrypto({ ...manualCrypto, user_id: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 px-1">Currency</label>
                                <select
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
                                    value={manualCrypto.coin}
                                    onChange={(e) => setManualCrypto({ ...manualCrypto, coin: e.target.value })}
                                >
                                    <option value="btc">Bitcoin (BTC)</option>
                                    <option value="usdt">Tether (USDT)</option>
                                </select>
                            </div>
                            <Input
                                label="Quantity"
                                placeholder="e.g. 0.5"
                                type="number"
                                step="0.00000001"
                                value={manualCrypto.amount}
                                onChange={(e) => setManualCrypto({ ...manualCrypto, amount: e.target.value })}
                                required
                            />
                        </div>
                        <Input
                            label="Deposit Narrative/Tag"
                            placeholder="e.g. Compensation for delays"
                            value={manualCrypto.tag}
                            onChange={(e) => setManualCrypto({ ...manualCrypto, tag: e.target.value })}
                            required
                        />
                        <Button type="submit" fullWidth loading={actionLoading}>Inject Crypto Funds</Button>
                    </form>
                </div>

                {/* 3. Wallet Surgeon */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <Icon name="Activity" size={24} />
                        </div>
                        <h3 className="text-lg font-heading font-bold uppercase italic">Wallet Surgeon</h3>
                    </div>
                    <form onSubmit={handleWalletSurgery} className="space-y-4">
                        <Input
                            label="Target User ID"
                            placeholder="Enter User ID"
                            value={surgeon.user_id}
                            onChange={(e) => setSurgeon({ ...surgeon, user_id: e.target.value })}
                            required
                        />
                        <Input
                            label="New BTC Address"
                            placeholder="Overwrite Bitcoin address"
                            value={surgeon.btc_addr}
                            onChange={(e) => setSurgeon({ ...surgeon, btc_addr: e.target.value })}
                        />
                        <Input
                            label="New USDT Address"
                            placeholder="Overwrite Tether address"
                            value={surgeon.usdt_addr}
                            onChange={(e) => setSurgeon({ ...surgeon, usdt_addr: e.target.value })}
                        />
                        <Button type="submit" fullWidth loading={actionLoading} className="bg-foreground text-background">Update Addresses</Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CryptoCommander;
