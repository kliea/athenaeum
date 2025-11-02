import React, { useState, ChangeEvent } from 'react';
import TableComponent from '../components/TableComponent';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { usermanagement } from '@/routes';
import { Head, usePage } from '@inertiajs/react';

interface Position {
    id: number;
    title: string;
}

interface Status {
    id: number;
    title: string;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    position_id: number;
    status_id: number;
    created_at: string;
    position?: Position;
    status?: Status;
}

interface PageProps {
    users: User[];
}

function UserManagementPage() {
    const { users } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = (): void => {
        setSearchTerm('');
    };

    // Format user data for the table
    const formatUserData = (user: User) => ({
        id: user.id.toString(), // Ensure it's a string
        name: `${user.first_name} ${user.last_name}`,
        position: user.position?.title || 'No Position',
        email: user.email,
        status: user.status?.title || 'Unknown',
        rawData: user // Keep original data for actions
    });

    // Safe filter function with error handling
    const filteredUsers = users
        .map(formatUserData)
        .filter((user) => {
            if (!user) return false;

            const searchLower = searchTerm.toLowerCase();
            return (
                (user.name?.toLowerCase() || '').includes(searchLower) ||
                (user.position?.toLowerCase() || '').includes(searchLower) ||
                (user.email?.toLowerCase() || '').includes(searchLower) ||
                (user.status?.toLowerCase() || '').includes(searchLower)
            );
        });


    const handleEdit = (user: User): void => {
        console.log('Edit:', user);
    };

    const handleDelete = (user: User): void => {
        console.log('Delete:', user);
    };

    const totalUsers = users.length;
    const activeUsersCount = users.filter((u: User) => u.status?.title === 'Active').length;
    const studentMembersCount = users.filter((u: User) =>
        u.position?.title === 'Librarian' || u.position?.title === 'Administrator'
    ).length;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'User Management',
            href: usermanagement().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className='p-4'>
                <div className='bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl'>
                    {/* Header Section */}
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
                        <div>
                            <h2 className='text-2xl font-bold text-white mb-2'>
                                User Management
                            </h2>
                            <p className='text-gray-300'>
                                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}{' '}
                                found
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto'>
                            {/* Search Bar */}
                            <div className='relative min-w-[250px]'>
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
                                    placeholder='Search by name, position, or email...'
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className='pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full'
                                />
                                {/* Clear search button */}
                                {searchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
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
                                                d='M6 18L18 6M6 6l12 12'
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className='flex gap-3'>
                                <button className='px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 border border-gray-600'>
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
                                <button className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30'>
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
                                    Add New User
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                        <div className='bg-gray-800/50 rounded-lg p-4 border border-gray-700'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-gray-400 text-sm'>Total Users</p>
                                    <p className='text-2xl font-bold text-white'>
                                        {totalUsers}
                                    </p>
                                </div>
                                <div className='p-2 bg-blue-600/20 rounded-lg'>
                                    <svg
                                        className='w-6 h-6 text-blue-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className='bg-gray-800/50 rounded-lg p-4 border border-gray-700'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-gray-400 text-sm'>Active Users</p>
                                    <p className='text-2xl font-bold text-green-400'>
                                        {activeUsersCount}
                                    </p>
                                </div>
                                <div className='p-2 bg-green-600/20 rounded-lg'>
                                    <svg
                                        className='w-6 h-6 text-green-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className='bg-gray-800/50 rounded-lg p-4 border border-gray-700'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-gray-400 text-sm'>Staff Members</p>
                                    <p className='text-2xl font-bold text-purple-400'>
                                        {studentMembersCount}
                                    </p>
                                </div>
                                <div className='p-2 bg-purple-600/20 rounded-lg'>
                                    <svg
                                        className='w-6 h-6 text-purple-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className='overflow-hidden rounded-lg border border-gray-700 bg-gray-800/20'>
                        <TableComponent
                            data={filteredUsers}
                            columns={[
                                'User ID',
                                'Name',
                                'Position',
                                'Email',
                                'Status',
                                'Actions',
                            ]}
                            variant='management'
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            emptyMessage='No users found matching your search'
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default UserManagementPage;