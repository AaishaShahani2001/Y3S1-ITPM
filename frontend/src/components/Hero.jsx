import React from "react";
import heroImg from "../assets/background.jpg";

export default function Hero() {
  return (
    <section className="relative bg-[#f6fbff] overflow-hidden pb-10 pt-20">

      {/* Abstract Background Shape */}
      <div className="absolute right-0 top-0 w-120 h-120 bg-blue-100/50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4 z-0 pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/4 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">

        {/* LEFT BACKGROUND IMAGE - Moved to Right on Desktop for better flow if desired, but keeping original layout */}
        {/* Swapping order for mobile consideration usually puts content first, but sticking to existing layout mapping */}
        <div className="order-2 md:order-1 relative">
          <div
            className="relative h-87.5 md:h-105 rounded-2xl shadow-lg overflow-hidden"
            style={{
              backgroundImage: `url(${heroImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          </div>
          {/* Decorative floating card */}
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl hidden md:block animate-bounce-slow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                ✓
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">24/7 Support</p>
                <p className="text-xs text-gray-500">Always available</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT - Actually Left in code structure vs visual, but sticking to 'grid' logic */}
        <div className="order-1 md:order-2">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-6">
            Welcome to MindBridge
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Overcome Your <br />
            Challenges With <br />
            <span className="text-blue-600 relative">
              Proper Care
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-lg leading-relaxed mb-8">
            Book counselling sessions, manage appointments, and receive
            professional guidance through our trusted university wellbeing
            support platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 font-medium text-lg">
              Make Appointment
            </button>

            <button className="bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-600 hover:text-blue-600 px-8 py-4 rounded-xl transition-all font-medium text-lg">
              Learn More
            </button>
          </div>

          <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200`} />
              ))}
            </div>
            <p>Trusted by 500+ students</p>
          </div>
        </div>
      </div>
    </section>
  );
}
