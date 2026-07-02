import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter, Route, Routes } from 'react-router-dom'
// import { createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
// import './index.css'
// import App from './App.jsx'
// import Layout from './Layout.jsx'
// import Login from './Component/Login/Login.jsx'
// import Register from './Component/Signup/Signup.jsx'
// import { LoginForm } from './Component/LoginNew/LoginForm.jsx'

// const router = createBrowserRouter(
// createRoutesFromElements(
//   <Route path="/" element={<Layout/>}>
//     <Route index element={<LoginForm/>}/>
//     <Route path="*" element={<div>404 Not Found</div>}/>
//     <Route path="register_user" element={<Register/>}/>
//     <Route path="app" element={<App/>}/>
//   </Route>  
//   )
// )

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <RouterProvider router={router} />
//   </StrictMode>,
// )