import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { Book, User } from '@/types';
import { route } from 'ziggy-js';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, X } from 'lucide-react';

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialAction: 'borrow' | 'return';
    books: Book[];
    users: User[];
}

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
    isOpen,
    onClose,
    initialAction,
    books,
    users,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const [bookSearch, setBookSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [showBookDropdown, setShowBookDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [qrScanningType, setQrScanningType] = useState<'book' | 'user' | null>(null);
    const [qrScanning, setQrScanning] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        book_id: '',
        borrower_id: '',
        action: initialAction,
        loan_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 week
        return_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Filter books based on action and search
    const filteredBooks = useMemo(() => {
        let filtered = books;

        // For borrow action, only show available books
        if (data.action === 'borrow') {
            filtered = books.filter(book => book.status?.title === 'Available');
        }

        // Apply search filter
        if (bookSearch) {
            const searchLower = bookSearch.toLowerCase();
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(searchLower) ||
                book.isbn.toLowerCase().includes(searchLower) ||
                book.id.toString().includes(searchLower)
            );
        }

        return filtered;
    }, [books, data.action, bookSearch]);

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        if (!userSearch) return users;
        const searchLower = userSearch.toLowerCase();
        return users.filter(user =>
            user.first_name.toLowerCase().includes(searchLower) ||
            user.last_name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.id.toString().includes(searchLower)
        );
    }, [users, userSearch]);

    // Get selected book and user for display
    const selectedBook = books.find(b => b.id.toString() === data.book_id);
    const selectedUser = users.find(u => u.id.toString() === data.borrower_id);

    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            setData({
                book_id: '',
                borrower_id: '',
                action: initialAction,
                loan_date: today,
                due_date: nextWeek,
                return_date: today,
                notes: '',
            });
            clearErrors();
            setBookSearch('');
            setUserSearch('');
            setShowBookDropdown(false);
            setShowUserDropdown(false);
            setQrScanningType(null);

            // Focus first input
            setTimeout(() => {
                modalRef.current?.querySelector<HTMLInputElement>('input')?.focus();
            }, 100);
        } else {
            // Cleanup QR scanner when modal closes
            if (qrScannerRef.current) {
                stopQRScanner();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialAction]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                if (showQRScanner) {
                    stopQRScanner();
                } else {
                    setShowBookDropdown(false);
                    setShowUserDropdown(false);
                    if (!showBookDropdown && !showUserDropdown) {
                        onClose();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, showBookDropdown, showUserDropdown, showQRScanner]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setShowBookDropdown(false);
                setShowUserDropdown(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Handle click outside modal
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
        if (!data.book_id) {
            setData('book_id', '');
            return;
        }
        if (!data.borrower_id) {
            setData('borrower_id', '');
            return;
        }

        post(route('loans.manual'), {
            onSuccess: () => {
                reset();
                setBookSearch('');
                setUserSearch('');
                onClose();
            },
        });
    };

    const handleClearForm = () => {
        reset();
        setBookSearch('');
        setUserSearch('');
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setData({
            book_id: '',
            borrower_id: '',
            action: data.action,
            loan_date: today,
            due_date: nextWeek,
            return_date: today,
            notes: '',
        });
        clearErrors();
    };

    const handleBookSelect = (bookId: string) => {
        setData('book_id', bookId);
        setBookSearch('');
        setShowBookDropdown(false);
    };

    const handleUserSelect = (userId: string) => {
        setData('borrower_id', userId);
        setUserSearch('');
        setShowUserDropdown(false);
    };

    // Check and request camera permissions
    const requestCameraPermission = async (): Promise<boolean> => {
        try {
            // Check if browser supports getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setQrError('Your browser does not support camera access. Please use a modern browser (Chrome, Firefox, Edge, or Safari).');
                return false;
            }

            // Check if we're on HTTPS or localhost (required for camera access in most browsers)
            const isSecureContext = window.isSecureContext ||
                window.location.protocol === 'https:' ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            if (!isSecureContext) {
                setQrError('Camera access requires HTTPS or localhost. Please access this site via HTTPS or use localhost.');
                return false;
            }

            // Request camera permission
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // Stop the stream immediately - we just needed to request permission
                stream.getTracks().forEach(track => track.stop());
                return true;
            } catch (permissionError: any) {
                console.error('Camera permission error:', permissionError);

                if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
                    setQrError('Camera permission denied. Please allow camera access in your browser settings and try again.');
                } else if (permissionError.name === 'NotFoundError' || permissionError.name === 'DevicesNotFoundError') {
                    setQrError('No camera found. Please connect a camera and try again.');
                } else if (permissionError.name === 'NotReadableError' || permissionError.name === 'TrackStartError') {
                    setQrError('Camera is already in use by another application. Please close other apps using the camera.');
                } else {
                    setQrError(`Camera error: ${permissionError.message || 'Unable to access camera'}`);
                }
                return false;
            }
        } catch (err: any) {
            console.error('Permission check error:', err);
            setQrError('Failed to check camera permissions. Please ensure your browser supports camera access.');
            return false;
        }
    };

    // QR Scanner functions
    const startQRScanner = async (type: 'book' | 'user') => {
        try {
            // Stop any existing scanner first
            if (qrScannerRef.current) {
                try {
                    await qrScannerRef.current.stop().catch(() => { });
                    qrScannerRef.current.clear();
                    qrScannerRef.current = null;
                } catch (cleanupError) {
                    console.warn('Error cleaning up existing scanner:', cleanupError);
                }
            }

            setQrError(null);
            setShowQRScanner(true);
            setQrScanningType(type);
            setQrScanning(true);

            // Request camera permission first
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                setQrScanning(false);
                setQrScanningType(null);
                return;
            }

            // Small delay to ensure permission is fully granted and DOM is ready
            await new Promise(resolve => setTimeout(resolve, 500));

            // Ensure the QR reader element exists
            const qrCodeRegionId = 'qr-reader';
            const qrReaderElement = document.getElementById(qrCodeRegionId);
            if (!qrReaderElement) {
                throw new Error('QR reader element not found in DOM');
            }

            qrScannerRef.current = new Html5Qrcode(qrCodeRegionId);

            // Try to get available cameras with better error handling
            let cameraId: string | null = null;
            let cameraConfig: any = { facingMode: 'environment' }; // Default to back camera

            try {
                const devices = await Html5Qrcode.getCameras();
                console.log('Available cameras:', devices);

                if (devices && devices.length > 0) {
                    // Prefer back camera, fallback to first available
                    const backCamera = devices.find((d: any) =>
                        d.label?.toLowerCase().includes('back') ||
                        d.label?.toLowerCase().includes('rear') ||
                        d.label?.toLowerCase().includes('environment')
                    );

                    if (backCamera) {
                        cameraId = backCamera.id;
                        cameraConfig = cameraId;
                    } else {
                        cameraId = devices[0].id;
                        cameraConfig = cameraId;
                    }
                    console.log('Using camera:', cameraId);
                } else {
                    console.warn('No cameras found, using facingMode');
                }
            } catch (cameraListError: any) {
                console.warn('Could not enumerate cameras, using default:', cameraListError);
                // Fallback to facingMode - this is fine for most cases
                cameraConfig = { facingMode: 'environment' };
            }

            // Try starting with deviceId first, fallback to facingMode
            const startScanner = async (config: string | { facingMode: string }) => {
                return qrScannerRef.current!.start(
                    config,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        // QR code scanned successfully
                        handleQRScanned(decodedText, type);
                    },
                    (errorMessage) => {
                        // Ignore scanning errors (they're frequent during scanning)
                        // Only log if it's a significant error
                        if (errorMessage && !errorMessage.includes('NotFoundException')) {
                            console.debug('QR scan error:', errorMessage);
                        }
                    }
                );
            };

            try {
                // Try with cameraId if available, otherwise use facingMode
                if (cameraId) {
                    try {
                        await startScanner(cameraId);
                        setQrScanning(false);
                    } catch (deviceError: any) {
                        console.warn('Failed to start with deviceId, trying facingMode:', deviceError);
                        // Clean up before retry
                        try {
                            await qrScannerRef.current.stop().catch(() => { });
                        } catch { }
                        // Retry with facingMode
                        await startScanner({ facingMode: 'environment' });
                        setQrScanning(false);
                    }
                } else {
                    // Use facingMode directly
                    await startScanner({ facingMode: 'environment' });
                    setQrScanning(false);
                }
            } catch (startError: any) {
                throw startError; // Re-throw to be caught by outer catch
            }
        } catch (err: any) {
            console.error('QR Scanner error:', err);
            console.error('Error details:', {
                name: err?.name,
                message: err?.message,
                stack: err?.stack,
                toString: err?.toString()
            });

            let errorMessage = 'Failed to start camera. ';

            // Check for specific error types
            const errorStr = String(err?.message || err?.toString() || '').toLowerCase();
            const errorName = err?.name || '';

            if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorStr.includes('permission')) {
                errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and refresh the page.';
            } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError' || errorStr.includes('no camera') || errorStr.includes('camera not found')) {
                errorMessage = 'No camera found. Please connect a camera and try again.';
            } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError' || errorStr.includes('already in use') || errorStr.includes('busy')) {
                errorMessage = 'Camera is already in use by another application. Please close other apps using the camera and try again.';
            } else if (errorStr.includes('not supported') || errorStr.includes('not available')) {
                errorMessage = 'Camera access is not supported in this browser. Please use Chrome, Firefox, or Edge.';
            } else if (err?.message) {
                // Show the actual error message for debugging
                errorMessage = `Camera error: ${err.message}`;
            } else if (err?.toString && err.toString() !== '[object Object]') {
                errorMessage = `Camera error: ${err.toString()}`;
            } else {
                errorMessage = `Failed to start camera. Error: ${errorName || 'Unknown error'}. Please check browser console for details.`;
            }

            setQrError(errorMessage);
            setQrScanning(false);
            setQrScanningType(null);

            // Clean up if scanner was partially initialized
            if (qrScannerRef.current) {
                try {
                    await qrScannerRef.current.stop().catch(() => { });
                    qrScannerRef.current.clear();
                    qrScannerRef.current = null;
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError);
                }
            }
        }
    };

    const stopQRScanner = async () => {
        try {
            if (qrScannerRef.current) {
                await qrScannerRef.current.stop();
                qrScannerRef.current.clear();
                qrScannerRef.current = null;
            }
        } catch (err) {
            console.error('Error stopping QR scanner:', err);
        } finally {
            setQrScanning(false);
            setShowQRScanner(false);
            setQrScanningType(null);
            setQrError(null);
        }
    };

    const handleQRScanned = (scannedText: string, type: 'book' | 'user') => {
        if (type === 'book') {
            // Try to extract book ID from scanned text
            // QR code might contain just the ID, or a URL with ID, or JSON
            let bookId: string | null = null;

            try {
                // Try parsing as JSON first
                const parsed = JSON.parse(scannedText);
                bookId = parsed.book_id || parsed.id || parsed.bookId;
            } catch {
                // Not JSON, try to extract ID from URL or use as-is
                const urlMatch = scannedText.match(/book[_-]?id[=:](\d+)/i) || scannedText.match(/\/books\/(\d+)/i);
                if (urlMatch) {
                    bookId = urlMatch[1];
                } else if (/^\d+$/.test(scannedText.trim())) {
                    // If it's just a number, assume it's the book ID
                    bookId = scannedText.trim();
                }
            }

            if (bookId) {
                // Check if book exists
                const book = books.find(b => b.id.toString() === bookId);
                if (book) {
                    // Check if book is available for borrow action
                    if (data.action === 'borrow' && book.status?.title !== 'Available') {
                        setQrError(`Book "${book.title}" is not available for borrowing.`);
                        return;
                    }
                    setData('book_id', bookId);
                    setBookSearch(book.title);
                    stopQRScanner();
                } else {
                    setQrError(`Book with ID ${bookId} not found.`);
                }
            } else {
                setQrError('Invalid QR code format. Please scan a valid book QR code.');
            }
        } else if (type === 'user') {
            // Try to extract user ID from scanned text
            let userId: string | null = null;

            try {
                // Try parsing as JSON first
                const parsed = JSON.parse(scannedText);
                userId = parsed.user_id || parsed.borrower_id || parsed.id || parsed.userId;
            } catch {
                // Not JSON, try to extract ID from URL or use as-is
                const urlMatch = scannedText.match(/user[_-]?id[=:](\d+)/i) ||
                    scannedText.match(/borrower[_-]?id[=:](\d+)/i) ||
                    scannedText.match(/\/users\/(\d+)/i);
                if (urlMatch) {
                    userId = urlMatch[1];
                } else if (/^\d+$/.test(scannedText.trim())) {
                    // If it's just a number, assume it's the user ID
                    userId = scannedText.trim();
                }
            }

            if (userId) {
                // Check if user exists
                const user = users.find(u => u.id.toString() === userId);
                if (user) {
                    setData('borrower_id', userId);
                    setUserSearch(`${user.first_name} ${user.last_name}`);
                    stopQRScanner();
                } else {
                    setQrError(`User with ID ${userId} not found.`);
                }
            } else {
                setQrError('Invalid QR code format. Please scan a valid user QR code.');
            }
        }
    };

    // Calculate min dates for validation
    const today = new Date().toISOString().split('T')[0];
    const minDueDate = data.loan_date || today;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <h3 id="modal-title" className="text-xl font-bold text-white">
                            {data.action === 'borrow' ? 'Borrow Book' : 'Return Book'}
                        </h3>
                        {/* Action Toggle */}
                        <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setData('action', 'borrow');
                                    setData('book_id', '');
                                    setBookSearch('');
                                }}
                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${data.action === 'borrow'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Borrow
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setData('action', 'return');
                                    setData('book_id', '');
                                    setBookSearch('');
                                }}
                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${data.action === 'return'
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Return
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Action Indicator */}
                    <div className={`p-3 rounded-lg flex items-center justify-center font-bold text-lg ${data.action === 'borrow'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                        : 'bg-green-600/20 text-green-400 border border-green-600/50'
                        }`}>
                        {data.action === 'borrow' ? '📚 Borrowing Book' : '📥 Returning Book'}
                    </div>

                    {/* Book Selection with Search */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Book <span className="text-red-400">*</span>
                            {data.action === 'borrow' && (
                                <span className="text-xs text-gray-500 ml-2">(Only available books shown)</span>
                            )}
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={bookSearch || selectedBook?.title || ''}
                                    onChange={(e) => {
                                        setBookSearch(e.target.value);
                                        setShowBookDropdown(true);
                                        if (!e.target.value) {
                                            setData('book_id', '');
                                        }
                                    }}
                                    onFocus={() => setShowBookDropdown(true)}
                                    placeholder="Search by title, ISBN, or ID..."
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                                />
                                {data.book_id && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('book_id', '');
                                            setBookSearch('');
                                        }}
                                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        aria-label="Clear selection"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button
                                type="button"
                                onClick={showQRScanner && qrScanningType === 'book' ? stopQRScanner : () => startQRScanner('book')}
                                className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${showQRScanner && qrScanningType === 'book'
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                    }`}
                                title={showQRScanner && qrScanningType === 'book' ? 'Stop QR Scanner' : 'Scan Book QR Code'}
                            >
                                {showQRScanner && qrScanningType === 'book' ? (
                                    <>
                                        <X className="w-5 h-5" />
                                        <span className="hidden sm:inline">Stop</span>
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="w-5 h-5" />
                                        <span className="hidden sm:inline">Scan QR</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {showBookDropdown && filteredBooks.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredBooks.map((book) => (
                                    <button
                                        key={book.id}
                                        type="button"
                                        onClick={() => handleBookSelect(book.id.toString())}
                                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                                    >
                                        <div className="font-medium">{book.title}</div>
                                        <div className="text-xs text-gray-400">
                                            ISBN: {book.isbn} | ID: {book.id} | Status: {book.status?.title || 'N/A'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {showBookDropdown && filteredBooks.length === 0 && bookSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 text-gray-400 text-center">
                                No books found matching "{bookSearch}"
                            </div>
                        )}
                        {errors.book_id && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.book_id}
                            </p>
                        )}
                    </div>

                    {/* Borrower Selection with Search */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Borrower <span className="text-red-400">*</span>
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={userSearch || selectedUser ? `${selectedUser?.first_name} ${selectedUser?.last_name}` : ''}
                                    onChange={(e) => {
                                        setUserSearch(e.target.value);
                                        setShowUserDropdown(true);
                                        if (!e.target.value) {
                                            setData('borrower_id', '');
                                        }
                                    }}
                                    onFocus={() => setShowUserDropdown(true)}
                                    placeholder="Search by name, email, or ID..."
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                                />
                                {data.borrower_id && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('borrower_id', '');
                                            setUserSearch('');
                                        }}
                                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        aria-label="Clear selection"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button
                                type="button"
                                onClick={showQRScanner && qrScanningType === 'user' ? stopQRScanner : () => startQRScanner('user')}
                                className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${showQRScanner && qrScanningType === 'user'
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                    }`}
                                title={showQRScanner && qrScanningType === 'user' ? 'Stop QR Scanner' : 'Scan User QR Code'}
                            >
                                {showQRScanner && qrScanningType === 'user' ? (
                                    <>
                                        <X className="w-5 h-5" />
                                        <span className="hidden sm:inline">Stop</span>
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="w-5 h-5" />
                                        <span className="hidden sm:inline">Scan QR</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {showUserDropdown && filteredUsers.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleUserSelect(user.id.toString())}
                                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                                    >
                                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                                        <div className="text-xs text-gray-400">
                                            {user.email} | ID: {user.id}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {showUserDropdown && filteredUsers.length === 0 && userSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 text-gray-400 text-center">
                                No users found matching "{userSearch}"
                            </div>
                        )}
                        {errors.borrower_id && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.borrower_id}
                            </p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {data.action === 'borrow' ? 'Loan Date' : 'Original Loan Date (Ref)'} <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.loan_date}
                                onChange={(e) => setData('loan_date', e.target.value)}
                                max={today}
                                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                            {errors.loan_date && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.loan_date}
                                </p>
                            )}
                        </div>

                        {data.action === 'borrow' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Due Date <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    min={minDueDate}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                                {errors.due_date && (
                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.due_date}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Return Date <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.return_date}
                                    onChange={(e) => setData('return_date', e.target.value)}
                                    min={data.loan_date || today}
                                    max={today}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                                {errors.return_date && (
                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.return_date}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Notes <span className="text-gray-500 text-xs">(Optional)</span>
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                            placeholder="Add any additional notes here..."
                        />
                        {errors.notes && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-800">
                        <button
                            type="button"
                            onClick={handleClearForm}
                            className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                        >
                            Clear Form
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.book_id || !data.borrower_id}
                            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all shadow-lg ${data.action === 'borrow'
                                ? 'bg-blue-600 hover:bg-blue-500'
                                : 'bg-green-600 hover:bg-green-500'
                                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-opacity-50`}
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                `Confirm ${data.action === 'borrow' ? 'Borrow' : 'Return'}`
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* QR Scanner Modal */}
            {showQRScanner && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                            <h3 className="text-xl font-bold text-white">
                                {qrScanningType === 'book' ? 'Scan Book QR Code' : 'Scan User QR Code'}
                            </h3>
                            <button
                                onClick={stopQRScanner}
                                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                                aria-label="Close scanner"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                {!qrError && (
                                    <p className="text-sm text-gray-400 mb-2">
                                        Position the {qrScanningType === 'book' ? 'book' : 'user'} QR code within the frame below. The scanner will automatically detect it.
                                    </p>
                                )}
                                {qrError && (
                                    <div className="mb-4 p-4 bg-red-900/20 border border-red-600/50 rounded-lg">
                                        <p className="text-red-400 text-sm flex items-start gap-2 mb-3">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{qrError}</span>
                                        </p>
                                        {qrError.includes('permission') && (
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
                                {qrScanning && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                            <p className="text-white text-sm">Requesting camera access...</p>
                                        </div>
                                    </div>
                                )}
                                {qrError && !qrScanning && (
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
                                {qrError && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQrError(null);
                                            if (qrScanningType) {
                                                startQRScanner(qrScanningType);
                                            }
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                                    >
                                        Retry
                                    </button>
                                )}
                                <div className="flex gap-3 ml-auto">
                                    <button
                                        type="button"
                                        onClick={stopQRScanner}
                                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualEntryModal;
