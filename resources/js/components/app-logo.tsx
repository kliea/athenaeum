import AppLogoIcon from './app-logo-icon';
import logo from '../../../public/logo.png';

type AppLogoProps = {
    type: 'login' | 'sidebar';
};

export default function AppLogo({ type }: AppLogoProps) {
    const sizeClass = type === 'login' ? 'size-20' : 'size-8';
    const textSizeClass = type === 'login' ? 'text-2xl' : 'text-lg';

    return (
        <>
            <div className={`flex aspect-square ${sizeClass} items-center justify-center rounded-md`}>
                {/* <AppLogoIcon className="size-5 fill-current text-white dark:text-black" /> */}
                <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    style={{
                        transformOrigin: 'center center',
                    }}
                />
            </div>

            <div className={`mt-1 grid flex-1 text-left ${textSizeClass}`}>
                <span className="leading-tight font-semibold">
                    Athenaeum
                </span>
            </div>
        </>
    );
}