import React, { useState } from 'react';
import {
  FiGrid, FiCalendar, FiUserCheck, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';

import EventManagement from "../../pages/admin/EventManagement";
import AssignLocation from '../../components/admin/AssignLocation';
import AdminOverview from '../../components/admin/AdminOverview';
import AllBookings from '../../components/admin/AllBookings';
import DoctorApprovals from '../../components/admin/DoctorApprovals';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/auth";
  };

  const menuItems = [
    { name: 'Overview', icon: <FiGrid />, component: <AdminOverview /> },
    { name: 'All Bookings', icon: <FiCalendar />, component: <AllBookings /> },
    { name: 'Doctor Approvals', icon: <FiUserCheck />, component: <DoctorApprovals /> },
    { name: 'Assign Locations', icon: <FiUserCheck />, component: <AssignLocation /> },
    { name: 'Event Management', icon: <FiCalendar />, component: <EventManagement /> },
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.name === activeTab);
    return activeItem ? activeItem.component : <AdminOverview />;
  };

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-[#f8fafc] font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside
        className={`relative shrink-0 border-r border-[#e8dcc3] bg-[#fff9ee] text-slate-800 shadow-sm transition-[width] duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72' : 'w-20'
        } flex flex-col`}
      >
        
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl">
              <FiUserCheck />
            </div>
            {isSidebarOpen && <span className="font-bold text-slate-900">MindBridge Admin</span>}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ${
                activeTab === item.name
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-[#f3e8cf] hover:text-slate-900'
              }`}
            >
              {item.icon}
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-[#e8dcc3] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 ${
              !isSidebarOpen ? 'justify-center' : ''
            }`}
          >
            <FiLogOut className="text-lg shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>

        <button
          type="button"
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-[#e8dcc3] bg-[#fff9ee] text-slate-500 shadow-sm transition-colors hover:border-blue-400 hover:text-blue-500"
        >
          {isSidebarOpen ? <FiX size={14} /> : <FiMenu size={14} />}
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}
        <header className="flex h-20 shrink-0 items-center border-b border-slate-200 bg-white px-6 md:px-8">
          <h1 className="text-lg font-bold text-slate-800">{activeTab}</h1>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-smooth p-6 md:p-8">
          <div className="mx-auto w-full max-w-7xl pb-10">{renderContent()}</div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;