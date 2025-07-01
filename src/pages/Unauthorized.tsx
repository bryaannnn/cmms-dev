import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-6xl font-bold text-red-500 mb-4">403</div>
      <h1 className="text-2xl font-semibold mb-2">Unauthorized Access</h1>
      <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;