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

      <div className={`transition-smooth min-h-screen flex flex-col ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-8 py-4 flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">
              Dashboard
            </h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-black uppercase tracking-widest border border-success/20">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
              Ledger Synchronized
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Icon name="User" size={20} />
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex items-center justify-center p-2.5 hover:bg-muted rounded-xl transition-smooth text-muted-foreground"
            >
              <Icon name={isSidebarCollapsed ? 'Maximize' : 'Minimize'} size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-8">
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
                    {/* Standard Checking Accounts */}
                    {accounts.map(acc => (
                      <AccountCard
                        key={acc.id}
                        account={acc}
                        onViewDetails={(a) => navigate(`/accounts/${a.id}`)}
                      />
                    ))}

                    {/* The Digital Vault now navigates to the dedicated Crypto view! */}
                    {wallet && (
                      <AccountCard
                        account={{
                          ...wallet,
                          type: 'Crypto',
                          name: 'Digital Asset Vault',
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
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