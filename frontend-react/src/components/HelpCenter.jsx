import { useState } from 'react';
import axios from '../api/api';
import { FaChevronDown, FaCheckCircle, FaLock, FaCreditCard, FaHome, FaQuestionCircle } from 'react-icons/fa';

const FAQ = [
  {
    icon: FaHome,
    q: 'How do I book a student room?',
    a: 'Browse listings on the home page, open a room you like, choose your check-in and check-out dates, then click "Reserve & Pay". You will be redirected to Stripe to pay securely with your card. Once the payment succeeds, your reservation is confirmed.',
  },
  {
    icon: FaCreditCard,
    q: 'Which payment methods are accepted?',
    a: 'We use Stripe, which accepts all major credit and debit cards (Visa, Mastercard, Amex, and more). Payments are processed securely and are protected by Stripe.',
  },
  {
    icon: FaLock,
    q: 'Is my payment information safe?',
    a: 'Yes. Card details never touch our servers. They are entered directly on Stripe\u2019s secure payment page. We only receive the payment result.',
  },
  {
    icon: FaQuestionCircle,
    q: 'How do I become a host?',
    a: 'Create an account, then open the Dashboard and click "Add Listing". Fill in the details of your student room, upload photos, and publish. Students will be able to book and pay for it.',
  },
  {
    icon: FaCheckCircle,
    q: 'How do I see my reservations and payments?',
    a: 'Go to the Account page and open the "Payments & reservations" tab. There you can see every payment and every reservation you made, along with its status.',
  },
  {
    icon: FaQuestionCircle,
    q: 'How can I contact a host before booking?',
    a: 'Open a listing and click the "Message" button next to the host. A conversation will start in the Messages page where you can ask any question.',
  },
];

const HelpCenter = () => {
  const [open, setOpen] = useState(0);
  const [form, setForm] = useState({ topic: 'General question', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!isLoggedIn) {
      setError('Please log in before sending a message to support.');
      return;
    }
    if (!form.message.trim()) {
      setError('Please write a message.');
      return;
    }
    axios.post('/api/messages', {
      receiver_id: 1,
      body: `[${form.topic}] ${form.message}`,
    })
      .then(() => setSent(true))
      .catch(() => setError('Could not send your message. Please try again.'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-full">
            <FaQuestionCircle /> Help Center
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900">How can we help you?</h1>
          <p className="mt-2 text-gray-500">Find answers about booking, payments, hosting and more.</p>
        </div>

        {/* FAQ */}
        <div className="mt-8 space-y-3">
          {FAQ.map((item, index) => {
            const Icon = item.icon;
            const isOpen = open === index;
            return (
              <div key={index} className={`bg-white rounded-2xl border ${isOpen ? 'border-indigo-300 shadow-lg' : 'border-gray-200 shadow-sm'} transition-all`}>
                <button
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <span className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl ${isOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Icon />
                  </span>
                  <span className="flex-1 font-semibold text-gray-900">{item.q}</span>
                  <FaChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{item.a}</p>}
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900">Contact support</h2>
          <p className="mt-1 text-sm text-gray-500">Can&apos;t find your answer? Send us a message and we will reply in your Messages page.</p>

          {sent ? (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
              Your message was sent. The support team will reply to you in Messages.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && <p className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</p>}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Topic</label>
                <select
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                >
                  <option>General question</option>
                  <option>Booking problem</option>
                  <option>Payment problem</option>
                  <option>Hosting / listing</option>
                  <option>Account issue</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="4"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your issue..."
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;