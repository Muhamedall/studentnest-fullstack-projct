
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HommePage from './components/Homme';

import Navbar from './components/NavBar/Navbar';
import Nopages from './components/NoPages';
import Login from './components/Forms/Login';
import Singup from "./components/Forms/Singup";
import Studente from './components/Student';
import MenuOfuser from "./components/MenuOfuser";
import Account from './components/user-authentified/Account';
import ManageListing from './components/listings/ManageListings';
import AddListing from './components/listings/AddListing';
import Dashboard from './components/listings/Dashboard';
import DetailesListing from './components/DetailesListing';
import Wishlest from "./components/Wishlest";

const App=()=>{
   return(
    <>


<BrowserRouter>
        <Navbar/>
          <Routes>

            <Route path="/" element={<HommePage />}/>
              <Route index element={<HommePage/>} />
              <Route path="Login" element={<Login/>} />
              
              <Route path="MenuOfuser" element={<MenuOfuser/>} />
              <Route path="Singup" element={<Singup/>}/>
              <Route path="Student" element={<Studente/>}/>
              <Route path="Account" element={<Account/>}/>
              <Route path="ManageListing" element={<ManageListing/>}/>
              <Route path="DetailesListing/:title" element={< DetailesListing/>}/>

              <Route path="AddListing" element={<AddListing/>}/>
              <Route path="Dashboard" element={<Dashboard/>}/>
              <Route path="Wishlest" element={<Wishlest/>}/>
              
              <Route path="*" element={<Nopages />} />
          
          </Routes>
        </BrowserRouter>


    </>
   )
}
export default App;