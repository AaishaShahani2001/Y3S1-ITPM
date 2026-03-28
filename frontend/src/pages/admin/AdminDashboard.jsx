import React, { useState } from 'react';
import {
  FiGrid, FiCalendar, FiUserCheck, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';

import AdminOverview from '../../components/admin/AdminOverview';
// import ManageBookings from '../../components/admin/ManageBookings';
import AllBookings from '../../components/admin/AllBookings';
// import AllUsers from '../../components/admin/AllUsers';
import DoctorApprovals from '../../components/admin/DoctorApprovals';
// import AddGuidancePrograms from '../../components/admin/AddGuidencePrograms';
// import AdminProfile from '../../components/admin/AdminProfile';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Overview', icon: <FiGrid />, component: <AdminOverview /> },
    // { name: 'Manage Bookings', icon: <FiActivity />, component: <ManageBookings /> },
    { name: 'All Bookings', icon: <FiCalendar />, component: <AllBookings /> },
    // { name: 'All Users', icon: <FiUsers />, component: <AllUsers /> },
    { name: 'Doctor Approvals', icon: <FiUserCheck />, component: <DoctorApprovals /> },
    // { name: 'Add Guidance', icon: <FiPlusSquare />, component: <AddGuidancePrograms /> },
    // { name: 'Profile', icon: <FiUser />, component: <AdminProfile /> },
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.name === activeTab);
    return activeItem ? activeItem.component : <AdminOverview />;
  };

  return (
    <div className="flex h-screen min-h-0 w-full bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-20'
          } shrink-0 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col z-30 shadow-sm relative`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
              <FiUserCheck size={22} />
            </div>
            {isSidebarOpen && (
              <span className="font-extrabold text-xl tracking-tight text-slate-800 whitespace-nowrap">
                MindBridge <span className="text-indigo-600">Admin</span>
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.name
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`}
            >
              <span className={`text-xl ${activeTab === item.name ? 'text-white' : 'group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </span>
              {isSidebarOpen && (
                <span className="font-semibold text-sm tracking-wide">{item.name}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-50">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors font-semibold text-sm ${!isSidebarOpen && 'justify-center'}`}
          >
            <FiLogOut className="text-xl" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all z-40"
        >
          {isSidebarOpen ? <FiX size={14} /> : <FiMenu size={14} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-20 sticky top-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">{activeTab}</h1>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-400 font-medium">Dashboard Overview</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800 leading-none">Admin User</span>
              <span className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">Super Administrator</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 p-0.5 shadow-inner">
              <img
                src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff"
                alt="Admin"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-[#f8fafc]">
          <div className="max-w-350 mx-auto pb-10">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
