import React from "react";
import Login from "./Auth/Login";
import { Route, Routes } from "react-router-dom";
import Register from "./Auth/Register";
import AdminPanel from "./AdminPage/AdminPanel";
import AdminManager from "./AdminPage/ManagerClient/AdminManager";
import ProductTabs from "./AdminPage/Product/ProductTabs";
import WhatsAppQR from "./AdminPage/Chat/WhatsAppQR";

function Admin() {
  return (
    <div className="admin">

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/register'  element={<Register/>}/>

        <Route path='/AdminPanel'  element={<AdminPanel/>}/>
        <Route path='/AdminManager'  element={<AdminManager/>}/>
        <Route path='/AdminProduct'  element={<ProductTabs/>}/>
        <Route path='/Chat'  element={<WhatsAppQR/>}/>
        
      </Routes>
     
    </div>
  );
}

export default Admin;
