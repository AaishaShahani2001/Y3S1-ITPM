import React from "react";
import heroImg from "../assets/background.jpg";

export default function Hero() {
  return (
    <section className="relative bg-transparent overflow-hidden pb-10 pt-20 z-10">

      {/* Abstract Background Shapes */}
      <div className="absolute right-0 top-0 w-120 h-120 bg-blue-400/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4 z-0 pointer-events-none animate-pulse" />
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/4 z-0 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-[80px] z-0 pointer-events-none animate-spin-slow" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">

        {/* LEFT BACKGROUND IMAGE - Moved to Right on Desktop for better flow if desired, but keeping original layout */}
        {/* Swapping order for mobile consideration usually puts content first, but sticking to existing layout mapping */}
        <div className="order-2 md:order-1 relative animate-float">
          <div
            className="relative h-87.5 md:h-105 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50"
            style={{
              backgroundImage: `url(${heroImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
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
            <span className="text-gradient relative block md:inline mt-2">
              Proper Care
              <svg className="absolute w-full h-4 -bottom-2 left-0 text-emerald-400/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 12 100 5" stroke="currentColor" strokeWidth="10" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-lg leading-relaxed mb-8">
            Book counselling sessions, manage appointments, and receive
            professional guidance through our trusted university wellbeing
            support platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl shadow-xl shadow-blue-500/30 transition-all transform hover:-translate-y-1 font-bold text-lg animate-pulse-subtle">
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
