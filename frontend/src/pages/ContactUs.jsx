import React from "react";
import authImg from "../assets/auth.jpg"; 
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function ContactUs() {
    return (
        <div className="min-h-screen bg-linear-to-b from-sky-50/80 via-blue-50/40 to-slate-50">

            {/* HEADER BANNER */}
            <div className="relative h-200 w-full overflow-hidden">
                <div className="absolute inset-0 p-4 md:p-8">
                    <div className="relative h-full w-full max-w-7xl mx-auto overflow-hidden rounded-3xl shadow-2xl">
                        <img
                            src={authImg}
                            alt="MindBridge support team"
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-slate-900/75 via-slate-900/60 to-slate-950/70" />
                    </div>
                </div>

                <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center">
                    <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-2">
                        Get in Touch
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Contact Us
                    </h1>
                    <p className="text-slate-200 text-lg max-w-xl">
                        Have questions or need support? We are here to help you.
                    </p>
                </div>
            </div>

            {/* CONTACT CONTENT */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* LEFT: Contact Info & Map */}
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">
                            Contact Information
                        </h2>
                        <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                            Reach out to us via phone, email, or visit our center. Our team is ready to assist you with any inquiries or support you may need.
                        </p>

                        <div className="space-y-8 mb-12">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl shrink-0">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">Our Location</h4>
                                    <p className="text-slate-600">123 University Avenue, Colombo 07, Sri Lanka</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl shrink-0">
                                    <FaPhoneAlt />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">Phone Number</h4>
                                    <p className="text-slate-600">+94 77 123 4567</p>
                                    <p className="text-slate-500 text-sm">Mon-Fri 9am-6pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl shrink-0">
                                    <FaEnvelope />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">Email Address</h4>
                                    <p className="text-slate-600">support@mindbridge.lk</p>
                                </div>
                            </div>
                        </div>

                        {/* Map Embed */}
                        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 h-64 w-full">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.58638746766!2d79.78616426460026!3d6.921833359670829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo!5e0!3m2!1sen!2slk!4v1716300000000!5m2!1sen!2slk"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>

                    {/* RIGHT: Contact Form */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h3>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="john@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                                <select className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                    <option>General Inquiry</option>
                                    <option>Appointment Issue</option>
                                    <option>Feedback</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                                <textarea rows="4" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="How can we help you?"></textarea>
                            </div>

                            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1">
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </section>

        </div>
    );
}
