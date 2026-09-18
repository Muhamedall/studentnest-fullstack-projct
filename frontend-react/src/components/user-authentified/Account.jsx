import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaLock, FaCreditCard, FaCar, FaCheckCircle, FaClock, FaWallet } from 'react-icons/fa';
import axios from '../../api/api';
import { STORAGE_URL } from '../../api/api';
import { setUser } from '../Redux/usersSlice';
import { formatPrice } from '../../utils/formatPrice';

const Account = () => {
  const reduxUser = useSelector((state) => state.users.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('info');

  const [profile, setProfile] = useState({ name: '', email: '', city: '', dateOfBirth: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');

  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [moneyLoading, setMoneyLoading] = useState(false);

  useEffect(() => {
    if (reduxUser) {
      setProfile({
        name: reduxUser.name || '',
        email: reduxUser.email || '',
        city: reduxUser.city || '',
        dateOfBirth: reduxUser.dateOfBirth || '',
      });
    }
  }, [reduxUser]);

  useEffect(() => {
    if (activeTab === 'money') {
      setMoneyLoading(true);
      Promise.all([
        axios.get('/api/payments'),
        axios.get('/api/my-reservations'),
      ])
        .then(([paymentsRes, reservationsRes]) => {
          setPayments(paymentsRes.data || []);
          setReservations(reservationsRes.data || []);
        })
        .catch(() => {})
        .finally(() => setMoneyLoading(false));
    }
  }, [activeTab]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    setProfileErr('');

    const formData = new FormData();
    if (profile.name !== reduxUser?.name) formData.append('name', profile.name);
    if (profile.email !== reduxUser?.email) formData.append('email', profile.email);
    if (profile.city !== reduxUser?.city) formData.append('city', profile.city || '');
    if (profile.dateOfBirth !== reduxUser?.dateOfBirth) formData.append('dateOfBirth', profile.dateOfBirth || '');
    if (profileImage) formData.append('profile_image', profileImage);

    axios.put('/api/user/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then((response) => {
        const updated = response.data.user;
        const merged = { ...reduxUser, ...updated };
        localStorage.setItem('user', JSON.stringify(merged));
        dispatch(setUser(merged));
        setProfileImage(null);
        setProfileMsg('Profile updated successfully.');
      })
      .catch((error) => {
        const err = error.response?.data?.errors;
        const firstKey = err ? Object.keys(err)[0] : null;
        setProfileErr(firstKey ? err[firstKey][0] : 'Could not update your profile.');
      })
      .finally(() => setProfileSaving(false));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdMsg('');
    setPwdErr('');

    axios.put('/api/user/password', pwd)
      .then(() => {
        setPwd({ current_password: '', password: '', password_confirmation: '' });
        setPwdMsg('Password updated successfully.');
      })
      .catch((error) => {
        const err = error.response?.data?.errors;
        const firstKey = err ? Object.keys(err)[0] : null;
        setPwdErr(error.response?.data?.message || (firstKey ? err[firstKey][0] : 'Could not update your password.'));
      })
      .finally(() => setPwdSaving(false));
  };

  const tabs = [
    { id: 'info', label: 'Personal info', icon: FaUser },
    { id: 'security', label: 'Login & security', icon: FaLock },
    { id: 'money', label: 'Payments & reservations', icon: FaCreditCard },
  ];

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500";

  let avatarSrc = reduxUser?.profile_image
    ? `${STORAGE_URL}${reduxUser.profile_image}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Account</h1>

        {/* Profile card */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
          {avatarSrc ? (
            <img src={avatarSrc} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-2xl font-bold">
              {(reduxUser?.name || 'U').charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex-1">
            {reduxUser ? (
              <>
                <p className="text-xl font-bold text-gray-900">{reduxUser.name}</p>
                <p className="text-gray-500">{reduxUser.email}</p>
              </>
            ) : (
              <p className="text-gray-500">No user data available</p>
            )}
          </div>
          <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold">Verified</span>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-400'
              }`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {activeTab === 'info' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Personal info</h2>

              {profileMsg && <p className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">{profileMsg}</p>}
              {profileErr && <p className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{profileErr}</p>}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full name</label>
                <input className={inputClass} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <input type="email" className={inputClass} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City</label>
                  <input className={inputClass} value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date of birth</label>
                  <input type="date" className={inputClass} value={profile.dateOfBirth} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Profile photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-semibold hover:file:bg-indigo-100"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                />
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-60"
              >
                {profileSaving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Login & security</h2>

              {pwdMsg && <p className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">{pwdMsg}</p>}
              {pwdErr && <p className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{pwdErr}</p>}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current password</label>
                <input type="password" className={inputClass} value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New password</label>
                  <input type="password" className={inputClass} value={pwd.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} required minLength={8} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirm new password</label>
                  <input type="password" className={inputClass} value={pwd.password_confirmation} onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })} required minLength={8} />
                </div>
              </div>
              <button
                type="submit"
                disabled={pwdSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-60"
              >
                {pwdSaving ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}

          {activeTab === 'money' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Payments</h2>
                <p className="text-sm text-gray-500 mt-1">Your secure Stripe payments.</p>
                {moneyLoading ? (
                  <div className="mt-4 flex items-center justify-center py-8">
                    <span className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : payments.length === 0 ? (
                  <p className="mt-4 p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">No payments yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {payment.status === 'paid' ? <FaCheckCircle /> : <FaClock />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{payment.listing_title || 'Reservation'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()} · Stripe · {(payment.status || 'pending').toUpperCase()}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900">{formatPrice(payment.amount)} MAD</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">My reservations</h2>
                <p className="text-sm text-gray-500 mt-1">Bookings you made on other listings.</p>
                {moneyLoading ? (
                  <div className="mt-4 flex items-center justify-center py-8">
                    <span className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : reservations.length === 0 ? (
                  <p className="mt-4 p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">No reservations yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${reservation.is_paid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {reservation.is_paid ? <FaWallet /> : <FaClock />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{reservation.listing?.title}</p>
                          <p className="text-sm text-gray-500">
                            {reservation.start_date} → {reservation.end_date} · <span className="font-medium capitalize">{reservation.status}</span>
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reservation.is_paid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {reservation.is_paid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400"><FaCar /> Reservations are confirmed after payment succeeds.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;