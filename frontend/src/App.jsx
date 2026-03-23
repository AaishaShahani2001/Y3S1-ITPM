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

import AdminDashboard from "./pages/admin/AdminDashboard";
import CounselorDashboard from "./pages/counselor/CounselorDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

import Counsellors from "./pages/Counsellors";

import EventList from "./pages/events/EventList";


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
          {/* Admin Dashboard */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          {/* Counselor Dashboard */}
          <Route path="/counselor-dashboard" element={<CounselorDashboard />} />
          {/* Student Dashboard */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />

          {/* Counselor Listing page */}
          <Route path="/counsellors" element={<Counsellors />} />
          

          {/* Event List Page */}
          <Route path="/events" element={<EventList />} />


        </Routes>


        <ToastContainer position="top-right" autoClose={3000} />
      </main>
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
