import { Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";

import Hero from "./components/Hero";
import QuickInfo from "./components/QuickInfo";
import HowWeWork from "./components/HowWeWork";


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
                  {/*<Services />
                <CTA /> */}
              </>
            }
          />

        </Routes>


        <ToastContainer position="top-right" autoClose={3000} />
      </main>

    </div>
  );
}
