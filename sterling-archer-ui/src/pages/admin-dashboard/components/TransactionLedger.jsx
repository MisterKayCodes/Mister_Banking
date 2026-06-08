import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Icon from '../../../components/AppIcon';
import { useToast } from 'hooks/useToast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TransactionLedger = () => {
    const { showToast, ToastComponent } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // all, pending, success, declined
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter && statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await api.get('/admin/transactions', { params });
            setTransactions(response.data);
            setCurrentPage(1);
        } catch (error) {
            showToast('Failed to retrieve transactions.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [statusFilter]);

    const handleApprove = async (txId) => {
        try {
            await api.patch(`/admin/transactions/${txId}/approve`);
            showToast('Transaction approved successfully.', 'success');
            fetchTransactions();
        } catch (error) {
            showToast(error.response?.data?.detail || 'Failed to approve transaction.', 'error');
        }
    };

    const handleDecline = async (txId) => {
        const reason = prompt('Enter decline reason (optional):');
        if (reason === null) return; // User cancelled

        try {
            await api.patch(`/admin/transactions/${txId}/decline`, {
                reason: reason || null
            });
            showToast('Transaction declined and sender refunded.', 'success');
            fetchTransactions();
        } catch (error) {
            showToast(error.response?.data?.detail || 'Failed to decline transaction.', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            success: 'bg-green-100 text-green-800 border-green-300',
            declined: 'bg-red-100 text-red-800 border-red-300',
            blocked: 'bg-gray-100 text-gray-800 border-gray-300'
        };
        const color = statusColors[status] || statusColors.blocked;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getTransferTypeIcon = (type) => {
        return type === 'internal' ? '↔️' : '🌐';
    };

    const filteredTransactions = transactions.filter(tx => {
        if (!searchQuery) return true;
        return (
            tx.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.sender_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.receiver_no?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const totalPages = Math.ceil((filteredTransactions?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTransactions = filteredTransactions?.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground caption">Loading transaction ledger...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {ToastComponent}

            {/* Header */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground">Transaction Ledger</h2>
                    <p className="text-sm text-muted-foreground">Review, approve, and manage all user transactions</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search by reference, account number..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'success', 'declined'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    statusFilter === status
                                        ? 'bg-accent text-accent-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
                    <Icon name="Receipt" size={48} color="var(--color-muted-foreground)" />
                    <p className="text-muted-foreground mt-4">No transactions found</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full">
                        <thead className="bg-muted border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Reference</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">From</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">To</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Amount</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Fee</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Created</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {currentTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">
                                            {tx.reference.substring(0, 8)}...
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-lg">{getTransferTypeIcon(tx.transfer_type)}</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {tx.transfer_type === 'internal' ? 'Internal' : 'External'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm bg-muted px-2 py-1 rounded text-foreground">
                                            {tx.sender_no}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm bg-muted px-2 py-1 rounded text-foreground">
                                            {tx.receiver_no || 'N/A'}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-foreground">
                                            ${parseFloat(tx.amount).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm text-muted-foreground">
                                            ${parseFloat(tx.fee || 0).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(tx.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(tx.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            {tx.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(tx.id)}
                                                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecline(tx.id)}
                                                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                    >
                                                        ✕ Decline
                                                    </button>
                                                </>
                                            )}
                                            {tx.status !== 'pending' && (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{' '}
                        {filteredTransactions.length} transactions
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-muted text-foreground disabled:opacity-50 hover:bg-muted/80"
                        >
                            ← Previous
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                                            currentPage === pageNum
                                                ? 'bg-accent text-accent-foreground'
                                                : 'bg-muted text-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-muted text-foreground disabled:opacity-50 hover:bg-muted/80"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionLedger;
