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
        api.get(`accounts/${accountId}`),
        api.get(`transactions`),
        api.get(`users/me`)
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

  // ==================== 🛠️ HELPER FUNCTION FOR ERROR MESSAGES ====================
  // 🛠️ WHAT: This function converts backend error responses into readable text
  // 🛠️ WHY: FastAPI returns errors as an array of objects, not a simple string.
  // 🛠️ WHY: React cannot render objects - they cause the "Objects are not valid as a React child" error.
  // 🛠️ HOW: It checks if the error is a string, an array, or something else, and converts it safely.
  const formatErrorMessage = (error) => {
    // Default fallback message
    let errorMessage = "Transfer failed. Please try again.";
    
    // Get the detail from the response (FastAPI sends errors in .data.detail)
    const detail = error.response?.data?.detail;
    
    if (detail) {
      // Case 1: It's already a plain string (e.g., "Insufficient funds")
      if (typeof detail === 'string') {
        errorMessage = detail;
      } 
      // Case 2: It's an array of validation errors (e.g., Pydantic errors)
      // Example: [{ "msg": "String should have at least 10 characters", "loc": ["body", "to_account_no"] }]
      else if (Array.isArray(detail) && detail.length > 0) {
        // Extract just the 'msg' from each error and join them with commas
        errorMessage = detail.map(err => err.msg).join(', ');
      }
      // Case 3: It's some other kind of object (fallback)
      else if (typeof detail === 'object') {
        errorMessage = JSON.stringify(detail);
      }
    }
    
    return errorMessage;
  };
  // =============================================================================

  const executeTransfer = async (formData) => {
    try {
      setIsSubmitting(true);
      let payload = {
  from_account_no: account.account_number,
  amount: parseFloat(formData.amount),
  transfer_type: formData.transfer_type,
  pin: formData.pin,
};

if (formData.transfer_type === 'internal') {
  // Internal transfer: needs to_account_no
  payload.to_account_no = formData.to_account_no;
} else {
  // External transfer: needs external bank details
  payload.external_bank_name = formData.external_bank_name;
  payload.external_iban_or_acc = formData.external_iban_or_acc;
  payload.external_swift_bic = formData.external_swift_bic;
  payload.recipient_full_name = formData.recipient_full_name;
  payload.purpose_of_transfer = formData.purpose_of_transfer;
  // Do NOT include to_account_no
}
      await api.post('/transactions/', payload);
      setNotification({ message: "Funds dispatched successfully.", type: 'success' });
      setActiveModal(null);
      fetchAccountData();
    } catch (error) {
      // 🛠️ OLD CODE (commented out for learning):
      // setNotification({ message: error.response?.data?.detail || "Transfer failed.", type: 'error' });
      // 🛠️ WHY THIS FAILED: error.response.data.detail is an ARRAY of objects, not a string.
      // 🛠️ React tried to render [object Object] and crashed.
      
      // 🛠️ NEW CODE: Use the helper function to safely convert any error format to a readable string
      const errorMessage = formatErrorMessage(error);
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurchase = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log("DEBUG: Current account object:", account);
      console.log("DEBUG: account.account_number is:", account?.account_number);
      
      const payload = {
        ...formData,
        account_no: account?.account_number
      };
      
      console.log("DEBUG: Final payload being sent:", payload);

      await api.post('/transactions/buy-crypto', payload);
      setNotification({ message: "Asset acquisition finalized. Funds deducted from balance.", type: 'success' });
      setActiveModal(null);

      // Refresh to update balance
      await fetchAccountData();
    } catch (error) {
      // 🛠️ OLD CODE (commented out for learning):
      // setNotification({ message: error.response?.data?.detail || "Exchange sequence failed.", type: 'error' });
      // 🛠️ SAME ISSUE: error.response.data.detail is an array of objects
      
      // 🛠️ NEW CODE: Use the same helper function for consistency
      const errorMessage = formatErrorMessage(error);
      setNotification({ message: errorMessage, type: 'error' });
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
              <AccountLedger transactions={transactions} loading={loading} accountIdentifier={[account?.account_number, account?.btc_address, account?.usdt_address]} />
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