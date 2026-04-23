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
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

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
import QRScanner from "./pages/admin/QRScanner";
export default function App() {
  return (
    <div className="app-beige-theme min-h-screen bg-[#F3E8CF] text-slate-900 flex flex-col relative overflow-x-hidden transition-colors duration-500">
      
      {/* NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="grow relative">
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
          {/* About Us Page */}
          <Route path="/about" element={<AboutUs />} />
          {/* Contact Us Page */}
          <Route path="/contact" element={<ContactUs />} />

          {/* Event List Page */}
          <Route path="/events" element={<EventList />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/register-event/:id" element={<RegisterEvent />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/admin/events/:id/analytics" element={<EventAnalyticsPage />} />
          <Route path="/admin/event-analytics/:id" element={<EventAnalyticsPage />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/qr-scanner/:id" element={<QRScanner />} />
        </Routes>


        <ToastContainer position="top-right" autoClose={3000} />
      </main>
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
