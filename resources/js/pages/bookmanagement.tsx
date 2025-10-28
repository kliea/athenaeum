import React, { useState } from 'react';
import TableComponent from '../components/TableComponent';
import App from '@/actions/App';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { bookmanagement } from '@/routes';

interface Book {
    id: number;
    title: string;
    author: string;
    status: 'Available' | 'Borrowed';
    actions: string;
}

const bookInfo: Book[] = [
    {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        status: 'Available',
        actions: 'Edit | Delete',
    },
    {
        id: 2,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        status: 'Borrowed',
        actions: 'Edit | Delete',
    },
];

const BookManagementPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Filter books based on search
    const filteredBooks = bookInfo.filter(
        (book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (book: Book) => {
        console.log('Edit:', book);
        // Implement edit logic
    };

    const handleDelete = (book: Book) => {
        console.log('Delete:', book);
        // Implement delete logic
    };

    const handleAddNewBook = () => {
        console.log('Add new book clicked');
        // Implement add new book logic
    };

    const handleFilter = () => {
        console.log('Filter clicked');
        // Implement filter logic
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Book Management',
            href: bookmanagement().url,
        },
    ];
    return (
        <AppLayout>
            <Head title="Book Management" />

            <div className='p-4'>
                <div className='bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl'>
                    {/* Header Section */}
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
                        <div>
                            <h2 className='text-2xl font-bold text-white mb-2'>
                                Book Collection
                            </h2>
                            <p className='text-gray-300'>
                                {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}{' '}
                                found
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto'>
                            {/* Search Bar */}
                            <div className='relative'>
                                <svg
                                    className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                    />
                                </svg>
                                <input
                                    type='text'
                                    placeholder='Search books...'
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    className='pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full'
                                />
                            </div>

                            <div className='flex gap-3'>
                                <button
                                    onClick={handleFilter}
                                    className='px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95'
                                >
                                    <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                                        />
                                    </svg>
                                    Filter
                                </button>
                                <button
                                    onClick={handleAddNewBook}
                                    className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/25'
                                >
                                    <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 4v16m8-8H4'
                                        />
                                    </svg>
                                    Add New Book
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <TableComponent
                        data={filteredBooks}
                        columns={[
                            'Book ID',
                            'Book Title',
                            'Book Author',
                            'Status',
                            'Actions',
                        ]}
                        variant='management'
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        emptyMessage='No books to manage'
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default BookManagementPage;