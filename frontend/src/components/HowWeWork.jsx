import React from "react";
import {
  FaCalendarPlus,
  FaUserCheck,
  FaClipboardList,
  FaHandsHelping,
  FaArrowRight,
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
    <section className="bg-transparent py-24 relative overflow-hidden">
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

          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-1 bg-slate-200/50 -z-10 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-400 to-transparent w-1/2 animate-shimmer" />
          </div>

          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Step Number Decoration */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-9xl font-black text-slate-200/20 -z-20 select-none group-hover:text-blue-500/10 transition-all duration-700">
                0{index + 1}
              </div>

              {/* Icon Circle */}
              <div className="relative w-28 h-28 mx-auto rounded-full bg-white/80 backdrop-blur-md border-[6px] border-white shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 z-10 group-hover:shadow-blue-200/50">
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-400 group-hover:animate-spin-slow" />
                <step.icon className="text-blue-600 text-4xl group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Content */}
              <h4 className="font-bold text-xl text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed px-2">
                {step.description}
              </p>

              {/* Direction Arrow Between Steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-10 -right-9 items-center justify-center w-11 h-11 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200/70 text-white z-20 ring-2 ring-white/90 group-hover:scale-110 transition-transform duration-300">
                  <FaArrowRight className="text-sm drop-shadow-sm" />
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
