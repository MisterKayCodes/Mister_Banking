import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import NotificationBell from '../../components/ui/NotificationBell';
import Icon from '../../components/AppIcon';
import AccountCard from './components/AccountCard';
import TransactionTable from './components/TransactionTable';
import QuickActions from './components/QuickActions';
import AccountSummary from './components/AccountSummary';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const mockAccounts = [
        {
          id: 1,
          name: 'Primary Checking',
          type: 'Checking',
          accountNumber: '****7892',
          balance: 45678.90,
          currency: 'USD',
          status: 'active'
        },
        {
          id: 2,
          name: 'High-Yield Savings',
          type: 'Savings',
          accountNumber: '****3456',
          balance: 125000.00,
          currency: 'USD',
          status: 'active'
        },
        {
          id: 3,
          name: 'Digital Assets Wallet',
          type: 'Crypto',
          accountNumber: '****9012',
          balance: 87543.21,
          currency: 'USD',
          status: 'active'
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 800));
      setAccounts(mockAccounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const mockTransactions = [
        {
          id: 1,
          description: 'Salary Deposit - Sterling Corp',
          reference: 'TXN-2026-001234',
          type: 'Internal',
          date: '2026-02-21T09:30:00',
          amount: 8500.00,
          currency: 'USD',
          balance: 45678.90
        },
        {
          id: 2,
          description: 'Bitcoin Purchase',
          reference: 'TXN-2026-001235',
          type: 'Buy',
          date: '2026-02-20T14:15:00',
          amount: -5000.00,
          currency: 'USD',
          balance: 37178.90
        },
        {
          id: 3,
          description: 'Wire Transfer to Chase Bank',
          reference: 'TXN-2026-001236',
          type: 'External',
          date: '2026-02-19T11:45:00',
          amount: -2500.00,
          currency: 'USD',
          balance: 42178.90
        },
        {
          id: 4,
          description: 'Ethereum Sale',
          reference: 'TXN-2026-001237',
          type: 'Sell',
          date: '2026-02-18T16:20:00',
          amount: 3200.00,
          currency: 'USD',
          balance: 44678.90
        },
        {
          id: 5,
          description: 'Internal Transfer from Savings',
          reference: 'TXN-2026-001238',
          type: 'Internal',
          date: '2026-02-17T10:00:00',
          amount: 10000.00,
          currency: 'USD',
          balance: 41478.90
        },
        {
          id: 6,
          description: 'ACH Payment - Utility Bill',
          reference: 'TXN-2026-001239',
          type: 'External',
          date: '2026-02-16T08:30:00',
          amount: -450.75,
          currency: 'USD',
          balance: 31478.90
        },
        {
          id: 7,
          description: 'USDT Purchase',
          reference: 'TXN-2026-001240',
          type: 'Buy',
          date: '2026-02-15T13:10:00',
          amount: -1000.00,
          currency: 'USD',
          balance: 31929.65
        },
        {
          id: 8,
          description: 'Dividend Payment - Investment Account',
          reference: 'TXN-2026-001241',
          type: 'Internal',
          date: '2026-02-14T09:00:00',
          amount: 1250.50,
          currency: 'USD',
          balance: 32929.65
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleViewDetails = (account) => {
    setSelectedAccount(account);
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'transfer': console.log('Navigate to transfer');
        break;
      case 'crypto': navigate('/crypto-exchange');
        break;
      case 'kyc': navigate('/kyc-center');
        break;
      case 'support': navigate('/live-support');
        break;
      default:
        console.log('Action:', actionId);
    }
  };

  const handleRefresh = () => {
    fetchAccounts();
    fetchTransactions();
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarNavigation isCollapsed={isSidebarCollapsed} userRole="customer" />
      <div className={`transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-smooth"
                aria-label="Toggle sidebar"
              >
                <Icon name={isSidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} color="var(--color-foreground)" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
                  Dashboard
                </h1>
                <p className="text-sm text-muted-foreground caption mt-1">
                  Welcome back, manage your accounts and transactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-smooth"
                aria-label="Refresh data"
              >
                <Icon name="RefreshCw" size={20} color="var(--color-foreground)" />
              </button>
              <NotificationBell />
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-accent-foreground font-heading font-bold">
                  JD
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">John Doe</p>
                  <p className="text-xs text-muted-foreground caption">Premium Member</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 border border-accent/20 rounded-xl">
              <Icon name="Info" size={20} color="var(--color-accent)" />
              <p className="text-sm text-foreground caption">
                Your accounts are secured with 256-bit SSL encryption and FDIC insurance
              </p>
            </div>
          </div>

          <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                Accounts Overview
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent hover:text-accent-foreground hover:bg-accent/10 rounded-xl transition-smooth">
                <Icon name="Plus" size={16} color="currentColor" />
                <span className="hidden sm:inline">Add Account</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3]?.map((i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-6 md:p-8 animate-pulse">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-muted rounded-xl" />
                      <div className="flex-1">
                        <div className="h-5 bg-muted rounded w-32 mb-2" />
                        <div className="h-4 bg-muted rounded w-20" />
                      </div>
                    </div>
                    <div className="h-10 bg-muted rounded w-48 mb-6" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {accounts?.map((account) => (
                  <AccountCard
                    key={account?.id}
                    account={account}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="lg:col-span-2">
              <QuickActions onActionClick={handleQuickAction} />
            </div>
            <div>
              <AccountSummary accounts={accounts} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                  Transaction History
                </h2>
                <p className="text-sm text-muted-foreground caption mt-2">
                  Recent account activity and transfers
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent hover:text-accent-foreground hover:bg-accent/10 rounded-xl transition-smooth">
                <Icon name="Download" size={16} color="currentColor" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>

            <TransactionTable transactions={transactions} loading={transactionsLoading} />
          </div>
        </main>

        <footer className="mt-12 py-6 px-4 md:px-6 lg:px-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground caption">
            <p>© {new Date()?.getFullYear()} Sterling-Archer Trust. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-smooth">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-smooth">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CitizenDashboard;