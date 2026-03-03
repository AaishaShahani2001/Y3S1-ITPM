import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Hero from "./components/Hero";
import QuickInfo from "./components/QuickInfo";
import HowWeWork from "./components/HowWeWork";
import Services from "./components/Services";
import CTA from "./components/CTA";

import Auth from "./pages/Auth";


export default function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="grow">
        <Routes>
          {/* Home Page */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <QuickInfo />
                <HowWeWork />
                <Services />
                <CTA />
              </>
            }
          />

          {/* Auth Page */}
          <Route path="/auth" element={<Auth />} />


        </Routes>


        <ToastContainer position="top-right" autoClose={3000} />
      </main>
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
