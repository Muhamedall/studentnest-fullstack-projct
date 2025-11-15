import { useSelector } from 'react-redux';

const Account = () => {
  const user = useSelector((state) => state.users.user);
  const loading = useSelector((state) => state.users.loading);
  console.log("this is data :" + user )
  return (
    <>
      <div className='lg:ml-[15%] lg:mt-[5%] '>
        <h1 className='font-medium text-xl'>Account</h1>
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <p>Email: {user.email} | Name: {user.name}</p>
        ) : (
          <p>No user data available</p>
        )}
      </div>

      <div className='flex flex-col lg:flex lg:flex-row lg:ml-[10%]'>

        <div className="mt-[10%] p
        
        y-[2%] rounded-2xl border bg-slate-50 lg:w-[25%] lg:py-[4%] lg:ml-[5%] lg:mt-[5%] shadow-xl shadow-slate-200">
          <div className="rounded overflow-hidden ">
            <div>
              <svg className='w-[15%] ml-[5%]' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#5f6368">
                <path d="M440-280h320v-22q0-45-44-71.5T600-400q-72 0-116 26.5T440-302v22Zm160-160q33 0 56.5-23.5T680-520q0-33-23.5-56.5T600-600q-33 0-56.5 23.5T520-520q0 33 23.5 56.5T600-440ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z"/>
              </svg>
            </div>
            <div className="ml-[5%]">
              <h1 className='font-medium text-xl'>Personal info</h1>
              <p className='text-gray-400'>Provide personal details and how we can reach you</p>
            </div>
          </div>
        </div>

        <div className="mt-[10%] py-[2%] rounded-2xl border bg-slate-50 lg:w-[25%] lg:py-[4%] lg:ml-[5%] lg:mt-[5%] shadow-xl shadow-slate-200">
          <div className="rounded overflow-hidden">
            <div>
              <svg className='w-[15%] ml-[5%]' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#5f6368">
                <path d="m438-338 226-226-57-57-169 169-84-84-57 57 141 141Zm42 258q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z"/>
              </svg>
            </div>
            <div className="ml-[5%]">
              <h1 className='font-medium text-xl'>Login & security</h1>
              <p className='text-gray-400'>Update your password and secure your account</p>
            </div>
          </div>
        </div>

        <div className="mt-[10%] py-[2%] rounded-2xl border bg-slate-50 lg:w-[25%] lg:py-[4%] lg:ml-[5%] lg:mt-[5%] shadow-xl shadow-slate-200">
          <div className="rounded overflow-hidden">
            <div>
              <svg className='w-[15%] ml-[5%]' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#5f6368">
                <path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm440 240H120q-33 0-56.5-23.5T40-240v-440h80v440h680v80ZM280-400v-320 320Z"/>
              </svg>
            </div>
            <div className="ml-[5%]">
              <h1 className='font-medium text-xl'>Payments & payouts</h1>
              <p className='text-gray-400'>Review payments, payouts, coupons, and gift cards</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
