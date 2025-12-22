import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card } from "@/components/ui/card";
import TableComponent from '@/components/TableComponent';

interface DashboardStats {
    borrowed_books_count: number;
    todays_visitors: number;
    total_books: number;
    available_books: number;
    borrowed_this_week: number;
    visitors_this_month: number;
    new_additions: number;
    availability_percentage: number;
    total_members?: number;
    pending_returns?: number;
    todays_loans?: number;
    success?: boolean;
    message?: string;
}

interface Book {
    id: number;
    title: string;
    author: string;
    status: string;
    isbn?: string;
    cover_url?: string;
}

interface PageProps {
    stats: DashboardStats;
    data: Book[];
    total: number;
    available_count?: number;
    borrowed_count?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Fallback data
const fallbackStats: DashboardStats = {
    borrowed_books_count: 24,
    todays_visitors: 156,
    total_books: 2847,
    available_books: 1923,
    borrowed_this_week: 2,
    visitors_this_month: 12,
    new_additions: 45,
    availability_percentage: 67,
    total_members: 125,
    pending_returns: 3,
    success: false,
    message: 'Using fallback data'
};

const fallbackBooks: Book[] = [
    {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        status: 'Available',
        isbn: '9780743273565',
    },
    {
        id: 2,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        status: 'Borrowed',
        isbn: '9780061120084',
    },
];

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const [loading, setLoading] = useState(false);

    console.log('Dashboarddd props:', props.recentBooks);
    // Use props if available, otherwise use fallback
    const recentBooks = props.recentBooks || fallbackBooks;
    const totalBooks = props.total || recentBooks.length || 0;
    const stats = props.stats || fallbackStats;
    const usingFallback = !props.data;

    // Filter and sort: borrowed books on top
    const borrowedBooks = recentBooks.filter(book => book.status.toLowerCase() === 'borrowed');
    const otherBooks = recentBooks.filter(book => book.status.toLowerCase() !== 'borrowed');
    const sortedBooks = [...borrowedBooks, ...otherBooks];

    const refreshData = () => {
        setLoading(true);
        window.location.reload(); // Simple refresh
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
                return 'text-green-400';
            case 'borrowed':
                return 'text-yellow-400';
            case 'reserved':
                return 'text-blue-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className='p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen'>
                {/* Header Section */}
                <div className='mb-8'>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h1 className='text-4xl font-bold text-white mb-2'>
                                Library Dashboard
                            </h1>
                            <p className='text-gray-300'>
                                Manage your library collection and track book status
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refreshData}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                                disabled={loading}
                            >
                                <svg
                                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards Section */}
                <div className='mb-8'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        {/* Books Borrowed Card */}
                        <Card className='bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                            <div className='text-center p-6'>
                                <div className='bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
                                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                                    </svg>
                                </div>
                                <h5 className='text-lg font-semibold text-white mb-1'>Books Borrowed</h5>
                                <div className='text-3xl font-bold text-white'>{stats.borrowed_books_count}</div>
                                <p className='text-blue-100 text-sm mt-2'>+{stats.borrowed_this_week} this week</p>
                            </div>
                        </Card>

                        {/* Today's Visitors Card */}
                        <Card className='bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                            <div className='text-center p-6'>
                                <div className='bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
                                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' />
                                    </svg>
                                </div>
                                <h5 className='text-lg font-semibold text-white mb-1'>Today's Visitors</h5>
                                <div className='text-3xl font-bold text-white'>{stats.todays_visitors}</div>
                                <p className='text-green-100 text-sm mt-2'>+{stats.visitors_this_month} this month</p>
                            </div>
                        </Card>

                        {/* Total Books Card */}
                        <Card className='bg-gradient-to-r from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                            <div className='text-center p-6'>
                                <div className='bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
                                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' />
                                    </svg>
                                </div>
                                <h5 className='text-lg font-semibold text-white mb-1'>Total Books</h5>
                                <div className='text-3xl font-bold text-white'>{stats.total_books}</div>
                                <p className='text-purple-100 text-sm mt-2'>+{stats.new_additions} new additions</p>
                            </div>
                        </Card>

                        {/* Available Books Card */}
                        <Card className='bg-gradient-to-r from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                            <div className='text-center p-6'>
                                <div className='bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
                                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                </div>
                                <h5 className='text-lg font-semibold text-white mb-1'>Available Now</h5>
                                <div className='text-3xl font-bold text-white'>{stats.available_books}</div>
                                <p className='text-orange-100 text-sm mt-2'>{stats.availability_percentage}% of collection</p>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Table Section */}
                <div className='bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
                        <div>
                            <h2 className='text-2xl font-bold text-white mb-2'>Recent Books</h2>
                            <p className='text-gray-300'>Showing {sortedBooks.length} of {totalBooks} total books</p>
                        </div>
                        <div className='flex gap-3 mt-4 sm:mt-0'>
                            <button
                                onClick={() => window.location.href = '/bookmanagement'}
                                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2'
                            >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
                                </svg>
                                View All Books
                            </button>
                        </div>
                    </div>

                    <TableComponent
                        data={sortedBooks.map(book => ({
                            id: book.id,
                            title: book.title,
                            author: book.author,
                            status: (
                                <span className={`font-medium ${getStatusColor(book.status)}`}>
                                    {book.status}
                                </span>
                            ),
                            isbn: book.isbn || 'N/A',
                        }))}
                        columns={['Book ID', 'Book Title', 'Book Author', 'Status', 'ISBN']}
                        variant='dashboard'
                        emptyMessage='No books available in the library yet.'
                    />
                </div>
            </div>
        </AppLayout>
    );
}