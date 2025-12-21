// UserForm.tsx - Complete working version
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { User } from '@/types';

// IMPORTANT: Correct Wayfinder import based on your file structure
import usersRoutes from '@/routes/users'; // Default import

interface Position {
    id: number;
    title: string;
}

interface Status {
    id: number;
    title: string;
}

interface UserFormProps {
    positions: Position[];
    statuses: Status[];
    onOpenChange: (open: boolean) => void;
    open: boolean;
    user?: User;
}

export function UserForm({ positions, statuses, onOpenChange, open, user }: UserFormProps) {
    const isEditMode = !!user;
    const isCreateMode = !isEditMode;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        position_id: '',
        status_id: '',
    });

    useEffect(() => {
        if (open) {
            clearErrors();
            if (user) {
                setData({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    password: '',
                    password_confirmation: '',
                    position_id: user.position_id.toString(),
                    status_id: user.status_id.toString(),
                });
            } else {
                reset();
            }
        }
    }, [open, user]);

    const passwordsMismatch =
        data.password !== data.password_confirmation &&
        (data.password !== '' || data.password_confirmation !== '');

    // Password validation - FIXED
    const isPasswordValid = isEditMode
        ? // Edit mode: password optional
        (data.password === '' && data.password_confirmation === '') ||
        (data.password.length >= 8 &&
            data.password_confirmation.length >= 8 &&
            data.password === data.password_confirmation)
        : // Create mode: password required
        data.password.length >= 8 &&
        data.password_confirmation.length >= 8 &&
        data.password === data.password_confirmation;

    // Form validation - ADD EMAIL VALIDATION
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isFormValid =
        data.first_name.trim() !== '' &&
        data.last_name.trim() !== '' &&
        data.email.trim() !== '' &&
        data.position_id !== '' &&
        data.status_id !== '' &&
        isPasswordValid;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submit function called!');

        if (!isFormValid) {
            console.log('Form is not valid, cannot submit');
            return;
        }

        // Use Wayfinder routes
        if (isEditMode && user) {
            if (usersRoutes?.update?.url) {
                const updateUrl = usersRoutes.update.url({ user: user.id });
                console.log('Using Wayfinder update URL:', updateUrl);

                put(updateUrl, {
                    onSuccess: () => {
                        console.log('Update successful');
                        router.reload({ only: ['users', 'stats'] });
                        reset();
                        onOpenChange(false);
                    },
                    onError: (errors) => {
                        console.log('Update errors:', errors);
                    }
                });
            } else {
                // Fallback
                console.error('Wayfinder update route not available');
                put(`/usermanagement/${user.id}`, {
                    onSuccess: () => {
                        router.reload({ only: ['users', 'stats'] });
                        reset();
                        onOpenChange(false);
                    },
                });
            }
        } else {
            if (usersRoutes?.store?.url) {
                const storeUrl = usersRoutes.store.url();
                console.log('Using Wayfinder store URL:', storeUrl);

                post(storeUrl, {
                    onSuccess: () => {
                        console.log('Create successful');
                        router.reload({ only: ['users', 'stats'] });
                        reset();
                        onOpenChange(false);
                    },
                    onError: (errors) => {
                        console.log('Create errors:', errors);
                    }
                });
            } else {
                // Fallback
                console.error('Wayfinder store route not available');
                post('/usermanagement', {
                    onSuccess: () => {
                        router.reload({ only: ['users', 'stats'] });
                        reset();
                        onOpenChange(false);
                    },
                });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {!isEditMode && (
                <DialogTrigger asChild>
                    <Button className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30'>
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
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? 'Update user details below.' : 'Fill in the details below to add a new user.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="first_name" className="text-right">
                                First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="first_name"
                                value={data.first_name}
                                onChange={e => setData('first_name', e.target.value)}
                                className="col-span-3"
                            />
                            <InputError message={errors.first_name} className="col-span-4 col-start-2" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="last_name" className="text-right">
                                Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="last_name"
                                value={data.last_name}
                                onChange={e => setData('last_name', e.target.value)}
                                className="col-span-3"
                            />
                            <InputError message={errors.last_name} className="col-span-4 col-start-2" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="col-span-3"
                            />
                            <InputError message={errors.email} className="col-span-4 col-start-2" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password <span className="text-red-500">{isCreateMode && '*'}</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="col-span-3"
                                placeholder={isEditMode ? 'Leave blank to keep current' : ''}
                            />
                            <InputError message={errors.password} className="col-span-4 col-start-2" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password_confirmation" className="text-right">
                                Confirm Password <span className="text-red-500">{isCreateMode && '*'}</span>
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                className="col-span-3"
                                placeholder={isEditMode ? 'Leave blank to keep current' : ''}
                            />
                            <InputError message={errors.password_confirmation} className="col-span-4 col-start-2" />
                            {/* FIXED: Only show when there's a mismatch AND no server error */}
                            {!errors.password_confirmation && passwordsMismatch && (
                                <p className="col-span-4 col-start-2 text-xs text-red-500">
                                    Password and confirmation do not match.
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="position" className="text-right">
                                Position <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                onValueChange={value => setData('position_id', value)}
                                value={data.position_id}
                            >
                                <SelectTrigger className="col-span-3" id="position">
                                    <SelectValue placeholder="Select a Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions
                                        .filter(position => position.title.toLowerCase() !== "administrator")
                                        .map(position => (
                                            <SelectItem key={position.id} value={position.id.toString()}>
                                                {position.title}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <InputError message={errors.position_id} className="col-span-4 col-start-2" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                onValueChange={value => setData('status_id', value)}
                                value={data.status_id}
                            >
                                <SelectTrigger className="col-span-3" id="status">
                                    <SelectValue placeholder="Select a Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map(status => (
                                        <SelectItem key={status.id} value={status.id.toString()}>
                                            {status.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status_id} className="col-span-4 col-start-2" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={processing || !isFormValid}
                            className={!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            {processing
                                ? isEditMode
                                    ? 'Updating...'
                                    : 'Creating...'
                                : isEditMode
                                    ? 'Update User'
                                    : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}