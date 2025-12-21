import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { Book, User } from '@/types';
import bookRoutes from '@/routes/loans';
import BookSearchField from './BookSearchField';
import UserSearchField from './UserSearchField';
import QRScannerModal from './QRScannerModal';
import { useQRScanner } from './useQRScanner';

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
    const [bookSearch, setBookSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [showBookDropdown, setShowBookDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [loadingLoan, setLoadingLoan] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        book_id: '',
        borrower_id: '',
        action: initialAction,
        loan_date: initialAction === 'borrow' ? new Date().toISOString().split('T')[0] : '',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        return_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // QR Scanner hook
    const {
        showQRScanner,
        qrScanningType,
        qrScanning,
        qrError,
        startQRScanner,
        stopQRScanner,
    } = useQRScanner({
        books,
        users,
        action: data.action,
        onBookScanned: (bookId, title) => {
            setData('book_id', bookId);
            setBookSearch(title);
        },
        onUserScanned: (userId, name) => {
            setData('borrower_id', userId);
            setUserSearch(name);
        },
    });

    // Filter books based on action and search
    const filteredBooks = useMemo(() => {
        let filtered = books;

        if (data.action === 'borrow') {
            filtered = books.filter(book => book.status?.title === 'Available');
        } else if (data.action === 'return') {
            filtered = books.filter(book => book.status?.title === 'Loaned' || book.status?.title === 'Borrowed');
        }

        if (bookSearch) {
            const searchLower = bookSearch.toLowerCase();
            filtered = filtered.filter(book =>
                book.title?.toLowerCase().includes(searchLower) ||
                book.isbn?.toLowerCase().includes(searchLower) ||
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
            (user.first_name?.toLowerCase().includes(searchLower)) ||
            (user.last_name?.toLowerCase().includes(searchLower)) ||
            (user.email?.toLowerCase().includes(searchLower)) ||
            user.id.toString().includes(searchLower)
        );
    }, [users, userSearch]);

    // Get selected book and user for display
    const selectedBook = books.find(b => b.id.toString() === data.book_id);
    const selectedUser = users.find(u => u.id.toString() === data.borrower_id);

    // Auto-populate borrower when book is selected for return
    useEffect(() => {
        const fetchActiveLoan = async () => {
            if (data.action === 'return' && data.book_id) {
                setLoadingLoan(true);
                try {
                    // Fetch the active loan for this book
                    const response = await fetch(`/api/books/${data.book_id}/active-loan`);
                    if (response.ok) {
                        const loanData = await response.json();
                        if (loanData && loanData.borrower_id) {
                            setData('borrower_id', loanData.borrower_id.toString());
                            // Also update loan_date if available
                            if (loanData.loan_date) {
                                setData('loan_date', loanData.loan_date);
                            }
                            // Set user search to show borrower name
                            const borrower = users.find(u => u.id === loanData.borrower_id);
                            if (borrower) {
                                setUserSearch(`${borrower.first_name} ${borrower.last_name}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching active loan:', error);
                } finally {
                    setLoadingLoan(false);
                }
            }
        };

        fetchActiveLoan();
    }, [data.action, data.book_id]);

    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            setData({
                book_id: '',
                borrower_id: '',
                action: initialAction,
                loan_date: initialAction === 'borrow' ? today : '', // Only set today for borrow
                due_date: nextWeek,
                return_date: today,
                notes: '',
            });
            clearErrors();
            setBookSearch('');
            setUserSearch('');
            setShowBookDropdown(false);
            setShowUserDropdown(false);

            setTimeout(() => {
                modalRef.current?.querySelector<HTMLInputElement>('input')?.focus();
            }, 100);
        } else {
            if (showQRScanner) {
                stopQRScanner();
            }
        }
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

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.book_id || !data.borrower_id) {
            return;
        }

        // Use different routes based on action type
        const route = data.action === 'borrow' ? bookRoutes.borrow() : bookRoutes.return();

        // Prepare data based on action
        let submitData;
        if (data.action === 'borrow') {
            submitData = {
                book_id: data.book_id,
                borrower_id: data.borrower_id,
                loan_date: data.loan_date ? data.loan_date.split('T')[0] : '',
                due_date: data.due_date ? data.due_date.split('T')[0] : '',
                notes: data.notes,
            };
        } else {
            // For return action
            submitData = {
                book_id: data.book_id,
                return_date: data.return_date ? data.return_date.split('T')[0] : '',
                condition_notes: data.notes, // Map notes to condition_notes
            };
        }
        console.log(data.action, route.url, submitData);
        post(route.url, {
            data: submitData,
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
            loan_date: data.action === 'borrow' ? today : '', // Only set today for borrow
            due_date: nextWeek,
            return_date: today,
            notes: '',
        });
        clearErrors();
    };

    const today = new Date().toISOString().split('T')[0];
    const minDueDate = data.loan_date || today;

    if (!isOpen) return null;

    return (
        <>
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

                        {/* Book Selection */}
                        <BookSearchField
                            bookSearch={bookSearch}
                            setBookSearch={setBookSearch}
                            selectedBook={selectedBook}
                            showBookDropdown={showBookDropdown}
                            setShowBookDropdown={setShowBookDropdown}
                            filteredBooks={filteredBooks}
                            onBookSelect={(bookId) => {
                                setData('book_id', bookId);
                                setBookSearch('');
                                setShowBookDropdown(false);
                            }}
                            onClear={() => {
                                setData('book_id', '');
                                setBookSearch('');
                            }}
                            onQRScan={showQRScanner && qrScanningType === 'book' ? stopQRScanner : () => startQRScanner('book')}
                            showQRScanner={showQRScanner}
                            qrScanningType={qrScanningType}
                            action={data.action}
                            error={errors.book_id}
                        />

                        {/* User Selection */}
                        {data.action === 'borrow' ? (
                            <UserSearchField
                                userSearch={userSearch}
                                setUserSearch={setUserSearch}
                                selectedUser={selectedUser}
                                showUserDropdown={showUserDropdown}
                                setShowUserDropdown={setShowUserDropdown}
                                filteredUsers={filteredUsers}
                                onUserSelect={(userId) => {
                                    setData('borrower_id', userId);
                                    setUserSearch('');
                                    setShowUserDropdown(false);
                                }}
                                onClear={() => {
                                    setData('borrower_id', '');
                                    setUserSearch('');
                                }}
                                onQRScan={showQRScanner && qrScanningType === 'user' ? stopQRScanner : () => startQRScanner('user')}
                                showQRScanner={showQRScanner}
                                qrScanningType={qrScanningType}
                                error={errors.borrower_id}
                            />
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Borrower <span className="text-gray-500 text-xs">(Auto-filled)</span>
                                </label>
                                <div className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 flex items-center justify-between">
                                    {loadingLoan ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-gray-400">Loading borrower info...</span>
                                        </div>
                                    ) : selectedUser ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-white">{selectedUser.first_name} {selectedUser.last_name}</span>
                                            <span className="text-gray-500 text-sm">({selectedUser.email})</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">Select a book to see borrower info</span>
                                    )}
                                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                {errors.borrower_id && (
                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.borrower_id}
                                    </p>
                                )}
                            </div>
                        )}

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
                                    readOnly={data.action === 'return'}
                                    disabled={data.action === 'return'}
                                    className={`w-full px-4 py-2.5 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${data.action === 'return'
                                        ? 'bg-gray-800/50 border-gray-700 cursor-not-allowed'
                                        : 'bg-gray-800 border-gray-600'
                                        }`}
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
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
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
            </div>

            {/* QR Scanner Modal */}
            <QRScannerModal
                isOpen={showQRScanner}
                onClose={stopQRScanner}
                scanningType={qrScanningType}
                isScanning={qrScanning}
                error={qrError}
                onRetry={() => {
                    if (qrScanningType) {
                        startQRScanner(qrScanningType);
                    }
                }}
            />
        </>
    );
};

export default ManualEntryModal;