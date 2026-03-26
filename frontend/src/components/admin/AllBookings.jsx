import React, { useState } from 'react';
import { FaEye, FaTimes } from 'react-icons/fa';

const AllBookings = () => {
    const [selectedCancellation, setSelectedCancellation] = useState(null);

    // Mock data
    const bookings = [
        { id: 'BK-1042', patient: 'John Doe', doctor: 'Dr. Sarah Smith', date: 'Mar 15, 2024', time: '10:00 AM', status: 'Confirmed', amount: '$150' },
        { id: 'BK-1043', patient: 'Jane Smith', doctor: 'Dr. Michael Chen', date: 'Mar 15, 2024', time: '11:30 AM', status: 'Pending', amount: '$200' },
        { id: 'BK-1044', patient: 'Robert Johnson', doctor: 'Dr. Emily Davis', date: 'Mar 16, 2024', time: '09:00 AM', status: 'Completed', amount: '$120' },
        {
            id: 'BK-1045',
            patient: 'Alice Williams',
            doctor: 'Dr. Sarah Smith',
            date: 'Mar 16, 2024',
            time: '02:00 PM',
            status: 'Cancelled',
            amount: '$150',
            cancelledBy: 'User',
            cancellationNote: 'I have an exam schedule conflict and cannot attend.',
        },
        {
            id: 'BK-1046',
            patient: 'David Brown',
            doctor: 'Dr. James Wilson',
            date: 'Mar 17, 2024',
            time: '10:15 AM',
            status: 'Cancelled',
            amount: '$180',
            cancelledBy: 'Counselor',
            cancellationNote: 'Emergency hospital duty, please rebook this session.',
        },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-blue-100 text-blue-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">All Bookings</h2>
                <div className="flex space-x-3">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
                        <option>All Status</option>
                        <option>Confirmed</option>
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                    <input
                        type="date"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                            <th className="px-6 py-4 font-medium">Booking ID</th>
                            <th className="px-6 py-4 font-medium">Patient</th>
                            <th className="px-6 py-4 font-medium">Doctor</th>
                            <th className="px-6 py-4 font-medium">Date & Time</th>
                            <th className="px-6 py-4 font-medium">Amount</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{booking.id}</td>
                                <td className="px-6 py-4 text-gray-700">{booking.patient}</td>
                                <td className="px-6 py-4 text-gray-700">{booking.doctor}</td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-800">{booking.date}</div>
                                    <div className="text-sm text-gray-500">{booking.time}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-700">{booking.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <div className="inline-flex items-center gap-3">
                                        <button className="text-blue-600 hover:text-blue-900">View Details</button>
                                        {booking.status === 'Cancelled' && (
                                            <button
                                                onClick={() => setSelectedCancellation(booking)}
                                                className="text-red-500 hover:text-red-700"
                                                title="View cancellation note"
                                            >
                                                <FaEye />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedCancellation && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Cancellation Note</h3>
                            <button
                                onClick={() => setSelectedCancellation(null)}
                                className="text-gray-400 hover:text-gray-600"
                                title="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            Cancelled By
                        </p>
                        <p className="text-sm font-bold text-gray-800 mb-4">
                            {selectedCancellation.cancelledBy || 'N/A'}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            Note
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3 whitespace-pre-wrap">
                            {selectedCancellation.cancellationNote || 'No cancellation note provided.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllBookings;
