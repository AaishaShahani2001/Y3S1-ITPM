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
import CounsellorDetails from "./pages/CounsellorDetails";

import BookAppointment from "./pages/BookAppointment";

import EventList from "./pages/events/EventList";
import CreateEvent from "./pages/events/CreateEvent";
import RegisterEvent from "./pages/events/RegisterEvent";
import EventDetails from "./pages/events/EventDetails";
import EventAnalyticsPage from "./pages/admin/EventAnalyticsPage";
import MyEvents from "./pages/student/MyEvents";
export default function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-x-hidden">
      {/* Global Background Decorations */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none z-0 animate-pulse-slow"></div>
      <div className="fixed top-1/2 -right-24 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed -bottom-24 left-1/4 w-120 h-120 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none z-0"></div>


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

          {/* Book Appointment Page */}
          <Route path="/book-appointment" element={<BookAppointment />} />

          {/* Counselor Listing page */}
          <Route path="/counsellors" element={<Counsellors />} />
          {/* Counselor Details page */}
          <Route path="/counsellor/:id" element={<CounsellorDetails />} />
          

          {/* Event List Page */}
          <Route path="/events" element={<EventList />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/register-event/:id" element={<RegisterEvent />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/admin/events/:id/analytics" element={<EventAnalyticsPage />} />
          <Route path="/admin/event-analytics/:id" element={<EventAnalyticsPage />} />
          <Route path="/my-events" element={<MyEvents />} />
        </Routes>


        <ToastContainer position="top-right" autoClose={3000} />
      </main>
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
