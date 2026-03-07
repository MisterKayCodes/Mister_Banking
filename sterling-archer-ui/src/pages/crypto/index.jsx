import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

// Global UI Components
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Toast from '../../components/ui/Toast';

// Local Components (Scoped to the Crypto Vault)
import CryptoHero from './components/CryptoHero';
import BuyCryptoModal from './components/BuyCryptoModal';
import SellCryptoModal from './components/SellCryptoModal';
import SendCryptoModal from './components/SendCryptoModal';
import CryptoReceiveModal from './components/CryptoReceiveModal';

// Sibling Page Components (Reusing the Ledger and Action logic)
import AccountLedger from "../account/components/AccountLedger";
import ActionGrid from "../account/components/ActionGrid";

const Crypto = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (accountId) fetchCryptoData();
  }, [accountId]);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);

      const userString = localStorage.getItem('user');
      const currentUser = userString ? JSON.parse(userString) : null;

      const [accRes, txRes, userRes] = await Promise.all([
        api.get(`/accounts/${accountId}`),
        api.get(`/transactions/`),
        api.get(`/users/me`)
      ]);

      setUserProfile(userRes.data);

      const cryptoAccount = accRes.data;

      const mappedAccount = {
        ...cryptoAccount,
        btc_balance: cryptoAccount.btc_balance !== null ? String(cryptoAccount.btc_balance) : '0.00000000',
        usdt_balance: cryptoAccount.usdt_balance !== null ? String(cryptoAccount.usdt_balance) : '0.00',
      };

      setAccount(mappedAccount);

      // CRYPTO FILTER: We only show moves that touch the blockchain or the exchange engine
      const walletAddr = mappedAccount.btc_address;
      const usdtAddr = mappedAccount.usdt_address;
      const accountNo = mappedAccount.account_number;

      const filtered = txRes.data.filter(tx => {
        const isWalletMove = (walletAddr && (String(tx.sender_no) === String(walletAddr) || String(tx.receiver_no) === String(walletAddr))) ||
          (usdtAddr && (String(tx.sender_no) === String(usdtAddr) || String(tx.receiver_no) === String(usdtAddr)));

        const isCryptoExchange = (String(tx.sender_no) === String(accountNo) || String(tx.receiver_no) === String(accountNo)) &&
          (tx.currency !== 'USD' || tx.details?.toLowerCase().includes('exchange') || tx.details?.toLowerCase().includes('crypto'));

        return isWalletMove || isCryptoExchange;
      });

      setTransactions(filtered);
    } catch (error) {
      console.error("Synchronization Error:", error);

      if (error.response?.status === 403) {
        setNotification({
          message: "Access Denied: Redirecting to your personal vault...",
          type: 'error'
        });

        // Smart Redirect Logic: Find the citizen's own account ID
        try {
          const accountsRes = await api.get('/accounts/');
          const myAccounts = accountsRes.data;

          if (myAccounts && myAccounts.length > 0) {
            // Redirect to their first available crypto vault
            setTimeout(() => navigate(`/crypto/${myAccounts[0].id}`), 1500);
          } else {
            setTimeout(() => navigate('/dashboard'), 1500);
          }
        } catch (redirError) {
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } else {
        setNotification({ message: "Blockchain synchronization failed.", type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (formData) => {
    try {
      setIsSubmitting(true);
      // Ensure we use the correct account identifier for the exchange
      const payload = {
        ...formData,
        account_no: account.account_number
      };

      await api.post('/transactions/buy-crypto', payload);
      setNotification({ message: "Asset acquisition finalized.", type: 'success' });
      setActiveModal(null);

      // Refresh to pull updated btc_balance from backend
      await fetchCryptoData();
    } catch (error) {
      setNotification({
        message: error.response?.data?.detail || "Exchange sequence failed.",
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSale = async (formData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        account_no: account.account_number
      };

      await api.post('/transactions/sell-crypto', payload);
      setNotification({ message: "Asset liquidation finalized. Funds credited to account.", type: 'success' });
      setActiveModal(null);

      await fetchCryptoData();
    } catch (error) {
      setNotification({
        message: error.response?.data?.detail || "Liquidation sequence failed.",
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCrypto = async (formData) => {
    try {
      setIsSubmitting(true);
      await api.post('/transactions/send-crypto', formData);
      setNotification({ message: "Blockchain transfer broadcasted successfully.", type: 'success' });
      setActiveModal(null);
      await fetchCryptoData();
    } catch (error) {
      setNotification({
        message: error.response?.data?.detail || "Broadcast sequence failed.",
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = (id) => {
    if (id === 'send' || id === 'exchange') {
      if (userProfile?.trading_blocked) {
        setNotification({ message: `Access Denied: ${userProfile.trading_block_reason || "Trading restricted."}`, type: 'error' });
        return;
      }
      setActiveModal(id === 'send' ? 'send' : 'sell');
    }
    else if (id === 'receive') setActiveModal('receive');
    else if (id === 'statement') {
      setNotification({ message: "Digital statement generation is currently unavailable.", type: 'info' });
    }
    else navigate(`/account/${accountId}/${id}`);
  };

  const customActions = [
    { id: 'send', label: 'Send Assets', icon: 'Send', color: 'bg-accent/10 text-accent' },
    { id: 'receive', label: 'Receive', icon: 'ArrowDownLeft', color: 'bg-green-500/10 text-green-500' },
    { id: 'exchange', label: 'Market Sell', icon: 'TrendingDown', color: 'bg-red-500/10 text-red-500' },
    { id: 'statement', label: 'Statement', icon: 'FileText', color: 'bg-muted/50 text-muted-foreground' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarNavigation userRole="customer" />

      <main className="lg:ml-64 px-4 md:px-8 py-8 max-w-7xl mx-auto transition-all duration-300">
        <CryptoHero account={account} loading={loading} />

        <ActionGrid onAction={handleAction} customActions={customActions} />

        <div className="mt-12">
          <header className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Asset Ledger</h3>
              <p className="text-[10px] text-accent font-bold uppercase">Live Blockchain Activity</p>
            </div>
          </header>

          <AccountLedger
            transactions={transactions}
            loading={loading}
            accountIdentifier={account?.btc_address || account?.account_number}
          />
        </div>
      </main>

      <SellCryptoModal
        isOpen={activeModal === 'sell'}
        onClose={() => setActiveModal(null)}
        onExchange={handleSale}
        isSubmitting={isSubmitting}
        cryptoBalances={{ btc: account?.btc_balance, usdt: account?.usdt_balance }}
      />

      <SendCryptoModal
        isOpen={activeModal === 'send'}
        onClose={() => setActiveModal(null)}
        onSend={handleSendCrypto}
        isSubmitting={isSubmitting}
        cryptoBalances={{ btc: account?.btc_balance, usdt: account?.usdt_balance }}
      />

      <CryptoReceiveModal
        isOpen={activeModal === 'receive'}
        onClose={() => setActiveModal(null)}
        account={account}
        fullName={account?.owner_name}
      />

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Crypto;