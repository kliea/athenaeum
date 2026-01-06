import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const bookInfo = [
    {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        status: 'Available',
        date_borrowed: '2023-10-01',
    },
    {
        id: 2,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        status: 'Borrowed',
        date_borrowed: '2023-10-02',
    },
];

import TableComponent from '@/components/TableComponent';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className='p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen'>
                {/* Header Section */}
                <div className='mb-8'>
                    <h1 className='text-4xl font-bold text-white mb-2'>
                        Library Dashboard
                    </h1>
                    <p className='text-gray-300'>
                        Manage your library collection and track book status
                    </p>
                </div>
                {/* Stats Cards Section */}
                <div className='mb-8'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        <Card className='bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                            <div className='text-center'>
                                <div className='bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
                                    <svg
                                        className='w-6 h-6 text-white'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                                        />
                                    </svg>
                                </div>
                                <h5 className='text-lg font-semibold text-white mb-1'>
                                    Books Borrowed
                                </h5>
                                <div className='text-3xl font-bold text-white'>24</div>
                                <p className='text-blue-100 text-sm mt-2'>+2 this week</p>
                            </div>
                        </Card>

                        <Card className='bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                            <div className='text-center p-4'>
                                <div className='bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
                                    <svg
                                        className='w-6 h-6 text-white'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                                        />
                                    </svg>
                                </div>
                                <h5 className='text-lg font-semibold text-white mb-1'>
                                    Today's Visitors
                                </h5>
                                <div className='text-3xl font-bold text-white'>156</div>
                                <p className='text-green-100 text-sm mt-2'>+12 this month</p>
                            </div>
                        </Card>

                        <Card className='bg-gradient-to-r from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                            <div className='text-center p-4'>
                                <div className='bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
                                    <svg
                                        className='w-6 h-6 text-white'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z'
                                        />
                                    </svg>
                                </div>
                                <h5 className='text-lg font-semibold text-white mb-1'>
                                    Total Books
                                </h5>
                                <div className='text-3xl font-bold text-white'>2,847</div>
                                <p className='text-purple-100 text-sm mt-2'>+45 new additions</p>
                            </div>
                        </Card>

                        <Card className='bg-gradient-to-r from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                            <div className='text-center p-4'>
                                <div className='bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3'>
                                    <svg
                                        className='w-6 h-6 text-white'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                        />
                                    </svg>
                                </div>
                                <h5 className='text-lg font-semibold text-white mb-1'>
                                    Available Now
                                </h5>
                                <div className='text-3xl font-bold text-white'>1,923</div>
                                <p className='text-orange-100 text-sm mt-2'>67% of collection</p>
                            </div>
                        </Card>
                    </div>
                </div>
                {/* Table Section */}
                <div className='bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
                        <div>
                            <h2 className='text-2xl font-bold text-white mb-2'>
                                Book Collection
                            </h2>
                            <p className='text-gray-300'>Recent additions to the library</p>
                        </div>
                        <div className='flex gap-3 mt-4 sm:mt-0'>
                            <button className='px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2'>
                                <svg
                                    className='w-4 h-4'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                                    />
                                </svg>
                                Filter
                            </button>
                        </div>
                    </div>

                    <TableComponent
                        data={bookInfo}
                        columns={[
                            'Book ID',
                            'Book Title',
                            'Book Author',
                            'Status',
                            'Date Borrowed',
                        ]}
                        variant='dashboard'
                        emptyMessage='No books available'
                    />
                </div>
            </div>
        </AppLayout>
    );
}
