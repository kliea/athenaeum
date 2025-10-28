import AppLogoIcon from './app-logo-icon';
import logo from '../../../public/logo.png'; // Basic import

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md ">
                {/* <AppLogoIcon className="size-5 fill-current text-white dark:text-black" /> */}
                <img src={logo} alt="Logo" style={{
                    transformOrigin: 'center center',
                }} />

            </div>

            <div className="mt-1 grid flex-1 text-left text-sm">
                <span className="leading-tight font-semibold">
                    Athenaeum
                </span>
            </div>
        </>
    );
}
