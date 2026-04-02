import React from "react";

export default function CTA() {
    return (
        <section className="relative z-20 -mb-28 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="relative overflow-hidden rounded-[3rem] shadow-2xl p-1">
                    {/* Animated Mesh Gradient Background */}
                    <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 animate-pulse-slow" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                    
                    <div className="relative bg-white/10 backdrop-blur-md rounded-[2.9rem] px-8 py-16 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10 border border-white/20">
                        <div className="text-white text-center md:text-left">
                            <p className="text-blue-100 font-bold tracking-[0.2em] text-xs uppercase mb-4 opacity-80">
                                Your Wellbeing Matters
                            </p>
                            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-2">
                                Ready to start your <br />
                                <span className="text-blue-200">healing journey?</span>
                            </h2>
                        </div>

                        <button className="bg-white text-blue-700 px-10 py-5 rounded-2xl font-black shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:shadow-white/40 hover:scale-105 transition-all duration-500 shrink-0 uppercase tracking-widest text-sm">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
