import React, { useState, useEffect } from 'react';
import TableComponent from '../components/TableComponent';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem, PageProps, Paginated, Author, Book } from '@/types';
import { bookmanagement } from '@/routes';
import BookForm from '@/components/BookForm';
import Pagination from '@/components/pagination';
import { debounce } from 'lodash';
import booksRoutes from '@/routes/books'; // Import Wayfinder routes

interface BookPageProps extends PageProps {
    books: Paginated<Book>;
    authors: Author[];
    filters: {
        search: string;
    };
}

const BookManagementPage = () => {
    const { books, authors, filters } = usePage<BookPageProps>().props;
    const [searchTerm, setSearchTerm] = useState<string>(filters.search || '');
    const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const debouncedSearch = debounce((term: string) => {
        router.get(bookmanagement().url, { search: term }, { preserveState: true, replace: true });
    }, 300);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        debouncedSearch(term);
    };

    const formatBookData = (book: Book) => ({
        id: book.id,
        title: book.title,
        author: book.authors.map(a => `${a.first_name} ${a.last_name}`).join(', '),
        status: book.status?.title || 'Unknown',
        rawData: book
    });

    const formattedBooks = books.data.map(formatBookData);

    const handleEdit = (item: ReturnType<typeof formatBookData>) => {
        setEditingBook(item.rawData);
        setIsFormOpen(true);
    };

    const handleDelete = (item: ReturnType<typeof formatBookData>) => {
        const destroyUrl = booksRoutes.destroy.url({ book: item.rawData.id });
        if (confirm('Are you sure you want to delete this book?')) {
            router.delete(destroyUrl, {
                onSuccess: () => {
                    router.reload({ only: ['books'] });
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    alert('Failed to delete book.');
                },
            });
        }
    };

    const handleAddNewBook = () => {
        setEditingBook(undefined);
        setIsFormOpen(true);
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
        <AppLayout breadcrumbs={breadcrumbs}>
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
                                {books.total} book{books.total !== 1 ? 's' : ''}{' '}
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
                                    onChange={handleSearchChange}
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
                        data={formattedBooks}
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
                    <div className="mt-4">
                        <Pagination links={books.links} meta={books} />
                    </div>
                </div>
                {isFormOpen && (
                    <BookForm
                        book={editingBook}
                        authors={authors}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default BookManagementPage;