import React from "react";

export default function CTA() {
    return (
        <section className="relative z-20 -mb-28 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="relative overflow-hidden rounded-[3rem] p-1 bg-blue-700">
                    <div className="relative rounded-[2.9rem] px-8 py-16 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10 border border-blue-600">
                        <div className="text-[#fff0d6] text-center md:text-left">
                            <p className="text-[#f6e7c9] font-bold tracking-[0.2em] text-xs uppercase mb-4 opacity-95">
                                Your Wellbeing Matters
                            </p>
                            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-2 text-[#fff0d6]">
                                Ready to start your <br />
                                <span className="text-[#f6e7c9]">healing journey?</span>
                            </h2>
                        </div>

                        <button className="bg-[#fff0d6] text-blue-700 px-10 py-5 rounded-2xl font-black hover:bg-[#f6e7c9] transition-colors duration-300 shrink-0 uppercase tracking-widest text-sm">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
