import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center">
        <p className="text-7xl font-black gradient-text mb-4">404</p>
        <h1 className="text-2xl font-semibold text-[#f9fafb] mb-2">Page Not Found</h1>
        <p className="text-[#9ca3af] mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-sm font-medium transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
