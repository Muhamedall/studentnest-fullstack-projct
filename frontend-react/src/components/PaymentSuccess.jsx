import { Link } from 'react-router';
import { FaCheckCircle, FaHome, FaWallet } from 'react-icons/fa';

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 text-center">
        <span className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 text-emerald-600">
          <FaCheckCircle className="h-10 w-10" />
        </span>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Payment successful!</h1>
        <p className="mt-3 text-gray-500 leading-relaxed">
          Thank you! Your reservation has been confirmed and your payment was processed securely with Stripe.
          You can review your payments and reservations at any time.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/Account"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            <FaWallet /> View my reservations
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

export default PaymentSuccess;