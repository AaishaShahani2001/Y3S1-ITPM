import React from 'react';

const AdminOverview = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Total Users</p>
                    <h3 className="text-3xl font-bold text-blue-900 mt-2">1,245</h3>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <p className="text-green-600 text-sm font-semibold uppercase tracking-wider">Total Bookings</p>
                    <h3 className="text-3xl font-bold text-green-900 mt-2">856</h3>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <p className="text-purple-600 text-sm font-semibold uppercase tracking-wider">Active Doctors</p>
                    <h3 className="text-3xl font-bold text-purple-900 mt-2">142</h3>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                    <p className="text-orange-600 text-sm font-semibold uppercase tracking-wider">Pending Approvals</p>
                    <h3 className="text-3xl font-bold text-orange-900 mt-2">24</h3>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
                <p className="text-gray-500 text-sm">Activity charts and graphs will be displayed here.</p>
            </div>
        </div>
    );
};

export default AdminOverview;
