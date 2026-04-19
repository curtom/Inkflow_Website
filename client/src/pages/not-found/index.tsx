import { Link } from 'react-router'

export default function NotFoundPage() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
            <h1 className="text-5xl font-bold text-gray-900">404</h1>
            <p className="mt-4 text-gray-600">Page no found.</p>
            <Link
                to="/"
                className="mt-6 rounded-lg bg-gray-400 px-4 py-2 text-white transition hover:bg-gray-500"
            >
                Back Home
            </Link>
        </div>
    )
}