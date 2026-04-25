import React from "react";
import heroImg from "../assets/background.jpg";

const profileImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80",
];

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden pb-14 pt-20 z-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-slate-950/80 via-slate-900/70 to-blue-950/55" />

      {/* Abstract Background Shapes */}
      <div className="absolute right-0 top-0 w-120 h-120 bg-blue-400/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4 z-0 pointer-events-none animate-pulse" />
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/4 z-0 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-[80px] z-0 pointer-events-none animate-spin-slow" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center py-5 md:py-12 -translate-y-4">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/15 border border-white/25 text-blue-100 text-[11px] font-bold tracking-[0.16em] uppercase mb-6 backdrop-blur-sm">
            University Counseling Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
            Professional Support for <br />
            Student Wellbeing and <br />
            <span className="text-[#f6e7c9] relative block md:inline mt-2">
              Academic Success
            </span>
          </h1>

          <p className="text-slate-200 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            Access confidential counseling, structured follow-up sessions, and
            trusted mental health guidance through one secure, student-focused
            care experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4.5 rounded-2xl shadow-xl shadow-blue-500/25 transition-all font-bold text-base">
              Book a Session
            </button>

            <button className="bg-white/15 border-2 border-white/35 text-white hover:border-blue-200 hover:text-blue-100 px-8 py-4 rounded-xl transition-all font-semibold text-base backdrop-blur-sm">
              Learn More
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 text-sm text-slate-200">
            <div className="flex -space-x-3">
              {profileImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Student profile ${i + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <p>Trusted by 500+ university students</p>
          </div>
        </div>
      </div>
    </section>
  );
}
