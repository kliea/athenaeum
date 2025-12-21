import { Book, User } from '@/types';
import { Html5Qrcode } from 'html5-qrcode';
import { useCallback, useRef, useState } from 'react';

interface UseQRScannerProps {
    books: Book[];
    users: User[];
    action: 'borrow' | 'return';
    onBookScanned: (bookId: string, title: string) => void;
    onUserScanned: (userId: string, name: string) => void;
}

export const useQRScanner = ({
    books,
    users,
    action,
    onBookScanned,
    onUserScanned,
}: UseQRScannerProps) => {
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [qrScanningType, setQrScanningType] = useState<
        'book' | 'user' | null
    >(null);
    const [qrScanning, setQrScanning] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);

    const requestCameraPermission = async (): Promise<boolean> => {
        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                setQrError(
                    'Your browser does not support camera access. Please use a modern browser (Chrome, Firefox, Edge, or Safari).',
                );
                return false;
            }

            const isSecureContext =
                window.isSecureContext ||
                window.location.protocol === 'https:' ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            if (!isSecureContext) {
                setQrError(
                    'Camera access requires HTTPS or localhost. Please access this site via HTTPS or use localhost.',
                );
                return false;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                stream.getTracks().forEach((track) => track.stop());
                return true;
            } catch (permissionError: any) {
                console.error('Camera permission error:', permissionError);

                if (
                    permissionError.name === 'NotAllowedError' ||
                    permissionError.name === 'PermissionDeniedError'
                ) {
                    setQrError(
                        'Camera permission denied. Please allow camera access in your browser settings and try again.',
                    );
                } else if (
                    permissionError.name === 'NotFoundError' ||
                    permissionError.name === 'DevicesNotFoundError'
                ) {
                    setQrError(
                        'No camera found. Please connect a camera and try again.',
                    );
                } else if (
                    permissionError.name === 'NotReadableError' ||
                    permissionError.name === 'TrackStartError'
                ) {
                    setQrError(
                        'Camera is already in use by another application. Please close other apps using the camera.',
                    );
                } else {
                    setQrError(
                        `Camera error: ${permissionError.message || 'Unable to access camera'}`,
                    );
                }
                return false;
            }
        } catch (err: any) {
            console.error('Permission check error:', err);
            setQrError(
                'Failed to check camera permissions. Please ensure your browser supports camera access.',
            );
            return false;
        }
    };

    const handleQRScanned = useCallback(
        (scannedText: string, type: 'book' | 'user') => {
            if (type === 'book') {
                let bookId: string | null = null;

                try {
                    const parsed = JSON.parse(scannedText);
                    bookId = parsed.book_id || parsed.id || parsed.bookId;
                } catch {
                    const urlMatch =
                        scannedText.match(/book[_-]?id[=:](\d+)/i) ||
                        scannedText.match(/\/books\/(\d+)/i);
                    if (urlMatch) {
                        bookId = urlMatch[1];
                    } else if (/^\d+$/.test(scannedText.trim())) {
                        bookId = scannedText.trim();
                    }
                }

                if (bookId) {
                    const book = books.find((b) => b.id.toString() === bookId);
                    if (book) {
                        if (
                            action === 'borrow' &&
                            book.status?.title !== 'Available'
                        ) {
                            setQrError(
                                `Book "${book.title}" is not available for borrowing.`,
                            );
                            return;
                        }
                        onBookScanned(bookId, book.title);
                        stopQRScanner();
                    } else {
                        setQrError(`Book with ID ${bookId} not found.`);
                    }
                } else {
                    setQrError(
                        'Invalid QR code format. Please scan a valid book QR code.',
                    );
                }
            } else if (type === 'user') {
                let userId: string | null = null;

                try {
                    const parsed = JSON.parse(scannedText);
                    userId =
                        parsed.user_id ||
                        parsed.borrower_id ||
                        parsed.id ||
                        parsed.userId;
                } catch {
                    const urlMatch =
                        scannedText.match(/user[_-]?id[=:](\d+)/i) ||
                        scannedText.match(/borrower[_-]?id[=:](\d+)/i) ||
                        scannedText.match(/\/users\/(\d+)/i);
                    if (urlMatch) {
                        userId = urlMatch[1];
                    } else if (/^\d+$/.test(scannedText.trim())) {
                        userId = scannedText.trim();
                    }
                }

                if (userId) {
                    const user = users.find((u) => u.id.toString() === userId);
                    if (user) {
                        onUserScanned(
                            userId,
                            `${user.first_name} ${user.last_name}`,
                        );
                        stopQRScanner();
                    } else {
                        setQrError(`User with ID ${userId} not found.`);
                    }
                } else {
                    setQrError(
                        'Invalid QR code format. Please scan a valid user QR code.',
                    );
                }
            }
        },
        [books, users, action, onBookScanned, onUserScanned],
    );

    const startQRScanner = async (type: 'book' | 'user') => {
        try {
            if (qrScannerRef.current) {
                try {
                    await qrScannerRef.current.stop().catch(() => {});
                    qrScannerRef.current.clear();
                    qrScannerRef.current = null;
                } catch (cleanupError) {
                    console.warn(
                        'Error cleaning up existing scanner:',
                        cleanupError,
                    );
                }
            }

            setQrError(null);
            setShowQRScanner(true);
            setQrScanningType(type);
            setQrScanning(true);

            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                setQrScanning(false);
                setQrScanningType(null);
                return;
            }

            await new Promise((resolve) => setTimeout(resolve, 500));

            const qrCodeRegionId = 'qr-reader';
            const qrReaderElement = document.getElementById(qrCodeRegionId);
            if (!qrReaderElement) {
                throw new Error('QR reader element not found in DOM');
            }

            qrScannerRef.current = new Html5Qrcode(qrCodeRegionId);

            let cameraId: string | null = null;
            let cameraConfig: any = { facingMode: 'environment' };

            try {
                const devices = await Html5Qrcode.getCameras();
                console.log('Available cameras:', devices);

                if (devices && devices.length > 0) {
                    const backCamera = devices.find(
                        (d: any) =>
                            d.label?.toLowerCase().includes('back') ||
                            d.label?.toLowerCase().includes('rear') ||
                            d.label?.toLowerCase().includes('environment'),
                    );

                    if (backCamera) {
                        cameraId = backCamera.id;
                        cameraConfig = cameraId;
                    } else {
                        cameraId = devices[0].id;
                        cameraConfig = cameraId;
                    }
                    console.log('Using camera:', cameraId);
                }
            } catch (cameraListError: any) {
                console.warn(
                    'Could not enumerate cameras, using default:',
                    cameraListError,
                );
                cameraConfig = { facingMode: 'environment' };
            }

            const startScanner = async (
                config: string | { facingMode: string },
            ) => {
                return qrScannerRef.current!.start(
                    config,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        handleQRScanned(decodedText, type);
                    },
                    (errorMessage) => {
                        if (
                            errorMessage &&
                            !errorMessage.includes('NotFoundException')
                        ) {
                            console.debug('QR scan error:', errorMessage);
                        }
                    },
                );
            };

            try {
                if (cameraId) {
                    try {
                        await startScanner(cameraId);
                        setQrScanning(false);
                    } catch (deviceError: any) {
                        console.warn(
                            'Failed to start with deviceId, trying facingMode:',
                            deviceError,
                        );
                        try {
                            await qrScannerRef.current.stop().catch(() => {});
                        } catch {}
                        await startScanner({ facingMode: 'environment' });
                        setQrScanning(false);
                    }
                } else {
                    await startScanner({ facingMode: 'environment' });
                    setQrScanning(false);
                }
            } catch (startError: any) {
                throw startError;
            }
        } catch (err: any) {
            console.error('QR Scanner error:', err);

            let errorMessage = 'Failed to start camera. ';
            const errorStr = String(
                err?.message || err?.toString() || '',
            ).toLowerCase();
            const errorName = err?.name || '';

            if (
                errorName === 'NotAllowedError' ||
                errorName === 'PermissionDeniedError' ||
                errorStr.includes('permission')
            ) {
                errorMessage =
                    'Camera permission denied. Please allow camera access in your browser settings and refresh the page.';
            } else if (
                errorName === 'NotFoundError' ||
                errorName === 'DevicesNotFoundError' ||
                errorStr.includes('no camera')
            ) {
                errorMessage =
                    'No camera found. Please connect a camera and try again.';
            } else if (
                errorName === 'NotReadableError' ||
                errorName === 'TrackStartError' ||
                errorStr.includes('already in use')
            ) {
                errorMessage =
                    'Camera is already in use by another application. Please close other apps using the camera and try again.';
            } else if (
                errorStr.includes('not supported') ||
                errorStr.includes('not available')
            ) {
                errorMessage =
                    'Camera access is not supported in this browser. Please use Chrome, Firefox, or Edge.';
            } else if (err?.message) {
                errorMessage = `Camera error: ${err.message}`;
            } else {
                errorMessage = `Failed to start camera. Error: ${errorName || 'Unknown error'}`;
            }

            setQrError(errorMessage);
            setQrScanning(false);
            setQrScanningType(null);

            if (qrScannerRef.current) {
                try {
                    await qrScannerRef.current.stop().catch(() => {});
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

    return {
        showQRScanner,
        qrScanningType,
        qrScanning,
        qrError,
        startQRScanner,
        stopQRScanner,
    };
};

export default useQRScanner;
