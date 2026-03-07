import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import { useToast } from 'hooks/useToast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PeopleLedger = () => {
    const { showToast, ToastComponent } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editData, setEditData] = useState({ full_name: '', email: '' });

    // NEW USER STATE
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [createData, setCreateData] = useState({
        full_name: '',
        email: '',
        date_of_birth: '',
        password: '',
        is_admin: false,
    });
    const [isCreating, setIsCreating] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users/master-ledger');
            setUsers(response.data);
        } catch (error) {
            showToast('Failed to retrieve user directory.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditStart = (user) => {
        setEditingUser(user);
        setEditData({ full_name: user.name, email: user.email });
    };

    const handleEditSave = async () => {
        try {
            await api.patch(`/admin/users/${editingUser.user_id}/edit-profile`, editData);
            showToast('Identity records updated successfully.', 'success');
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            showToast('Failed to update identity records.', 'error');
        }
    };

    const handleNuclearWipe = async (userId) => {
        if (!window.confirm("CRITICAL ACTION: This will permanently erase this user and all associated data. This cannot be undone. Proceed?")) return;

        try {
            await api.delete(`/admin/users/${userId}/nuclear`);
            showToast('User has been completely removed from the system.', 'success');
            fetchUsers();
        } catch (error) {
            showToast(error.response?.data?.detail || 'Failed to execute wipe protocol.', 'error');
        }
    };

    const handleCreateUser = async () => {
        if (!createData.full_name || !createData.email || !createData.date_of_birth || !createData.password) {
            showToast('All fields are required to create a new identity.', 'error');
            return;
        }

        try {
            setIsCreating(true);
            await api.post('/admin/users/create', createData);
            showToast('New identity established successfully.', 'success');
            setIsCreatingUser(false);
            setCreateData({ full_name: '', email: '', date_of_birth: '', password: '', is_admin: false });
            fetchUsers();
        } catch (error) {
            showToast(error.response?.data?.detail || 'Failed to establish new identity.', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.user_id.toString().includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            {ToastComponent}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground italic uppercase">People Management</h2>
                    <p className="text-sm text-muted-foreground font-medium">Master Ledger of all registered users</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="relative w-full md:w-96">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Icon name="Search" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsCreatingUser(true)}>
                        <Icon name="UserPlus" size={18} className="mr-2" />
                        Create Identity
                    </Button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User ID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date of Birth</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Holdings (Fiat)</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 h-16 bg-muted/10"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground font-bold italic">No records found matching criteria.</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.user_id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-black text-xs">#{user.user_id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">{user.name}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-xs">{user.date_of_birth}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.verification === 'verified' ? 'bg-success/10 text-success border border-success/20' :
                                            user.verification === 'pending' ? 'bg-warning/10 text-warning border border-warning/20' :
                                                'bg-muted text-muted-foreground border border-border'
                                            }`}>
                                            {user.verification}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-xs">{user.fiat_balance}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditStart(user)}
                                                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20"
                                                title="Edit Identity"
                                            >
                                                <Icon name="Edit" size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleNuclearWipe(user.user_id)}
                                                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                                                title="Nuclear Wipe"
                                            >
                                                <Icon name="Trash2" size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Identity Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-heading font-bold uppercase italic">Edit identity records</h3>
                            <button onClick={() => setEditingUser(null)} className="text-muted-foreground hover:text-foreground">
                                <Icon name="X" size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <Input
                                label="Full Legal name"
                                value={editData.full_name}
                                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                            />
                            <Input
                                label="Email Address"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" fullWidth onClick={() => setEditingUser(null)}>Cancel</Button>
                            <Button fullWidth onClick={handleEditSave}>Save Records</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Identity Modal */}
            {isCreatingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-heading font-bold uppercase italic">Establish New Identity</h3>
                            <button onClick={() => setIsCreatingUser(false)} className="text-muted-foreground hover:text-foreground">
                                <Icon name="X" size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <Input
                                label="Full Legal Name"
                                value={createData.full_name}
                                onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })}
                            />
                            <Input
                                label="Email Address"
                                value={createData.email}
                                onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                            />
                            <Input
                                label="Date of Birth"
                                type="date"
                                value={createData.date_of_birth}
                                onChange={(e) => setCreateData({ ...createData, date_of_birth: e.target.value })}
                            />
                            <Input
                                label="Initial Password"
                                type="password"
                                value={createData.password}
                                onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" fullWidth onClick={() => setIsCreatingUser(false)} disabled={isCreating}>Cancel</Button>
                            <Button fullWidth onClick={handleCreateUser} loading={isCreating}>Establish</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeopleLedger;
