import React, { useState } from "react";
import ServiceModal from "./ServiceModal";
import {
  FaUserMd,
  FaLaptopMedical,
  FaUsers,
  FaBrain,
  FaGraduationCap,
  FaHeartbeat,
  FaBriefcase,
  FaUserTie,
} from "react-icons/fa";

const services = [
  {
    title: "Stress Management",
    description: "Programs and sessions designed to help students manage stress and improve wellbeing.",
    icon: FaBrain,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Academic Support",
    description: "Counselling focused on academic pressure, time management, and exam-related stress.",
    icon: FaGraduationCap,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    title: "Career Guidance",
    description: "Expert advice and counseling to help you navigate your career path and professional growth.",
    icon: FaBriefcase,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Personal Development",
    description: "Guidance on personal growth, building self-esteem, communication, and emotional intelligence.",
    icon: FaUserTie,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Individual Counselling",
    description: "One-on-one counselling sessions to support students with personal, academic, or emotional challenges.",
    icon: FaUserMd,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Crisis Support",
    description: "Immediate support and guidance for students facing urgent or critical situations.",
    icon: FaHeartbeat,
    color: "bg-red-50 text-red-600",
  },

  {
  title: "Wellbeing Events",
  description: "Explore upcoming wellbeing programs and register for university events.",
  icon: FaUsers,
  color: "bg-green-50 text-green-600",
  path: "/events"
},
];

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <section className="bg-transparent py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="bg-blue-100 text-blue-600 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
            Our Services
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Supporting Your <span className="text-gradient">Wellbeing Journey</span>
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            We provide a comprehensive range of professional counselling and wellbeing services
            tailored to support university students throughout their academic life.
          </p>
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-xl transition-all duration-500 border border-white/40 hover:border-blue-300 hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] relative overflow-hidden`}
            >
              {/* Contextual Glow Background */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 ${service.color.split(' ')[0]} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500 rounded-full`} />
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-6 ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                <service.icon />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {service.description}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                      if (service.path) {
                        window.location.href = service.path;
                      } else {
                        setSelectedService(service);
                      }
                    }}
                  className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300"
                >
                  Learn more <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICE MODAL */}
      <ServiceModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService}
      />
    </section>
  );
}
