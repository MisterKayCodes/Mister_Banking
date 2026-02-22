import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import TransactionRow from './TransactionRow';

const TransactionTable = ({ transactions = [], loading, currentUserAccountNos = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('created_at'); 
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 10;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...(transactions || [])].sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (sortField === 'created_at') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil((sortedTransactions?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = sortedTransactions?.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground caption">Scanning the ledger...</p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
          <Icon name="Receipt" size={32} color="var(--color-muted-foreground)" />
        </div>
        <p className="text-lg font-heading font-semibold text-foreground mb-2">The vault history is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="px-4 md:px-6 py-4 text-left">
                <button onClick={() => handleSort('reference')} className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground">
                  Reference
                </button>
              </th>
              <th className="px-4 md:px-6 py-4 text-left">
                <button onClick={() => handleSort('transfer_type')} className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground">
                  Type
                </button>
              </th>
              <th className="px-4 md:px-6 py-4 text-left">
                <button onClick={() => handleSort('created_at')} className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground">
                  Date
                </button>
              </th>
              <th className="px-4 md:px-6 py-4 text-right">
                <button onClick={() => handleSort('amount')} className="flex items-center gap-2 ml-auto text-sm font-heading font-semibold text-foreground">
                  Amount
                </button>
              </th>
              <th className="px-4 md:px-6 py-4 text-right">
                <span className="text-sm font-heading font-semibold text-foreground">Snapshot</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((tx) => (
              <TransactionRow 
                key={tx.id} 
                transaction={tx} 
                currentUserAccountNos={currentUserAccountNos} 
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl text-sm ${currentPage === page ? 'bg-accent text-accent-foreground' : 'border border-border'}`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;