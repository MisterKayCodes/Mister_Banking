import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { formatCrypto } from '../../../utils/formatters';
import { Html5Qrcode } from 'html5-qrcode';

const SendCryptoModal = ({ isOpen, onClose, onSend, isSubmitting, cryptoBalances }) => {
    const [formData, setFormData] = useState({
        crypto_symbol: 'BTC',
        amount_crypto: '',
        to_address: '',
        pin: '',
        reference: ''  // ← NEW: Narration/Reference field
    });
    const [scannerActive, setScannerActive] = useState(false);
    const [scannerError, setScannerError] = useState('');
    const scannerRef = useRef(null);

    // QR scanner effect
    useEffect(() => {
        if (!scannerActive) {
            setScannerError('');
            return;
        }

        let isMounted = true;
        // Use setTimeout to skip one event loop ensuring the DOM node 'qr-reader' is physically rendered
        const timer = setTimeout(() => {
            if (!isMounted) return;
            try {
                const html5QrCode = new Html5Qrcode('qr-reader');
                scannerRef.current = html5QrCode;

                const config = { fps: 10, qrbox: { width: 250, height: 250 } };

                const qsSuccess = (decodedText) => {
                    if (!isMounted) return;
                    setFormData(prev => ({ ...prev, to_address: decodedText }));
                    html5QrCode.stop().then(() => {
                        html5QrCode.clear();
                        if (isMounted) setScannerActive(false);
                    }).catch(console.error);
                };

                const qsError = (errorMessage) => {
                    // ignore background scan errors
                };

                const startScanner = (cameraIdOrConfig) => {
                    html5QrCode.start(cameraIdOrConfig, config, qsSuccess, qsError)
                        .catch(err => {
                            if (!isMounted) return;
                            console.warn("Camera start failed:", err);

                            // Check if running in a secure context (required for camera access)
                            if (window.isSecureContext === false) {
                                setScannerError("Camera access requires a secure connection (HTTPS) or localhost. Please check your URL.");
                                return;
                            }

                            // Fallback if environment back camera isn't available
                            if (cameraIdOrConfig.facingMode === 'environment') {
                                Html5Qrcode.getCameras().then(devices => {
                                    if (!isMounted) return;
                                    if (devices && devices.length > 0) {
                                        // Pick the first camera
                                        startScanner(devices[0].id);
                                    } else {
                                        setScannerError("No cameras found on your device.");
                                    }
                                }).catch(e => {
                                    if (isMounted) setScannerError("Please click 'Allow' on your browser's camera permission prompt to scan QR codes.");
                                });
                            } else {
                                setScannerError("Camera blocked by browser. Please check site permissions in your browser address bar.");
                            }
                        });
                };

                startScanner({ facingMode: 'environment' });

            } catch (error) {
                console.error("QR Scanner initialization error", error);
                if (isMounted) setScannerError("QR Scanner crashed. Please try typing the address manually.");
            }
        }, 150);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (scannerRef.current) {
                try {
                    scannerRef.current.stop().then(() => {
                        scannerRef.current.clear();
                    }).catch(() => { });
                } catch (e) { }
                scannerRef.current = null;
            }
        };
    }, [scannerActive]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSend(formData);
    };

    const currentBalance = formData.crypto_symbol === 'BTC' ? cryptoBalances.btc : cryptoBalances.usdt;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
            <form
                onSubmit={handleSubmit}
                className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Header - Blue/Accent for Send */}
                <div className="p-6 bg-accent text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Icon name="Send" size={20} />
                        <h3 className="font-black uppercase tracking-tighter">Transfer Assets</h3>
                    </div>
                    <button type="button" onClick={onClose} className="hover:opacity-70 transition-opacity">
                        <Icon name="X" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Asset Selector */}
                    <div className="flex bg-muted p-1 rounded-2xl">
                        {['BTC', 'USDT'].map((symbol) => (
                            <button
                                key={symbol}
                                type="button"
                                className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all ${formData.crypto_symbol === symbol
                                    ? 'bg-card text-foreground shadow-md scale-[1.02]'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => setFormData({ ...formData, crypto_symbol: symbol })}
                            >
                                {symbol === 'BTC' ? 'Bitcoin' : 'Tether'}
                            </button>
                        ))}
                    </div>

                    {/* Recipient Address */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-2">
                            Recipient Address
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                required
                                className="flex-1 bg-muted border-none rounded-2xl p-5 font-mono text-sm focus:ring-2 focus:ring-accent/20 transition-all"
                                placeholder={formData.crypto_symbol === 'BTC' ? "bc1q..." : "0x..."}
                                value={formData.to_address}
                                onChange={(e) => setFormData({ ...formData, to_address: e.target.value })}
                            />
                            <button type="button" onClick={() => setScannerActive(true)} className="px-3 bg-accent text-white rounded-xl hover:opacity-80 transition">
                                Scan QR
                            </button>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                                Amount ({formData.crypto_symbol})
                            </label>
                            <span className="text-[10px] font-bold text-accent uppercase">
                                Avail: {formatCrypto(currentBalance, formData.crypto_symbol, true)}
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="0.00000001"
                                step="any"
                                className="w-full bg-muted border-none rounded-2xl p-5 font-mono text-xl focus:ring-2 focus:ring-accent/20 transition-all text-center"
                                placeholder="0.00000000"
                                value={formData.amount_crypto}
                                onChange={(e) => setFormData({ ...formData, amount_crypto: e.target.value })}
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-xs">{formData.crypto_symbol}</span>
                        </div>
                    </div>

                    {/* ========== NEW: Narration/Reference Field ========== */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-2">
                            Narration / Reference <span className="text-muted-foreground/60 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            className="w-full bg-muted border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-accent/20 transition-all"
                            placeholder="Fchain username (e.g., chengmicki)"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground/60 ml-2">
                            The person receiving this crypto in Fchain. Leave blank for standard transfer.
                        </p>
                    </div>
                    {/* ========== END NEW FIELD ========== */}

                    {/* Security PIN */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-accent tracking-widest ml-2">
                            Authorization PIN
                        </label>
                        <input
                            type="password"
                            required
                            maxLength={4}
                            className="w-full bg-accent/5 border border-accent/20 rounded-2xl p-5 text-center tracking-[1em] text-2xl focus:bg-accent/10 transition-all font-mono"
                            placeholder="••••"
                            value={formData.pin}
                            onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        {isSubmitting ? 'Processing Transaction...' : `Send ${formData.crypto_symbol}`}
                    </button>
                </div>
            </form>
            {scannerActive && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-3xl w-full max-w-sm flex flex-col items-center">
                        <div className="flex justify-between items-center w-full mb-4">
                            <h3 className="font-black align-left uppercase">Scan QR Code</h3>
                            <button onClick={() => setScannerActive(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Icon name="X" size={24} />
                            </button>
                        </div>

                        {scannerError ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center w-full">
                                {scannerError}
                            </div>
                        ) : (
                            <div id="qr-reader" className="w-full overflow-hidden rounded-xl bg-black min-h-[250px] flex items-center justify-center border-2 border-dashed border-gray-300"></div>
                        )}

                        <button onClick={() => setScannerActive(false)} className="mt-6 w-full py-3 bg-red-500 text-white font-bold tracking-widest uppercase rounded-xl hover:bg-red-600 transition-colors">
                            Close Scanner
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SendCryptoModal;