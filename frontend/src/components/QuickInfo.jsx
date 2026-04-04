import React from "react";
import {
  FaUserMd,
  FaMicroscope,
  FaAmbulance,
  FaStethoscope,
  FaClock,
  FaPhoneAlt,
  FaCalendarAlt,
} from "react-icons/fa";

export default function QuickInfo() {
  return (
    <section className="relative bg-transparent -mt-20 pt-5 pb-20 z-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* TOP FLOATING INFO CARD */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 border border-white/60 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-linear-to-tr from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />


          {/* Opening Hours */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-100 pb-8 md:pb-0 md:pr-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <FaClock />
              </div>
              Opening Hours
            </h3>
            <ul className="text-slate-600 space-y-3 pl-2">
              <li className="flex justify-between w-full text-sm">
                <span>Mon – Fri</span>
                <span className="font-medium text-slate-800">8.30 AM – 5.00 PM</span>
              </li>
              <li className="flex justify-between w-full text-sm">
                <span>Saturday</span>
                <span className="font-medium text-slate-800">9.00 AM – 1.00 PM</span>
              </li>
              <li className="flex justify-between w-full text-sm text-red-500">
                <span>Sunday</span>
                <span className="font-medium">Closed</span>
              </li>
            </ul>
          </div>

          {/* Timetable */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-100 pb-8 md:pb-0 md:pr-8 md:pl-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <FaCalendarAlt />
              </div>
              Counsellor Timetable
            </h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Check availability and session schedules of our professional counsellors to plan your visit.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg self-start">
              View Timetable
            </button>
          </div>

          {/* Emergency */}
          <div className="flex flex-col md:pl-8 justify-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl text-blue-600 shadow-inner">
                <FaPhoneAlt className="animate-pulse" />
              </div>
              Support Assistance
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Need immediate help? We are here for you.
            </p>
            <p className="text-blue-600 font-extrabold text-3xl tracking-tight">
              +94 77 123 4567
            </p>
            <p className="text-xs text-slate-400 mt-2">24/7 Emergency Line</p>
          </div>
        </div>

        {/* FEATURE ICONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {[
            { icon: FaUserMd, title: "Qualified Counsellors", desc: "Certified and experienced professionals." },
            { icon: FaMicroscope, title: "Modern Facilities", desc: "Secure and comfortable counselling spaces." },
            { icon: FaAmbulance, title: "Emergency Help", desc: "Support when it matters most." },
            { icon: FaStethoscope, title: "Individual Approach", desc: "Personalized care for each student." }
          ].map((item, idx) => (
            <div key={idx} className="group bg-white/40 backdrop-blur-md p-8 rounded-3xl hover:bg-white/80 transition-all duration-500 border border-white/20 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 text-center hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-b from-blue-500/0 to-blue-500/0 group-hover:to-blue-500/5 transition-all duration-500" />

              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <item.icon />
              </div>
              <h4 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
