import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { setShowProfile, setShowLogine, setShowInscription, setShowMenuOfuser } from '../Redux/navbarSlice';
import { logoutUser } from '../Redux/usersSlice';
import { useNavigate  } from 'react-router-dom';
 
import Logine from '../Forms/Login';
import Singup from '../Forms/Singup';
import logo from './WhatsApp_Image_2024-04-12_at_22.08.25-removebg-preview.png';

const Navbar = () => {
  const  navigate =useNavigate();
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const showProfile = useSelector((state) => state.navbar.showProfile);
  const showLogine = useSelector((state) => state.navbar.showLogine);
  const showInscription = useSelector((state) => state.navbar.showInscription);
  const showMenuOfuser = useSelector((state) => state.navbar.showMenuOfuser);
  const numberFavories = useSelector((state)=>state.wishlests.numberFavories);
 
  
  const dispatch = useDispatch();
  useEffect(() => {
    if (!loggedIn ) {
      
    //
    }
  }, [loggedIn]);

  const handleShow = () => {
    if (loggedIn) {
      dispatch(setShowMenuOfuser(true));
      dispatch(setShowProfile(false));
    } else {
      dispatch(setShowMenuOfuser(false));
      dispatch(setShowProfile(true));
    }
  };
  const removeMenuuser=()=>{
    dispatch(setShowMenuOfuser(false))

  }
  const removeMenuProfile=()=>{
    dispatch(setShowProfile(false))

  }

  const handleLogin = () => {
    
    dispatch(setShowLogine(true));
    dispatch(setShowProfile(false));
  };

  const handelInscription = () => {
    dispatch(setShowInscription(true));
    dispatch(setShowProfile(false));
  };
  const handleLogout = () => {
   
    dispatch(logoutUser())
      .then(() => {
        localStorage.removeItem('isLoggedIn'); 
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
      dispatch(setShowMenuOfuser(false))
  };


  return (
    <>
      <header className={ `${showLogine || showInscription  ? "opacity-50 pointer-events-none " : ""} " static flex flex-row  border-b-2  "`}>
          <div className=' absolute   w-15 lg:ml-3 mt-2  '>
            <Link to="/" >            <img src={logo} alt="logo" className="w-10 lg:w-20"></img>
            </Link>
           
          </div>
     
        
        <nav className=" ">
       
          <div className="Search-bar
          ml-[45%]
          mb-3
          w-[250%]
          
         sm:w-[250%]
         sm:ml-[20%]
         sm:mb-2
         sm:p-2
        

        
         
         
          md:mb-[5%]
          md:p-2
         
          md:ml-[75%]
          border-gray-400 
          rounded-full
          mt:mt-3
         
         
          lg:p-1 
          flex flex-row lg:ml-[50%] 
          lg:shadow-xl border
          
           lg:border-gray-400 
         
            lg:w-[210%] mt-3
            
            ">

          <div className=" flex flex-col 
          rounded-full 
          
          cursor-pointer group hover:bg-gray-100  lg:w-[30%]   ">
  <div>
    <label className=" absolute mt-2 ml-5 cursor-pointer text-xs  sm:mt-2  md:text-xl md:mt-[10px] md:ml-5   lg:text-sm font-medium lg:ml-10 lg:mt-[8px] ">Where</label>
  </div>
  <div className="relative hidden  lg:inline-block    ">
    <input 
      className=" 
    
       md:placeholder:text-xl
       
      
      
     
       lg:mt-[10%]
       lg:ml-10 
       lg:focus:outline-none rounded-full 
       lg:text-xs 
       lg:font-medium 
       bg-transparent 
       
       lg:placeholder:text-sm 
       lg:placeholder:font-normal "
      type="text"
      placeholder='Search destination'
    />
    
  </div>
</div>

            <div className="flex flex-col   rounded-full hover:bg-gray-100 cursor-pointer w-[30%] ">
              
              <label  className=' ml-[120%] mt-2 text-xs cursor-pointer md:text-xl md:mt-2   lg:text-sm font-medium lg:ml-5 lg:mt-2  '>Who</label>
             
          

            <span className=" hidden lg:inline-block  text-slate-500 lg:text-sm lg:ml-5  ">Add guest</span>
            </div>
            <div className="flex flex-col rounded-full  hover:bg-gray-100 cursor-pointer w-[30%] ">
            <label className='  ml-[100%] mt-2 text-xs md:text-xl md:mt-2   lg:text-sm font-medium lg:ml-5 lg:mt-2 '>Price</label>
           <span className="hidden lg:inline-block   text-slate-500 text-sm ml-5">Price ranking</span>
           </div>
           <div className='' >
           <button className="w-25 h-25 ml-[105%] p-0 bg-slate-950 border-2 borde rounded-full w-[100%] h-[100%]  text-slate-50  hover:bg-gray-500  lg:p-3 mr-5 lg:mr-[15%]  "><FontAwesomeIcon icon={faSearch}  className=" lg:w-[100%] "/></button>
           </div>
            
           <div className=" text-center absolute grid grid-cols-3
           lg:gap-12
           ml-[75%]
           
           lg:w-[6%]
           lg:h-[6%]
          
            
          
            sm:ml-[83%]
            md:mb-[5%]
            md:ml-[75%]
            
            
            
          
            
          
            lg:p-3 
            
            lg:ml-[70%] 
            lg:mt-[5px] 
            lg:border 
            lg:border-x-2 lg:rounded-full 
            
            hover:shadow-xl 
            cursor-pointer " onClick={handleShow} >
           <FontAwesomeIcon className='ml-2'   icon={faBars} />
        <FontAwesomeIcon  className="hidden lg:inline-block"  icon={faUser}/>
        </div>
        
          </div>
         
        </nav>
       
        {showProfile ? (
        
        <div className="absolute z-40  mt-[10%] py-2 ml-[60%]   rounded border bg-slate-50 lg:w-[20%] lg:py-5    lg:ml-[70%] lg:mt-[5%] shadow-xl shadow-slate-200 ">
                   <button className='ml-[85%]' onClick={removeMenuProfile} ><svg  xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></button>

          <div className="rounded overflow-hidden ">
            <div className="  ">
              <ul className='flex flex-col '>
                <li className='p-2 hover:bg-white font-medium cursor-pointer ' >
                

               <button onClick={handleLogin}>Log in</button>
                
                  </li>
                  <li  className='p-2 hover:bg-white border-b  cursor-pointer '>
                  <button onClick={handelInscription}>Sing up</button>
                  </li>
                  <li  className='p-2 mt-2 hover:bg-white cursor-pointer '>
                    <a className="#">Help Center</a> 
                  </li>
                 
               
              </ul>
              
              
            </div>
           
            
          </div>
        </div>
        
     
    ) : null}
        
        {showMenuOfuser ? (
          
        <div className="absolute z-40 mt-[15%] py-2 ml-[60%]  rounded border bg-slate-50 lg:w-[20%] lg:py-5 lg:ml-[70%] lg:mt-[5%] shadow-xl shadow-slate-200 ">
         <button className='ml-[85%]' onClick={removeMenuuser} ><svg  xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></button>
         <div className="rounded overflow-hidden ">
            <div className=" ">
              <ul className='flex flex-col '>
                <li className='p-2 hover:bg-white font-medium cursor-pointer ' >
                

             <Link to="Account" > Account</Link>
                
                  </li>
                  <li className='p-2 hover:bg-white font-medium cursor-pointer ' >
                
                  <Link to="Dashboard" > Manage my listings</Link>
               
                
                  </li>
                  <li className='p-2 static hover:bg-white font-medium cursor-pointer ' >
                

               
                  <Link to="Wishlest" >
  Wishlist 
  <span className={`${numberFavories.length === 0 ? ' hidden' :'bg-red-600 absolute text-gray-50  w-[5%] h-[5%] text-center text-sm ml-[7px] mt-[5px] rounded-full'}`}>
    {numberFavories}
  </span>
</Link>

                
                  </li>
                  <li className='p-2 hover:bg-white border-b font-medium cursor-pointer ' >
                

                   <button >Messages</button>
                
                  </li>
                  <li  className='p-2 mt-2 hover:bg-white   cursor-pointer '>
                  <button >Help Center</button>
                  </li>
                  <li  className='p-2 mt-2 hover:bg-white cursor-pointer '>
                 <button onClick={handleLogout}>  Log out </button>
                  </li>
                 
               
              </ul>
              
              
            </div>
           
            
          </div>
        </div>
      ) : null}
      </header>
      {showLogine ? <Logine /> : null}
      {showInscription ? <Singup /> : null}
      
    </>
  );
};

export default Navbar;
