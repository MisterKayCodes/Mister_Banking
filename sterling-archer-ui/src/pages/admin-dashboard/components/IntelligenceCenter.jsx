import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import { useToast } from 'hooks/useToast';

const IntelligenceCenter = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast, ToastComponent } = useToast();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users/master-ledger');
            setUsers(response.data);
        } catch (error) {
            showToast('Intelligence breach: Unable to retrieve master ledger.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {ToastComponent}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground">Master Ledger</h2>
                    <p className="text-sm text-muted-foreground font-medium">Global citizen intelligence and asset distribution</p>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Icon name="Search" size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Scan identities..."
                        className="bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Population</p>
                    <p className="text-3xl font-heading font-bold">{users.length}</p>
                </div>
                {/* Addition summary cards could go here */}
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Fiat Balance</th>
                                <th className="px-6 py-4 text-right">Digital Assets</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-6 py-4 h-16 bg-muted/20"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground caption">
                                        No citizen data matched the query.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-muted/30 transition-smooth group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                                    <Icon name="User" size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${user.status === 'Active'
                                                ? 'bg-success/10 text-success border-success/20'
                                                : 'bg-error/10 text-error border-error/20'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-mono font-bold text-foreground">{user.fiat_balance}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <p className="text-[11px] font-mono font-bold text-primary">{user.btc_balance}</p>
                                                <p className="text-[11px] font-mono font-bold text-accent">{user.usdt_vault}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IntelligenceCenter;
