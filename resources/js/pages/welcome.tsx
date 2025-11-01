import { Card } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Button, Input } from '@headlessui/react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Label } from '@radix-ui/react-label';
import { useState } from 'react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const [idNumber, setIdNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [recentIdNumber, setRecentIdNumber] = useState(null);
    const [error, setError] = useState(null);
    // const navigate = useNavigate();

    // const handleLogin = () => {
    //     navigate('/login');
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedId = idNumber.trim();
        if (!trimmedId) return;

        setIsLoading(true);

        try {
            // First, find the user by their identifier (ID number, email, etc.)
            // Adjust the column name based on your users table structure
            // const { data: userData, error: userError } = await supabase
            // 	.from('users') // or whatever your user table is called
            // 	.select('id')
            // 	.or(
            // 		`id_number.eq.${trimmedId},email.eq.${trimmedId},username.eq.${trimmedId}`
            // 	)
            // 	.single();

            // if (userError || !userData) {
            //     throw new Error('User not found');
            // }

            // // Then insert the log with the actual user UUID
            // const { data, error } = await supabase
            //     .from('log')
            //     .insert([{ user_id: userData.id }])
            //     .select();

            setIsLoading(false);
            setShowSuccess(true);
            setIdNumber('');
            // setRecentIdNumber(trimmedId);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            setIsLoading(false);
            // setError(
            //     error.message === 'User not found'
            //         ? 'User not found. Please check the ID.'
            //         : 'Failed to log attendance. Please try again.'
            // );
            setTimeout(() => setError(null), 5000);
            setIdNumber('');
        }
    };
    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium px-6 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm hover:shadow-md"                               >Login
                                </Link>
                                {/* {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                )} */}
                            </>
                        )}
                    </nav>
                </header>
                <div className='flex flex-col md:flex-row flex-1 justify-center items-center gap-6 p-4 text-white'>
                    {/* Success Alert */}
                    {/* {showSuccess && (
                        <Alert color='success' className='absolute top-20 z-10'>
                            Attendance logged successfully for ID: {recentIdNumber}
                        </Alert>
                    )} */}

                    {/* Attendance Log Card */}
                    <Card className='p-8 bg-gray-800 rounded-xl shadow-xl w-full max-w-md'>
                        <div className='text-center mb-2'>
                            <div className='w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg
                                    className='w-8 h-8 text-white'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                                    />
                                </svg>
                            </div>
                            <h1 className='text-3xl font-bold'>Athenaeum</h1>
                            <h2 className='text-2xl text-gray-200 italic mb-2'>
                                Attendance Log
                            </h2>
                            <p className='text-gray-400'>
                                Track and manage your library visits{' '}
                            </p>
                        </div>
                        <div className='mt-4 p-4 bg-gray-700 rounded-lg'>
                            <p className='text-gray-300 text-sm'>
                                {/* {recentIdNumber
                                    ? `Last logged ID: ${recentIdNumber}`
                                    : 'No attendance logged yet.'} */}
                            </p>
                        </div>
                    </Card>

                    {/* Input Card */}
                    <Card className='p-8 bg-gray-800 rounded-xl shadow-xl w-full max-w-md'>
                        <h3 className='text-xl font-semibold mb-6 text-center text-white'>
                            Clock In/Out
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className='mb-4'>
                                <Label
                                    htmlFor='idnum'
                                    // value='ID Number'
                                    className='text-gray-300 mb-2 block'
                                />
                                <Input
                                    id='idnum'
                                    type='text'
                                    // sizing='md'
                                    value={idNumber}
                                    onChange={(e) => setIdNumber(e.target.value)}
                                    placeholder='Enter your ID number'
                                    className='bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type='submit'
                                className='w-full transition-all duration-200 bg-blue-600 hover:bg-blue-700'
                                // size='lg'
                                disabled={!idNumber.trim() || isLoading}
                            // isProcessing={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Submit Attendance'}
                            </Button>
                        </form>

                        {/* Help Text */}
                        {/* {error ? (
                            <div className='mt-4 text-center'>
                                <p className='text-sm text-gray-400'>{error}</p>
                            </div>
                        ) : (
                            <div className='mt-4 text-center'>
                                <p className='text-sm text-gray-400'>
                                    Enter your ID number to log your attendance
                                </p>
                            </div>
                        )} */}
                    </Card>
                </div>                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
