
import { BrowserRouter, Routes, Route } from "react-router";


import HommePage from './components/Homme';

import Navbar from './components/NavBar/Navbar';
import Nopages from './components/NoPages';
import Login from './components/Forms/Login';
import Singup from "./components/Forms/Singup";
import Account from './components/user-authentified/Account';
import ManageListing from './components/listings/ManageListings';
import AddListing from './components/listings/AddListing';
import Dashboard from './components/listings/Dashboard';
import DetailesListing from './components/DetailesListing';
import Wishlest from "./components/Wishlest";
import Messages from './components/Messages';
import HelpCenter from './components/HelpCenter';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import ProtectedRoute from "./components/ProtectedRoute";

const App=()=>{
   return(
    <>


<BrowserRouter>
        <Navbar/>
          <Routes>

            <Route path="/" element={<HommePage />}/>
              <Route index element={<HommePage/>} />
              <Route path="Login" element={<Login/>} />
              
              <Route path="Singup" element={<Singup/>}/>
              <Route path="Account" element={<ProtectedRoute><Account/></ProtectedRoute>}/>
              <Route path="ManageListing" element={<ProtectedRoute><ManageListing/></ProtectedRoute>}/>
              <Route path="DetailesListing/:title" element={< DetailesListing/>}/>

              <Route path="AddListing" element={<ProtectedRoute><AddListing/></ProtectedRoute>}/>
              <Route path="Dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
              <Route path="Wishlest" element={<ProtectedRoute><Wishlest/></ProtectedRoute>}/>
              <Route path="Messages" element={<ProtectedRoute><Messages/></ProtectedRoute>}/>
              <Route path="HelpCenter" element={<HelpCenter/>}/>
              <Route path="payment/success" element={<PaymentSuccess/>}/>
              <Route path="payment/cancel" element={<PaymentCancel/>}/>
              
              <Route path="*" element={<Nopages />} />
          
          </Routes>
        </BrowserRouter>


    </>
   )
}
export default App;