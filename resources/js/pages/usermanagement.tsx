import React, { useState, ChangeEvent, useCallback } from 'react';
import TableComponent from '../components/TableComponent';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Paginated, User } from '@/types';
import { usermanagement } from '@/routes';
import { Head, usePage, router } from '@inertiajs/react';
import { UserForm } from '@/components/UserForm';
import Pagination from '@/components/pagination';
import { debounce } from 'lodash';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import usersRoutes from '@/routes/users';


interface PageProps {
    users: Paginated<User>;
    positions: { id: number; title: string }[];
    statuses: { id: number; title: string }[];
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
    filters: {
        search: string;
    };
    [key: string]: unknown;
}

function UserManagementPage() {
    const { users, positions, statuses, stats, filters } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState<string>(filters.search || '');
    const [isUserFormOpen, setIsUserFormOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    // Add these states for delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const debouncedSearch = debounce((term: string) => {
        router.get(usermanagement().url, { search: term }, { preserveState: true, replace: true });
    }, 300);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const term = e.target.value;
        setSearchTerm(term);
        debouncedSearch(term);
    };

    const clearSearch = (): void => {
        setSearchTerm('');
        router.get(usermanagement().url, {}, { preserveState: true, replace: true });
    };

    const formatUserData = (user: User) => ({
        id: user.id.toString(),
        name: `${user.first_name} ${user.last_name}`,
        position: user.position?.title || 'No Position',
        email: user.email,
        status: user.status?.title || 'Unknown',
        rawData: user
    });

    const formattedUsers = users.data.map(formatUserData);

    const handleEdit = (item: ReturnType<typeof formatUserData>): void => {
        setEditingUser(item.rawData);
        setIsUserFormOpen(true);
    };

    // Updated handleDelete to show modal
    const handleDelete = (item: ReturnType<typeof formatUserData>): void => {
        setUserToDelete({
            id: item.rawData.id,
            name: item.name
        });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = useCallback(async (): Promise<void> => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            // Check if destroy route exists in usersRoutes

            const destroyUrl = usersRoutes.delete.url({ user: userToDelete.id });
            console.log('Using Wayfinder destroy URL:', destroyUrl);

            await router.delete(destroyUrl, {
                preserveScroll: true,
                onSuccess: () => {
                    // Use reload with specific keys instead of full page reload
                    router.reload({ only: ['users', 'stats'] });
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    alert('Failed to delete user. Please try again.');
                },
                onFinish: () => {
                    setIsDeleting(false);
                }
            });

        } catch (error) {
            console.error('Delete error:', error);
            setIsDeleting(false);
            alert('An error occurred while deleting the user.');
        }
    }, [userToDelete]);

    // Add close modal function
    const closeDeleteModal = (): void => {
        if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(undefined);
        setIsUserFormOpen(true);
    };

    const handleUserFormOpenChange = (open: boolean) => {
        setIsUserFormOpen(open);
        if (!open) {
            setEditingUser(undefined);
        }
    };

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
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
                        <div>
                            <h2 className='text-2xl font-bold text-white mb-2'>
                                User Management
                            </h2>
                            <p className='text-gray-300'>
                                {users.total} user{users.total !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto'>
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
                                <UserForm
                                    positions={positions}
                                    statuses={statuses}
                                    onOpenChange={handleUserFormOpenChange}
                                    open={isUserFormOpen}
                                    user={editingUser}
                                />
                                <button
                                    onClick={handleCreateUser}
                                    className='hidden' // Hidden because the UserForm trigger button handles opening, but we need to reset state. Wait, the trigger is inside UserForm.
                                // Actually, we need to lift the trigger out or control the state from here.
                                // The UserForm has a trigger inside it which renders the "Add New User" button if !isEditMode.
                                // But when we click Edit in the table, we simply setOpen(true) and pass the user.
                                // So we don't strictly need a separate button here if UserForm provides the "Add" button.
                                // HOWEVER, TableComponent calls handleEdit.
                                >
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                        {/* Stats Cards ... kept same ... */}
                        <div className='bg-gray-800/50 rounded-lg p-4 border border-gray-700'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-gray-400 text-sm'>Total Users</p>
                                    <p className='text-2xl font-bold text-white'>
                                        {stats.total}
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
                                        {stats.active}
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
                                    <p className='text-gray-400 text-sm'>Inactive Users</p>
                                    <p className='text-2xl font-bold text-red-400'>
                                        {stats.inactive}
                                    </p>
                                </div>
                                <div className='p-2 bg-red-600/20 rounded-lg'>
                                    <svg
                                        className='w-6 h-6 text-red-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth='2'
                                            d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                                        ></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='overflow-hidden rounded-lg border border-gray-700 bg-gray-800/20'>
                        <TableComponent
                            data={formattedUsers}
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
                    <Pagination links={users.links} meta={users} />

                    <DeleteConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={closeDeleteModal}
                        onConfirm={confirmDelete}
                        title="Delete User"
                        description="This action cannot be undone. This will permanently delete the user account and remove all associated data from our servers."
                        itemName={userToDelete?.name}
                        itemType="User"
                        confirmButtonText="Delete User"
                        isLoading={isDeleting}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

export default UserManagementPage;