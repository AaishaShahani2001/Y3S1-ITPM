import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ProfileTab() {

    // STATE TO STORE PROFILE DATA
    const [profile, setProfile] = useState(null);
    // Logged user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // LOAD PROFILE FROM BACKEND
    const loadProfile = async () => {

        try {

            const res = await fetch(
                `http://localhost:3000/api/counsellor/profile/${user.id}`
            );

            const data = await res.json();

            setProfile(data);

        } catch (err) {
            console.error("Failed to load profile", err);
        }
    };

    // run when component loads
    useEffect(() => {
        loadProfile();
    }, []);


    // HANDLE INPUT CHANGES
    // Updates profile state when user edits fields
    const handleChange = (e) => {

        const { name, value } = e.target;

        if (name === "specialization") return;

        setProfile({
            ...profile,
            [name]: value
        });
    };

    // UPDATE PROFILE FUNCTION
    // Sends updated profile data to backend
    const updateProfile = async () => {

        try {

            const res = await fetch(
                `http://localhost:3000/api/counsellor/profile/${user.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fullName: profile.fullName,
                        specialization: profile.specialization,
                        qualification: profile.qualification,
                        experience: Number(profile.experience),
                        registrationID: profile.registrationId,
                        workplace: profile.workplace,
                        about: profile.about
                    })
                }
            );

            const data = await res.json();

            toast.success("Profile updated successfully");

            // reload profile after update
            loadProfile();

        } catch (err) {
            console.error("Update failed", err);
        }
    };

    // HANDLE PROFILE IMAGE UPLOAD
    const handleImageChange = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("profileImage", file);

            const res = await fetch(
                `http://localhost:3000/api/counsellor/profile-image/${user.id}`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to upload image");
                return;
            }

            setProfile((prev) => ({
                ...prev,
                profileImage: data.profileImage
            }));

            toast.success("Profile image updated");
        } catch (err) {
            console.error("Image upload failed", err);
            toast.error("Image upload failed");
        }
    };

    // REMOVE PROFILE IMAGE
    const removeProfileImage = async () => {
        try {
            const res = await fetch(
                `http://localhost:3000/api/counsellor/profile-image/${user.id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to remove image");
                return;
            }

            setProfile((prev) => ({
                ...prev,
                profileImage: ""
            }));

            toast.success("Profile image removed");
        } catch (err) {
            console.error("Remove image failed", err);
            toast.error("Remove image failed");
        }
    };


    if (!profile) return <p>Loading profile...</p>;

    return (
        <div className="animate-fadeIn max-w-3xl">
            <h2 className="text-2xl font-black tracking-tight mb-6">Professional Profile</h2>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-8">
                {/* PROFILE IMAGE */}
                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-slate-50 shadow-lg">
                            <img
                                className="w-full h-full object-cover"
                                src={
                                    profile.profileImage
                                        ? `http://localhost:3000/${profile.profileImage}`
                                        : "https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=300&h=300"
                                }
                                alt="Avatar"
                            />
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
                        <input type="text"
                            name="fullName"
                            value={profile.fullName}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                    </div>

                    {/* SPECIALIZATION — set at registration / admin; not editable here */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Category</label>
                        <input
                            type="text"
                            name="specialization"
                            value={profile.specialization || ""}
                            readOnly
                            aria-readonly="true"
                            className="w-full p-3 bg-slate-100 border border-slate-200/80 rounded-xl text-sm font-bold text-slate-700 cursor-default outline-none"
                        />
                    </div>

                    {/* EXPERIENCE */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                            Experience (Years)
                        </label>

                        <input
                            type="number"
                            name="experience"
                            value={profile.experience || ""}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold"
                        />
                    </div>

                    {/* BIO */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Bio</label>
                        <textarea
                            rows={4}
                            name="about"
                            className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                            value={profile.about || ""}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* ================================
                    UPDATE BUTTON
                ================================= */}
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