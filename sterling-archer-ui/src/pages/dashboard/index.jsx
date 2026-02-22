import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import NotificationBell from '../../components/ui/NotificationBell';
import Icon from '../../components/AppIcon';
import AccountCard from './components/AccountCard';
import TransactionTable from './components/TransactionTable';
import AccountSummary from './components/AccountSummary';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const userResponse = await api.get('/users/me');
      setUserData(userResponse.data);
      setAccounts(userResponse.data.accounts || []);
      setWallet(userResponse.data.wallet || null);

      setTransactionsLoading(true);
      const txResponse = await api.get('/users/me/transactions');
      setTransactions(txResponse.data);
    } catch (error) {
      console.error('Vault Access Error:', error);
    } finally {
      setLoading(false);
      setTransactionsLoading(false);
    }
  };

  const handleRefresh = () => fetchAllData();

  const myIdentifiers = [
    ...(accounts || []).map(acc => String(acc.account_number)),
    wallet?.btc_address ? String(wallet.btc_address) : null,
    wallet?.usdt_address ? String(wallet.usdt_address) : null
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <SidebarNavigation isCollapsed={isSidebarCollapsed} userRole="customer" />
      
      <div className={`transition-smooth pt-16 md:pt-0 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="sticky top-0 z-20 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-smooth"
              >
                <Icon name={isSidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} color="var(--color-foreground)" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground caption mt-1">
                  Welcome back, {userData?.full_name || 'Mister'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-smooth">
                <Icon name="RefreshCw" size={20} color="var(--color-foreground)" />
              </button>
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">Accounts</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {loading ? (
                  [1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />)
                ) : (
                  <>
                    {accounts.map(acc => (
                      <AccountCard key={acc.id} account={acc} onViewDetails={(a) => navigate(`/accounts/${a.id}`)} />
                    ))}
                    
                    {wallet && (
                      <AccountCard 
                        account={{ 
                          ...wallet, 
                          type: 'Crypto', 
                          name: 'Digital Asset Vault', 
                          currency: 'BTC',
                          balance: Number(wallet.btc_balance) || 0,
                          /* Mister, dual-asset mapping is active! */
                          secondaryBalance: Number(wallet.usdt_balance) || 0,
                          secondaryCurrency: 'USDT'
                        }} 
                        onViewDetails={() => navigate('/crypto-exchange')} 
                      />
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
              {/* Passing data to the summary for total net worth calculation */}
              <AccountSummary accounts={accounts} wallet={wallet} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-6">Transaction History</h2>
            <TransactionTable 
              transactions={transactions} 
              loading={transactionsLoading} 
              currentUserAccountNos={myIdentifiers} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;