import React from "react";
import {
  FaCalendarPlus,
  FaUserCheck,
  FaClipboardList,
  FaHandsHelping,
} from "react-icons/fa";

export default function HowWeWork() {
  const steps = [
    {
      icon: FaCalendarPlus,
      title: "Appointment Booking",
      description: "Students book counselling sessions by selecting available time slots based on their needs.",
    },
    {
      icon: FaUserCheck,
      title: "Initial Consultation",
      description: "The counsellor conducts an initial session to understand the student’s concerns and situation.",
    },
    {
      icon: FaClipboardList,
      title: "Treatment Plan",
      description: "A structured treatment plan is created, with progress tracked across follow-up sessions.",
    },
    {
      icon: FaHandsHelping,
      title: "Ongoing Support",
      description: "Continuous guidance, monitoring, and support are provided to ensure long-term wellbeing.",
    },
  ];

  return (
    <section className="bg-slate-50 py-24 border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-6">

        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-blue-600 font-bold mb-3 uppercase tracking-widest text-xs">
            Our Process
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
            How We Work
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            A simple and structured 4-step approach designed to support students
            throughout their wellbeing journey.
          </p>
        </div>

        {/* PROCESS STEPS */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12 text-center">

          {/* CONNECTING LINE (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-blue-100 -z-10">
            {/* Animated Progress Line Effect (Optional) */}
            <div className="absolute top-0 left-0 h-full w-full bg-linear-to-r from-blue-100 via-blue-300 to-blue-100 opacity-50" />
          </div>

          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Step Number Decoration */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-6xl font-black text-slate-100/80 -z-20 select-none group-hover:text-blue-100/50 transition-colors">
                0{index + 1}
              </div>

              {/* Icon Circle */}
              <div className="relative w-24 h-24 mx-auto rounded-full bg-white border-4 border-blue-50 flex items-center justify-center mb-6 shadow-sm group-hover:border-blue-500 group-hover:shadow-blue-200/50 group-hover:shadow-xl transition-all duration-300 z-10">
                <step.icon className="text-blue-600 text-3xl group-hover:scale-110 transition-transform duration-300" />
                {/* Ping effect on hover */}
                <span className="absolute w-full h-full rounded-full border border-blue-400 opacity-0 group-hover:animate-ping-slow"></span>
              </div>

              {/* Content */}
              <h4 className="font-bold text-xl text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed px-2">
                {step.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
