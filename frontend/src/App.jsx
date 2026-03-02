import { Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";



export default function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* NAVBAR */}
      <Navbar />


      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
