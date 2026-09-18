import { Link } from 'react-router';

const Nopage = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
            <p className="text-[120px] leading-none font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                404
            </p>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
            <p className="mt-2 text-gray-500">The page you are looking for doesn&apos;t exist or has been moved.</p>
            <Link
                to="/"
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg"
            >
                Back to home
            </Link>
        </div>
    );
};

export default Nopage;