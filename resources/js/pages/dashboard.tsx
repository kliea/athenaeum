import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Card } from "@/components/ui/card";
import TableComponent from '@/components/TableComponent';
import { Badge } from '@/components/ui/badge';

// --- TYPE DEFINITIONS ---
interface Stat {
    borrowed_books_count: number;
    total_books: number;
    available_books: number;
    borrowed_this_week: number;
    pending_returns: number;
    todays_loans: number;
    success: boolean;
    message?: string;
}

interface Book {
    id: number;
    title: string;
    author: string;
    date_added: string;
}

interface AttendanceLog {
    id: number;
    user_name: string;
    role_name: string;
    time_in: string | null;
    time_out: string | null;
    date: string;
}

interface PageProps extends SharedData {
    stats: Stat;
    recentBooks: { data: Book[], total: number };
    recentAttendance: AttendanceLog[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

// --- SUB-COMPONENTS ---

// Books Table Component
const RecentBooksTable = ({ books, total }: { books: Book[], total: number }) => (
    <>
        <p className='text-gray-300 mb-6'>Showing {books.length} of {total} total books</p>
        <TableComponent
            data={books.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                date_added: book.date_added,
            }))}
            columns={['Book ID', 'Book Title', 'Author', 'Date Added']}
            variant='dashboard'
            emptyMessage='No recent books found.'
        />
    </>
);

// Attendance Table Component
const RecentAttendanceTable = ({ logs }: { logs: AttendanceLog[] }) => (
    <>
        <p className='text-gray-300 mb-6'>Showing the {logs.length} most recent attendance records.</p>
        <TableComponent
            data={logs.map(log => ({
                user_name: log.user_name,
                role: <Badge variant="outline">{log.role_name}</Badge>,
                time_in: log.time_in,
                time_out: log.time_out === 'Active'
                    ? <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>Active</span>
                    : log.time_out,
                date: log.date,
            }))}
            columns={['User Name', 'Role', 'Time In', 'Time Out', 'Date']}
            variant='dashboard'
            emptyMessage='No attendance logs found for today.'
        />
    </>
);

// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const { stats, recentBooks, recentAttendance } = props;

    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'books' | 'attendance'>('books');

    // Admins/Librarians will receive the recentAttendance prop.
    const canViewAttendance = recentAttendance && recentAttendance.length >= 0;

    const refreshData = () => {
        setLoading(true);
        router.reload({
            only: ['stats', 'recentBooks', 'recentAttendance'],
            onFinish: () => setLoading(false),
        });
    };

    const tableTitle = viewMode === 'books' ? 'Recent Books' : 'Recent Attendance';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className='p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen text-white'>
                {/* Header */}
                <div className='mb-8'>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h1 className='text-4xl font-bold mb-2'>Library Dashboard</h1>
                            <p className='text-gray-300'>A quick overview of your library's status.</p>
                        </div>
                        <button
                            onClick={refreshData}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
                            disabled={loading}
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <StatCard title="Books Borrowed" value={stats.borrowed_books_count} change={`+${stats.borrowed_this_week} this week`} color="blue" />
                    <StatCard title="Pending Returns" value={stats.pending_returns} change="Overdue" color="orange" />
                    <StatCard title="Total Books" value={stats.total_books} change={`${stats.available_books} available`} color="purple" />
                    <StatCard title="Today's Loans" value={stats.todays_loans} change="Active loans" color="green" />
                </div>

                {/* Table Section */}
                <div className='bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
                        <h2 className='text-2xl font-bold text-white'>{tableTitle}</h2>
                        {canViewAttendance && (
                            <div className='flex items-center gap-2 mt-4 sm:mt-0 p-1 bg-gray-800/50 rounded-lg'>
                                <button
                                    onClick={() => setViewMode('books')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'books' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700'}`}
                                >
                                    Recent Books
                                </button>
                                <button
                                    onClick={() => setViewMode('attendance')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'attendance' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700'}`}
                                >
                                    Attendance
                                </button>
                            </div>
                        )}
                    </div>

                    {viewMode === 'books' ?
                        <RecentBooksTable books={recentBooks.data} total={recentBooks.total} /> :
                        <RecentAttendanceTable logs={recentAttendance} />
                    }
                </div>
            </div>
        </AppLayout>
    );
}

// Stat Card Helper Component
const StatCard = ({ title, value, change, color }: { title: string, value: number, change: string, color: 'blue' | 'green' | 'purple' | 'orange' }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
    };
    return (
        <Card className={`bg-gradient-to-r ${colors[color]} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6`}>
            <h5 className='text-lg font-semibold text-white/90 mb-1'>{title}</h5>
            <div className='text-4xl font-bold text-white'>{value}</div>
            <p className='text-white/70 text-sm mt-2'>{change}</p>
        </Card>
    );
};