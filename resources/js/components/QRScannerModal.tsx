import React from 'react';
import { X } from 'lucide-react';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    scanningType: 'book' | 'user' | null;
    isScanning: boolean;
    error: string | null;
    onRetry: () => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({
    isOpen,
    onClose,
    scanningType,
    isScanning,
    error,
    onRetry,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                    <h3 className="text-xl font-bold text-white">
                        {scanningType === 'book' ? 'Scan Book QR Code' : 'Scan User QR Code'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                        aria-label="Close scanner"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        {!error && (
                            <p className="text-sm text-gray-400 mb-2">
                                Position the {scanningType === 'book' ? 'book' : 'user'} QR code within the frame below. The scanner will automatically detect it.
                            </p>
                        )}
                        {error && (
                            <div className="mb-4 p-4 bg-red-900/20 border border-red-600/50 rounded-lg">
                                <p className="text-red-400 text-sm flex items-start gap-2 mb-3">
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </p>
                                {error.includes('permission') && (
                                    <div className="mt-3 pt-3 border-t border-red-600/30">
                                        <p className="text-xs text-gray-400 mb-2">How to grant camera permission:</p>
                                        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                                            <li>Click the camera icon in your browser's address bar</li>
                                            <li>Or go to browser Settings → Privacy → Camera</li>
                                            <li>Allow camera access for this site</li>
                                            <li>Refresh the page and try again</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <div
                            id="qr-reader"
                            className="w-full rounded-lg overflow-hidden bg-gray-800"
                            style={{ minHeight: '300px' }}
                        ></div>
                        {isScanning && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                    <p className="text-white text-sm">Requesting camera access...</p>
                                </div>
                            </div>
                        )}
                        {error && !isScanning && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-lg">
                                <div className="text-center p-4">
                                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-white text-sm mb-4">Camera access required</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-between items-center gap-3">
                        {error && (
                            <button
                                type="button"
                                onClick={onRetry}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                            >
                                Retry
                            </button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScannerModal;