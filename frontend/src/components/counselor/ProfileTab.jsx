import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

/** Demo profile used to seed the form (frontend only). */
const DUMMY_PROFILE = {
    fullName: "Dr. Nethmi Perera",
    specialization: "Stress Management",
    qualification: "MBBS, MSc Psychology",
    experience: 5,
    registrationId: "SLMC-12345",
    workplace: "University Wellness Center",
    about:
        "Dedicated to student mental health, stress management, and confidential support sessions. Experienced in one-on-one counselling and campus wellness programs.",
    profileImage: "",
};

const MAX_BIO_LENGTH = 500;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Prefer logged-in user display name when available; otherwise dummy name. */
function readNameFromStorage() {
    try {
        const raw = localStorage.getItem("user");
        if (raw) {
            const u = JSON.parse(raw);
            if (u?.name && String(u.name).trim()) return String(u.name).trim();
        }
    } catch {
        /* ignore */
    }
    return DUMMY_PROFILE.fullName;
}

const isValidName = (value) => /^[A-Za-z\s]+$/.test((value || "").trim());

export default function ProfileTab() {
    const [profile, setProfile] = useState(() => ({
        ...DUMMY_PROFILE,
        fullName: readNameFromStorage(),
    }));
    const [fieldErrors, setFieldErrors] = useState({ fullName: "", experience: "", about: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleBioChange = (e) => {
        const value = e.target.value;
        if (value.length > MAX_BIO_LENGTH) return;
        setProfile((prev) => ({ ...prev, about: value }));
        if (fieldErrors.about) setFieldErrors((prev) => ({ ...prev, about: "" }));
    };

    /** Letters and spaces only (no numbers or special characters). */
    const handleNameChange = (e) => {
        const filtered = e.target.value.replace(/[^A-Za-z\s]/g, "");
        setProfile((prev) => ({ ...prev, fullName: filtered }));
        if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: "" }));
    };

    /** Whole years, 0–60, integers only. */
    const handleExperienceChange = (e) => {
        const v = e.target.value;
        if (v === "") {
            setProfile((prev) => ({ ...prev, experience: "" }));
            if (fieldErrors.experience) setFieldErrors((prev) => ({ ...prev, experience: "" }));
            return;
        }
        const n = parseInt(v, 10);
        if (Number.isNaN(n)) return;
        const clamped = Math.max(0, Math.min(60, n));
        setProfile((prev) => ({ ...prev, experience: clamped }));
        if (fieldErrors.experience) setFieldErrors((prev) => ({ ...prev, experience: "" }));
    };

    const validateProfile = () => {
        const err = {};
        if (!profile.fullName?.trim()) {
            err.fullName = "Display name is required.";
        } else if (!isValidName(profile.fullName)) {
            err.fullName = "Use letters and spaces only (no numbers or special characters).";
        }
        if (profile.experience === "" || profile.experience === null || profile.experience === undefined) {
            err.experience = "Experience is required.";
        } else {
            const n = Number(profile.experience);
            if (!Number.isInteger(n) || n < 0 || n > 60) {
                err.experience = "Enter a whole number from 0 to 60 years.";
            }
        }
        const bio = profile.about || "";
        if (bio.length > MAX_BIO_LENGTH) {
            err.about = `Bio must be ${MAX_BIO_LENGTH} characters or less.`;
        }
        setFieldErrors(err);
        return Object.keys(err).length === 0;
    };

    const updateProfile = () => {
        if (!validateProfile()) {
            toast.error("Please fix the highlighted fields.");
            return;
        }
        toast.success("Profile updated successfully");
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProfile((prev) => {
            if (prev.profileImage?.startsWith("blob:")) {
                URL.revokeObjectURL(prev.profileImage);
            }
            const url = URL.createObjectURL(file);
            return { ...prev, profileImage: url };
        });
        toast.success("Profile image updated");
        e.target.value = "";
    };

    const removeProfileImage = () => {
        setProfile((prev) => {
            if (prev.profileImage?.startsWith("blob:")) {
                URL.revokeObjectURL(prev.profileImage);
            }
            return { ...prev, profileImage: "" };
        });
        toast.success("Profile image removed");
    };

    const avatarSrc = profile.profileImage
        ? profile.profileImage
        : "https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=300&h=300";

    return (
        <div className="animate-fadeIn max-w-3xl">
            <h2 className="text-2xl font-black tracking-tight mb-6">Professional Profile</h2>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-8">
                {/* PROFILE IMAGE */}
                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-slate-50 shadow-lg">
                            <img className="w-full h-full object-cover" src={avatarSrc} alt="Avatar" />
                        </div>

                        <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg hover:scale-110 transition-all cursor-pointer">
                            <FaPlus className="text-xs" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>

                        {profile.profileImage && (
                            <button
                                type="button"
                                onClick={removeProfileImage}
                                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow hover:bg-red-600"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                    {/* PROFILE INFO */}
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-black text-slate-900">{profile.fullName}</h3>
                        <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">{profile.specialization}</p>
                        <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                            <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">{profile.qualification}</span>
                            <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">{profile.registrationId}</span>
                            <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">{profile.experience}+ Years Exp</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* DISPLAY NAME */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={profile.fullName}
                            onChange={handleNameChange}
                            className={`w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none ${fieldErrors.fullName ? "ring-2 ring-red-200 bg-red-50/50" : ""}`}
                        />
                        {fieldErrors.fullName && (
                            <p className="text-xs font-semibold text-red-500 px-1">{fieldErrors.fullName}</p>
                        )}
                    </div>

                    {/* Professional category is assigned — not editable */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Category</label>
                        <input
                            type="text"
                            name="specialization"
                            readOnly
                            tabIndex={-1}
                            value={profile.specialization || ""}
                            className="w-full p-3 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-sm font-bold cursor-not-allowed outline-none"
                            title="Professional category cannot be changed here"
                        />
                    </div>

                    {/* EXPERIENCE */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Experience (Years)</label>

                        <input
                            type="number"
                            name="experience"
                            min={0}
                            max={60}
                            step={1}
                            value={profile.experience === "" ? "" : profile.experience}
                            onChange={handleExperienceChange}
                            className={`w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold ${fieldErrors.experience ? "ring-2 ring-red-200 bg-red-50/50" : ""}`}
                        />
                        {fieldErrors.experience && (
                            <p className="text-xs font-semibold text-red-500 px-1">{fieldErrors.experience}</p>
                        )}
                    </div>

                    {/* BIO */}
                    <div className="md:col-span-2 space-y-2">
                        <div className="flex justify-between items-baseline px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Bio</label>
                            <span className="text-[10px] font-bold text-slate-400">
                                {(profile.about || "").length}/{MAX_BIO_LENGTH}
                            </span>
                        </div>
                        <textarea
                            rows={4}
                            name="about"
                            className={`w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none ${fieldErrors.about ? "ring-2 ring-red-200 bg-red-50/50" : ""}`}
                            value={profile.about || ""}
                            onChange={handleBioChange}
                            maxLength={MAX_BIO_LENGTH}
                        />
                        {fieldErrors.about && (
                            <p className="text-xs font-semibold text-red-500 px-1">{fieldErrors.about}</p>
                        )}
                    </div>
                </div>

                <button
                    onClick={updateProfile}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-[0.98]"
                >
                    Update Profile Details
                </button>
            </div>
        </div>
    );
}