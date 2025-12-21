import React from 'react';
import { User } from '@/types';
import { QrCode, X } from 'lucide-react';

interface UserSearchFieldProps {
    userSearch: string;
    setUserSearch: (value: string) => void;
    selectedUser: User | undefined;
    showUserDropdown: boolean;
    setShowUserDropdown: (show: boolean) => void;
    filteredUsers: User[];
    onUserSelect: (userId: string) => void;
    onClear: () => void;
    onQRScan: () => void;
    showQRScanner: boolean;
    qrScanningType: 'book' | 'user' | null;
    error?: string;
}

const UserSearchField: React.FC<UserSearchFieldProps> = ({
    userSearch,
    setUserSearch,
    selectedUser,
    showUserDropdown,
    setShowUserDropdown,
    filteredUsers,
    onUserSelect,
    onClear,
    onQRScan,
    showQRScanner,
    qrScanningType,
    error,
}) => {
    return (
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
                                onClear();
                            }
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        placeholder="Search by name, email, or ID..."
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                    />
                    {selectedUser && (
                        <button
                            type="button"
                            onClick={onClear}
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
                    onClick={onQRScan}
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
                            onClick={() => onUserSelect(user.id.toString())}
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
            {error && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default UserSearchField;