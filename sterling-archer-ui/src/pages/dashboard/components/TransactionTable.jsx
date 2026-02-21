import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import TransactionRow from './TransactionRow';

const TransactionTable = ({ transactions, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('date');
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

  const sortedTransactions = [...transactions]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (sortField === 'date') {
      aValue = new Date(aValue)?.getTime();
      bValue = new Date(bValue)?.getTime();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedTransactions?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = sortedTransactions?.slice(startIndex, endIndex);

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <Icon name="ChevronsUpDown" size={14} color="var(--color-muted-foreground)" />;
    }
    return (
      <Icon 
        name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
        size={14} 
        color="var(--color-accent)" 
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground caption">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (transactions?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
          <Icon name="Receipt" size={32} color="var(--color-muted-foreground)" />
        </div>
        <p className="text-lg font-heading font-semibold text-foreground mb-2">
          No transactions yet
        </p>
        <p className="text-sm text-muted-foreground caption">
          Your transaction history will appear here
        </p>
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
                <button
                  onClick={() => handleSort('description')}
                  className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground hover:text-accent transition-smooth"
                >
                  Description
                  <SortIcon field="description" />
                </button>
              </th>
              <th className="px-4 md:px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground hover:text-accent transition-smooth"
                >
                  Type
                  <SortIcon field="type" />
                </button>
              </th>
              <th className="px-4 md:px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground hover:text-accent transition-smooth"
                >
                  Date & Time
                  <SortIcon field="date" />
                </button>
              </th>
              <th className="px-4 md:px-6 py-4 text-right">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-2 ml-auto text-sm font-heading font-semibold text-foreground hover:text-accent transition-smooth"
                >
                  Amount
                  <SortIcon field="amount" />
                </button>
              </th>
              <th className="px-4 md:px-6 py-4 text-right">
                <span className="text-sm font-heading font-semibold text-foreground">
                  Balance
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions?.map((transaction) => (
              <TransactionRow key={transaction?.id} transaction={transaction} />
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground caption">
            Showing {startIndex + 1}-{Math.min(endIndex, transactions?.length)} of {transactions?.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
              aria-label="Previous page"
            >
              <Icon name="ChevronLeft" size={20} color="var(--color-foreground)" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)?.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium transition-smooth ${
                    currentPage === page
                      ? 'bg-accent text-accent-foreground'
                      : 'border border-border hover:bg-muted text-foreground'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
              aria-label="Next page"
            >
              <Icon name="ChevronRight" size={20} color="var(--color-foreground)" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;