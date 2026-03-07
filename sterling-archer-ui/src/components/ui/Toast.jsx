import React, { useEffect } from 'react';
import Icon from '../AppIcon';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'border-success/50 bg-success/10 text-success',
    error: 'border-destructive/50 bg-destructive/10 text-destructive',
    warning: 'border-warning/50 bg-warning/10 text-warning'
  };

  return (
    <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-right-10 duration-300 ${styles[type]}`}>
      <Icon name={type === 'success' ? 'CheckCircle' : 'AlertTriangle'} size={20} />
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">System Message</span>
        <p className="text-sm font-bold">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 hover:opacity-50">
        <Icon name="X" size={16} />
      </button>
    </div>
  );
};

export default Toast;