import React, { useEffect, useState } from 'react';
import { FaEye, FaTimes } from 'react-icons/fa';

const DoctorApprovals = () => {

    // Store applications from backend
    const [requests, setRequests] = useState([]);

    // View Details Modal State
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get logged user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // ===============================
    // LOAD COUNSELLOR APPLICATIONS
    // ===============================
    const loadApplications = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/admin/applications", {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            const data = await res.json();

            setRequests(data);

        } catch (error) {
            console.error("Failed to load applications", error);
        }
    };

    // Load when page opens
    useEffect(() => {
        loadApplications();
    }, []);


    // ===============================
    // APPROVE DOCTOR
    // ===============================
    const approve = async (id) => {
        try {
            await fetch(`http://localhost:3000/api/admin/applications/${id}/approve`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            // reload data
            loadApplications();

            // if modal is open for this doctor, close it or update it
            if (selectedDoctor && selectedDoctor.id === id) {
                setIsModalOpen(false);
            }

        } catch (error) {
            console.error("Approve failed", error);
        }
    };


    // ===============================
    // REJECT DOCTOR
    // ===============================
    const reject = async (id) => {

        try {
            await fetch(`http://localhost:3000/api/admin/applications/${id}/reject`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            // reload data
            loadApplications();

            // if modal is open for this doctor, close it or update it
            if (selectedDoctor && selectedDoctor.id === id) {
                setIsModalOpen(false);
            }

        } catch (error) {
            console.error("Reject failed", error);
        }
    };

    // ===============================
    // VIEW DOCTOR DETAILS
    // ===============================
    const viewDetails = (doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDoctor(null);
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Doctor Approvals</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                            <th className="px-6 py-4 font-medium">Request ID</th>
                            <th className="px-6 py-4 font-medium">Doctor Name</th>
                            <th className="px-6 py-4 font-medium">Specialization</th>
                            <th className="px-6 py-4 font-medium">Experience</th>
                            <th className="px-6 py-4 font-medium">Date Applied</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">

                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">

                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {req.id}
                                </td>

                                <td className="px-6 py-4 text-gray-700 font-medium">
                                    {req.fullName}
                                </td>

                                <td className="px-6 py-4 text-gray-700">
                                    {req.specialization}
                                </td>

                                <td className="px-6 py-4 text-gray-700">
                                    {req.experience} Years
                                </td>

                                <td className="px-6 py-4 text-gray-700">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${req.status === "approved"
                                                ? "bg-green-100 text-green-800"
                                                : req.status === "rejected"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-yellow-100 text-yellow-800"}`}
                                    >
                                        {req.status}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center space-x-3">
                                        <button
                                            onClick={() => viewDetails(req)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50"
                                            title="View Details"
                                        >
                                            <FaEye size={18} />
                                        </button>

                                        {req.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => approve(req.id)}
                                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => reject(req.id)}
                                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>

                            </tr>
                        ))}

                        {requests.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No pending doctor approval requests.
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {isModalOpen && selectedDoctor && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm sm:p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Application Information</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Request ID: #{selectedDoctor.id} &bull; Applied: {new Date(selectedDoctor.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 text-gray-400 transition-colors bg-white border border-gray-200 rounded-full hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Close"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="flex-1 px-8 py-6 overflow-y-auto">

                            {/* Doctor Header card */}
                            <div className="flex flex-col items-start justify-between pb-6 mb-8 border-b border-gray-100 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">{selectedDoctor.fullName}</h2>
                                    <p className="mt-1 text-lg font-medium text-blue-600">{selectedDoctor.specialization}</p>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <span
                                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm border
                                            ${selectedDoctor.status === "approved"
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : selectedDoctor.status === "rejected"
                                                    ? "bg-red-50 text-red-700 border-red-200"
                                                    : "bg-amber-50 text-amber-700 border-amber-200"}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full mr-2 ${selectedDoctor.status === 'approved' ? 'bg-green-500' : selectedDoctor.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                        {selectedDoctor.status.charAt(0).toUpperCase() + selectedDoctor.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

                                {/* Info Cards Column */}
                                <div className="space-y-6">
                                    {/* Contact Section */}
                                    <div className="p-5 border border-gray-100 bg-white rounded-xl shadow-sm">
                                        <h4 className="flex items-center mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            <span className="flex items-center justify-center w-8 h-8 mr-3 text-blue-600 bg-blue-50 rounded-lg">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            </span>
                                            Contact Details
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-gray-50 py-2.5 px-4 rounded-lg">
                                                <p className="text-xs font-semibold text-gray-500">Email</p>
                                                <p className="font-medium text-gray-900">{selectedDoctor.email}</p>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-50 py-2.5 px-4 rounded-lg">
                                                <p className="text-xs font-semibold text-gray-500">Phone</p>
                                                <p className="font-medium text-gray-900">{selectedDoctor.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Section */}
                                    <div className="p-5 border border-gray-100 bg-white rounded-xl shadow-sm">
                                        <h4 className="flex items-center mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            <span className="flex items-center justify-center w-8 h-8 mr-3 text-purple-600 bg-purple-50 rounded-lg">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                            </span>
                                            Professional Data
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-gray-50 py-2.5 px-4 rounded-lg">
                                                <p className="text-xs font-semibold text-gray-500">Experience</p>
                                                <p className="font-medium text-gray-900">{selectedDoctor.experience} Years</p>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-50 py-2.5 px-4 rounded-lg">
                                                <p className="text-xs font-semibold text-gray-500">Registration ID</p>
                                                <p className="font-medium text-gray-900">{selectedDoctor.registrationId}</p>
                                            </div>
                                            <div className="flex justify-between items-start bg-gray-50 py-2.5 px-4 rounded-lg">
                                                <p className="text-xs font-semibold text-gray-500 mt-0.5">Workplace</p>
                                                <p className="font-medium text-gray-900 text-right max-w-[60%]">{selectedDoctor.workplace}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6 flex flex-col h-full">
                                    {/* Education block */}
                                    <div>
                                        <h4 className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">Education</h4>
                                        <div className="inline-block px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                                            <p className="font-semibold text-gray-900">{selectedDoctor.qualification}</p>
                                        </div>
                                    </div>

                                    {/* About block */}
                                    <div className="flex-1 flex flex-col">
                                        <h4 className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">Biography & About</h4>
                                        <div className="flex-1 p-5 border border-gray-100 rounded-xl bg-gray-50">
                                            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                                {selectedDoctor.about || <span className="italic text-gray-400">No biography provided.</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Uploaded Documents (Full Width) */}
                                <div className="md:col-span-2 pt-4 border-t border-gray-100">
                                    <h4 className="flex items-center mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        <span className="flex items-center justify-center w-8 h-8 mr-3 text-indigo-600 bg-indigo-50 rounded-lg">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                        </span>
                                        Verification Documents
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedDoctor.nicFile ? (
                                            <a
                                                href={`http://localhost:3000/${selectedDoctor.nicFile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center p-4 transition-all bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md group"
                                            >
                                                <div className="flex items-center justify-center w-12 h-12 mr-4 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                                </div>
                                                <div>
                                                    <span className="block font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Identity Document</span>
                                                    <span className="text-xs text-gray-500">View NIC / Passport</span>
                                                </div>
                                            </a>
                                        ) : (
                                            <div className="flex items-center p-4 bg-gray-50 border border-gray-200 border-dashed  rounded-xl">
                                                <div className="flex items-center justify-center w-12 h-12 mr-4 bg-white rounded-lg opacity-50">
                                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-400">No Identity Document</span>
                                            </div>
                                        )}

                                        {selectedDoctor.certificateFile ? (
                                            <a
                                                href={`http://localhost:3000/${selectedDoctor.certificateFile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center p-4 transition-all bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md group"
                                            >
                                                <div className="flex items-center justify-center w-12 h-12 mr-4 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                </div>
                                                <div>
                                                    <span className="block font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Medical Certificate</span>
                                                    <span className="text-xs text-gray-500">View Registration Doc</span>
                                                </div>
                                            </a>
                                        ) : (
                                            <div className="flex items-center p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                                                <div className="flex items-center justify-center w-12 h-12 mr-4 bg-white rounded-lg opacity-50">
                                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-400">No Certificate</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer (Actions) */}
                        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4">
                            {selectedDoctor.status === "pending" ? (
                                <>
                                    <button
                                        onClick={() => reject(selectedDoctor.id)}
                                        className="w-full sm:w-auto px-6 py-2.5 mt-3 sm:mt-0 font-semibold text-red-600 transition-colors bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-700"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => approve(selectedDoctor.id)}
                                        className="w-full sm:w-auto px-6 py-2.5 font-semibold text-white transition-all shadow-md bg-green-600 hover:bg-green-700 rounded-lg hover:shadow-lg transform active:scale-[0.98]"
                                    >
                                        Approve Doctor
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={closeModal}
                                    className="w-full sm:w-auto px-6 py-2.5 mt-3 sm:mt-0 font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                                >
                                    Close Window
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorApprovals;