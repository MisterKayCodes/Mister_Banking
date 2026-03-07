import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import Toast from '../../components/ui/Toast';

import AccountHero from './components/AccountHero';
import ActionGrid from './components/ActionGrid';
import BalanceChart from './components/BalanceChart';
import AccountLedger from './components/AccountLedger';
import TransferModal from './components/TransferModal';
import ReceiveModal from './components/ReceiveModal';
import BuyCryptoModal from '../crypto/components/BuyCryptoModal';

const Account = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();

  // Data State
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'send', 'receive', or null
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (accountId) fetchAccountData();
  }, [accountId]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const [accResponse, txResponse, userRes] = await Promise.all([
        api.get(`/accounts/${accountId}`),
        api.get(`/transactions/`),
        api.get(`/users/me`)
      ]);

      setUserProfile(userRes.data);

      const rawAccount = accResponse.data;
      const mappedAccount = {
        ...rawAccount,
        // In this standard view, we prioritize the bank balance ($/USDT)
        balance: Number(rawAccount.balance) || 0,
        currency: rawAccount.currency || 'USD',
      };

      const myId = String(mappedAccount.account_number || mappedAccount.btc_address || "");
      const filtered = txResponse.data.filter(tx => String(tx.sender_no) === myId || String(tx.receiver_no) === myId);

      setAccount(mappedAccount);
      setTransactions(filtered);
      setChartData([{ date: '15 Feb', balance: mappedAccount.balance * 0.98 }, { date: 'Today', balance: mappedAccount.balance }]);
    } catch (error) {
      console.error("Synchronization Error:", error);
      if (error.response?.status === 404) navigate('/dashboard');
      if (error.response?.status === 403) {
        setNotification({
          message: "Access Denied: Redirecting to your personal vault...",
          type: 'error'
        });

        // Redirect to their own first account
        try {
          const accountsRes = await api.get('/accounts/');
          const myAccounts = accountsRes.data;
          if (myAccounts && myAccounts.length > 0) {
            setTimeout(() => navigate(`/accounts/${myAccounts[0].id}`), 1500);
          } else {
            setTimeout(() => navigate('/dashboard'), 1500);
          }
        } catch (redirError) {
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const executeTransfer = async (formData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        from_account_no: account.account_number,
        amount: parseFloat(formData.amount),
        transfer_type: formData.transfer_type,
        pin: formData.pin,
        ...(formData.transfer_type === 'internal'
          ? { to_account_no: formData.to_account_no }
          : { ...formData })
      };
      await api.post('/transactions/', payload);
      setNotification({ message: "Funds dispatched successfully.", type: 'success' });
      setActiveModal(null);
      fetchAccountData();
    } catch (error) {
      setNotification({ message: error.response?.data?.detail || "Transfer failed.", type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handlePurchase = async (formData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        account_no: account.account_number
      };

      await api.post('/transactions/buy-crypto', payload);
      setNotification({ message: "Asset acquisition finalized. Funds deducted from balance.", type: 'success' });
      setActiveModal(null);

      // Refresh to update balance
      await fetchAccountData();
    } catch (error) {
      setNotification({
        message: error.response?.data?.detail || "Exchange sequence failed.",
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = (id) => {
    if (id === 'send' || id === 'receive') {
      setActiveModal(id);
    } else if (id === 'exchange') {
      if (userProfile?.trading_blocked) {
        setNotification({
          message: `Exchange Access Blocked: ${userProfile.trading_block_reason || "Trading restricted by admin."}`,
          type: 'error'
        });
        return;
      }
      setActiveModal('buy');
    } else if (id === 'statement') {
      setNotification({ message: "Digital statement generation is currently unavailable.", type: 'info' });
    } else {
      navigate(`/account/${accountId}/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarNavigation isCollapsed={isSidebarCollapsed} userRole="customer" />

      <div className={`transition-smooth pt-16 md:pt-0 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="sticky top-0 z-20 bg-card border-b border-border px-4 md:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-heading font-bold">
            {loading ? 'Scanning...' : `${account?.type || 'Vault'} Overview`}
          </h1>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:block">
            <Icon name={isSidebarCollapsed ? 'Maximize' : 'Minimize'} size={18} />
          </button>
        </header>

        <main className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
          <AccountHero account={account} loading={loading} />

          <ActionGrid onAction={handleAction} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <AccountLedger transactions={transactions} loading={loading} accountIdentifier={account?.account_number || account?.btc_address} />
            </div>
            <div className="space-y-8">
              <BalanceChart data={chartData} />
            </div>
          </div>
        </main>
      </div>

      {/* Modals Managed by State */}
      <TransferModal
        isOpen={activeModal === 'send'}
        onClose={() => setActiveModal(null)}
        onTransfer={executeTransfer}
        isSubmitting={isSubmitting}
      />

      <ReceiveModal
        isOpen={activeModal === 'receive'}
        onClose={() => setActiveModal(null)}
        account={account}
        fullName={account?.owner_name}
      />

      <BuyCryptoModal
        isOpen={activeModal === 'buy'}
        onClose={() => setActiveModal(null)}
        onExchange={handlePurchase}
        isSubmitting={isSubmitting}
        accountBalance={account?.balance}
      />

      {notification && <Toast {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default Account;