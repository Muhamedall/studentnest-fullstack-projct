import { Link } from 'react-router';
import { FaTimesCircle, FaHome, FaRedo } from 'react-icons/fa';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 text-center">
        <span className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-amber-100 text-amber-600">
          <FaTimesCircle className="h-10 w-10" />
        </span>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Payment not completed</h1>
        <p className="mt-3 text-gray-500 leading-relaxed">
          Your payment was canceled and you were not charged. You can try paying again or explore other listings.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            <FaRedo /> Try again
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-all"
          >
            <FaHome /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;