import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const PINVerificationModal = ({ isOpen = false, onClose, onVerify, title = 'Verify PIN', description = 'Enter your 6-digit PIN to confirm this transaction' }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '', '', '']);
      setError('');
      inputRefs?.current?.[0]?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e?.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      setPin(['', '', '', '', '', '']);
      setError('');
      onClose();
    }
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/?.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value?.slice(-1);
    setPin(newPin);
    setError('');

    if (value && index < 5) {
      inputRefs?.current?.[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !pin?.[index] && index > 0) {
      inputRefs?.current?.[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e?.preventDefault();
    const pastedData = e?.clipboardData?.getData('text')?.slice(0, 6);
    if (!/^\d+$/?.test(pastedData)) return;

    const newPin = [...pin];
    pastedData?.split('')?.forEach((digit, index) => {
      if (index < 6) {
        newPin[index] = digit;
      }
    });
    setPin(newPin);

    const nextEmptyIndex = newPin?.findIndex(digit => !digit);
    if (nextEmptyIndex !== -1) {
      inputRefs?.current?.[nextEmptyIndex]?.focus();
    } else {
      inputRefs?.current?.[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const pinValue = pin?.join('');

    if (pinValue?.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onVerify(pinValue);
      handleClose();
    } catch (err) {
      setError(err?.message || 'Invalid PIN. Please try again.');
      setPin(['', '', '', '', '', '']);
      inputRefs?.current?.[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-warm-xl border border-border overflow-hidden">
        <div className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                <Icon name="Lock" size={20} color="var(--color-accent)" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  {title}
                </h2>
                <p className="text-sm text-muted-foreground caption mt-1">
                  {description}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 rounded-xl hover:bg-muted transition-smooth disabled:opacity-50"
              aria-label="Close"
            >
              <Icon name="X" size={20} color="var(--color-foreground)" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            {pin?.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e?.target?.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-mono font-medium bg-background border-2 border-border rounded-xl focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/20 transition-smooth disabled:opacity-50"
                aria-label={`PIN digit ${index + 1}`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-6 bg-error/10 border border-error/20 rounded-xl">
              <Icon name="AlertCircle" size={16} color="var(--color-error)" />
              <p className="text-sm text-error caption">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isLoading}
              disabled={pin?.some(digit => !digit)}
              fullWidth
            >
              Verify PIN
            </Button>
          </div>
        </form>

        <div className="px-8 py-4 bg-muted/50 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground caption">
            <Icon name="ShieldCheck" size={16} color="currentColor" />
            <span>Your PIN is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PINVerificationModal;