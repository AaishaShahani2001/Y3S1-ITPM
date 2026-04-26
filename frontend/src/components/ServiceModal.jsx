import React, { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import authImg from "../assets/login.jpg";
import groupDoctors from "../assets/groupDoctors.jpg";
import background from "../assets/background.jpg";

const images = [groupDoctors, authImg, background];

export default function ServiceModal({ isOpen, onClose, service }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen || !service) return null;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl transform transition-all animate-fade-in-up flex flex-col md:flex-row max-h-[80vh]">

                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 md:hidden bg-white/80 p-2 rounded-full text-slate-800 shadow-md"
                >
                    <FaTimes />
                </button>

                {/* Image Slider Section */}
                <div className="w-full md:w-5/12 relative bg-slate-100 h-56 md:h-auto">
                    <div
                        className="w-full h-full bg-cover bg-center transition-all duration-500"
                        style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
                    />

                    {/* Slider Controls */}
                    <div className="absolute inset-0 flex items-center justify-between p-4">
                        <button
                            onClick={prevImage}
                            className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition"
                        >
                            <FaChevronLeft size={14} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition"
                        >
                            <FaChevronRight size={14} />
                        </button>
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-7/12 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${service.color}`}>
                            <service.icon />
                        </div>
                        <button
                            onClick={onClose}
                            className="hidden md:block text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-full"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-3">{service.title}</h2>

                    <div className="space-y-3 text-slate-600 leading-relaxed text-sm">
                        <p className="font-medium text-blue-600">
                            {service.description}
                        </p>
                        <p>
                            Our {service.title} service is designed to provide comprehensive support tailored to your unique needs.
                            Whether you are looking for guidance, professional advice, or simply a safe space to talk,
                            our dedicated team is here to help you every step of the way.
                        </p>
                        <p className="font-semibold text-slate-700">Features include:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Professional and confidential sessions</li>
                            <li>Experienced and certified counsellors</li>
                            <li>Flexible scheduling options</li>
                            <li>Personalized care plans</li>
                        </ul>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
                        <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30 text-sm">
                            Book Session
                        </button>
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
