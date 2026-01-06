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

    const handleSubmit = async (e: React.FormEvent) => {
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
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|outfit:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black font-sans text-white">

                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-900/40 blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/30 blur-[120px]" />
                </div>

                <header className="absolute top-0 left-0 w-full z-20 p-6 lg:p-8">
                    <nav className="flex items-center justify-between w-full max-w-7xl mx-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight">Athenaeum</span>
                        </div>

                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="px-5 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all backdrop-blur-sm"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30"
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                </header>

                <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">

                    {/* Left Column: Hero Text */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wider uppercase mb-2">
                            Library Management System
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                            Manage your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                                knowledge base
                            </span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto md:mx-0 leading-relaxed">
                            Welcome to Athenaeum. Track attendance, borrow books, and manage your library resources with a seamless, modern experience.
                        </p>
                    </div>

                    {/* Right Column: Interactive Card */}
                    <div className="w-full max-w-md">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <Card className="relative p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                                <div className="mb-8 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Attendance Log
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        Scan your ID to clock in or out
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <Label htmlFor="idnum" className="sr-only">ID Number</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                </svg>
                                            </div>
                                            <Input
                                                id="idnum"
                                                type="text"
                                                value={idNumber}
                                                onChange={(e) => setIdNumber(e.target.value)}
                                                placeholder="Enter ID Number"
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg leading-5 bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                                        disabled={!idNumber.trim() || isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Logging...
                                            </>
                                        ) : 'Submit Attendance'}
                                    </Button>

                                    {/* Status Message Area */}
                                    {showSuccess && (
                                        <div className="mt-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm text-center animate-fade-in-up">
                                            Attendance logged successfully!
                                        </div>
                                    )}
                                    {error && (
                                        <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center animate-fade-in-up">
                                            {error}
                                        </div>
                                    )}
                                </form>
                                <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                                    <p className="text-xs text-gray-500">
                                        Protected by Athenaeum Security
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>

                </main>
            </div>
        </>
    );
}
