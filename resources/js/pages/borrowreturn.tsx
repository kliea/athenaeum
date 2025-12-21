import App from '@/actions/App';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps, Book, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import React, { useState } from 'react';
import {
    HiMiniDocumentArrowUp,
    HiMiniDocumentArrowDown,
} from 'react-icons/hi2';
import { borrowreturn } from '@/routes';
import ManualEntryModal from '@/components/ManualEntryModal';

interface BorrowReturnProps extends PageProps {
    books: Book[];
    users: User[];
}

const BorrowReturnPage: React.FC = () => {
    const { books, users } = usePage<BorrowReturnProps>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<'borrow' | 'return'>('borrow');

    const handleManualEntry = (action: 'borrow' | 'return') => {
        setModalAction(action);
        setIsModalOpen(true);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Borrow/Return',
            href: borrowreturn().url,
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Borrow/Return Books" />
            <div className='flex flex-col justify-center items-center min-h-screen gap-8'>
                {/* Header Section */}
                <div className='text-center max-w-2xl'>
                    <h1 className='text-3xl font-bold text-white mb-3'>
                        Book Borrowing & Returning
                    </h1>
                    <p className='text-gray-300 text-lg'>
                        Log the borrowing and returning of books into the system
                    </p>
                </div>

                {/* Cards Container */}
                <div className='flex flex-col md:flex-row gap-8 max-w-4xl w-full justify-center '>
                    {/* Borrow Card */}
                    <Card className='w-full md:w-96 bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700 p-10 '>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-2xl font-semibold text-white'>Book Out</h2>
                            <HiMiniDocumentArrowUp className='size-8 text-blue-400' />
                        </div>
                        <p className='text-gray-300 mb-6 leading-relaxed'>
                            Track book borrowing with manual entry
                        </p>
                        <div className='flex justify-center'>
                            <button
                                onClick={() => handleManualEntry('borrow')}
                                className='w-full px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium shadow-lg'
                            >
                                Borrow Book
                            </button>
                        </div>
                    </Card>

                    {/* Return Card */}
                    <Card className='w-full md:w-96 bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700 p-10'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-2xl font-semibold text-white'>Book In</h2>
                            <HiMiniDocumentArrowDown className='size-8 text-green-400' />
                        </div>
                        <p className='text-gray-300 mb-6 leading-relaxed'>
                            Track book returning with manual entry
                        </p>
                        <div className='flex justify-center'>
                            <button
                                onClick={() => handleManualEntry('return')}
                                className='w-full px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium shadow-lg'
                            >
                                Return Book
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            <ManualEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialAction={modalAction}
                books={books}
                users={users}
            />

        </AppLayout>
    );
};

export default BorrowReturnPage;