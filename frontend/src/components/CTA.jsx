import React from "react";

export default function CTA() {
    return (
        <section className="relative z-20 -mb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-blue-600 rounded-3xl px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl hover:shadow-blue-500/20 transition-shadow duration-300">
                    <div className="text-white">
                        <p className="text-blue-100 font-medium tracking-wide text-sm uppercase mb-1">
                            Change Your Life
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold">
                            Find Your Inner Peace & Happiness
                        </h2>
                    </div>

                    <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shrink-0">
                        Book Consultation
                    </button>
                </div>
            </div>
        </section>
    );
}
