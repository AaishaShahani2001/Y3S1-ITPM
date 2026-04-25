import React from "react";
import groupDoctors from "../assets/groupDoctors.jpg";
import { FaBullseye, FaEye, FaHandHoldingHeart } from "react-icons/fa";

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-linear-to-b from-sky-50/80 via-blue-50/40 to-slate-50">

            {/* HEADER BANNER */}
            <div className="relative h-225 w-full overflow-hidden">
                <div className="absolute inset-0 p-4 md:p-8">
                    <div className="relative h-full w-full max-w-7xl mx-auto overflow-hidden rounded-3xl shadow-2xl">
                        <img
                            src={groupDoctors}
                            alt="MindBridge counselling team"
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-slate-900/70 via-slate-900/55 to-slate-950/70" />
                    </div>
                </div>

                <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
                    <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-2">
                        Who We Are
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                        Committed to Your <br />
                        <span className="text-blue-400">Mental Wellbeing</span>
                    </h1>
                    <p className="text-slate-200 text-lg max-w-xl leading-relaxed">
                        We are a dedicated team of professionals providing accessible, confidential,
                        and compassionate support for the university community.
                    </p>
                </div>
            </div>

            {/* MISSION & VISION SECTION */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                        {/* Mission Card */}
                        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FaBullseye className="text-9xl text-blue-600" />
                            </div>

                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl mb-6">
                                <FaBullseye />
                            </div>

                            <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Mission</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                To provide accessible, high-quality, and confidential counselling services that empower students to overcome challenges, achieve academic success, and maintain positive mental health throughout their university journey.
                            </p>
                        </div>

                        {/* Vision Card */}
                        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FaEye className="text-9xl text-blue-600" />
                            </div>

                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl mb-6">
                                <FaEye />
                            </div>

                            <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Vision</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                To cultivate a university community where mental wellbeing is prioritized, stigma is eliminated, and every student has the support and resources they need to thrive personally and academically.
                            </p>
                        </div>

                    </div>

                    {/* WHY CHOOSE MINDBRIDGE */}
                    <div className="mt-20 max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl">
                                <FaHandHoldingHeart />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-amber-900 mb-3">Why Choose MindBridge?</h3>
                            <p className="text-amber-800/90 max-w-2xl mx-auto">
                                We combine compassionate care with professional guidance to help every student feel supported, understood, and empowered.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Confidential Care", desc: "Every conversation is private, safe, and handled with the highest ethical standards." },
                                { title: "Expert Support", desc: "Our qualified counsellors provide practical, student-focused guidance for real challenges." },
                                { title: "Easy Access", desc: "Simple booking and responsive support channels make it easy to reach us when needed." }
                            ].map((val, idx) => (
                                <div key={idx} className="bg-linear-to-b from-amber-50 to-orange-50/80 p-7 rounded-2xl shadow-sm border border-amber-200/70 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                                    <h4 className="font-bold text-lg text-amber-900 mb-3">{val.title}</h4>
                                    <p className="text-sm leading-relaxed text-amber-800/90">{val.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
}
