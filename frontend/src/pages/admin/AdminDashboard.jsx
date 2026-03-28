import React, { useState } from 'react';
import {
  FiGrid, FiCalendar, FiUserCheck, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';

import EventManagement from "../../pages/admin/EventManagement";

import AdminOverview from '../../components/admin/AdminOverview';
import AllBookings from '../../components/admin/AllBookings';
import DoctorApprovals from '../../components/admin/DoctorApprovals';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Overview', icon: <FiGrid />, component: <AdminOverview /> },
    { name: 'All Bookings', icon: <FiCalendar />, component: <AllBookings /> },
    { name: 'Doctor Approvals', icon: <FiUserCheck />, component: <DoctorApprovals /> },
    { name: 'Event Management', icon: <FiCalendar />, component: <EventManagement /> },
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.name === activeTab);
    return activeItem ? activeItem.component : <AdminOverview />;
  };

  return (
    // ❌ removed overflow-hidden
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-r flex flex-col`}>
        
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-xl">
              <FiUserCheck />
            </div>
            {isSidebarOpen && <span className="font-bold">MindBridge Admin</span>}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ${
                activeTab === item.name
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button className="flex gap-2 text-red-500">
            <FiLogOut /> Logout
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 bg-white border rounded-full p-1"
        >
          {isSidebarOpen ? <FiX size={14} /> : <FiMenu size={14} />}
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="h-20 bg-white flex items-center px-8 border-b">
          <h1 className="font-bold text-lg">{activeTab}</h1>
        </header>

        {/* ✅ THIS FIX ENABLES SCROLL */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;