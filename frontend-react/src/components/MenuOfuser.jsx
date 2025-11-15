

const MenuOfuser=()=>{

    return(
        <>
        
        <div className="absolute z-40  mt-[10%] py-2 ml-[60%]   rounded border bg-slate-50 lg:w-[20%] lg:py-5    lg:ml-[70%] lg:mt-[5%] shadow-xl shadow-slate-200 ">
          <div className="rounded overflow-hidden ">
            <div className="  ">
              <ul className='flex flex-col '>
                <li className='p-2 hover:bg-white font-medium cursor-pointer ' >
                

               <button >Account</button>
                
                  </li>
                  <li className='p-2 hover:bg-white font-medium cursor-pointer ' >
                

               <button >Trips</button>
                
                  </li>
                  <li className='p-2 hover:bg-white font-medium cursor-pointer ' >
                

               <button >Wishlist</button>
                
                  </li>
                  <li className='p-2 hover:bg-white border-b font-medium cursor-pointer ' >
                

               <button >Messages</button>
                
                  </li>
                  <li  className='p-2 mt-2 hover:bg-white   cursor-pointer '>
                  <button >Help Center</button>
                  </li>
                  <li  className='p-2 mt-2 hover:bg-white cursor-pointer '>
                    <a className="#">Log out</a> 
                  </li>
                 
               
              </ul>
              
              
            </div>
           
            
          </div>
        </div>
        
     
        </>
    )

}

export default MenuOfuser;