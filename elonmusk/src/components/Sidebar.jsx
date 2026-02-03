import React from "react";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaWallet,
  FaHistory,
  FaClipboardList,
  FaSignOutAlt,
  FaUser,
  FaTrophy,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/brandmark.svg";

const Sidebar = ({ isOpen, onClose }) => {
   const { logout, user } = useAuth();
  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 glass border-r border-white/10 z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <FaTimes size={20} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 mb-10">
            <img
              src={logo}
              alt="Company Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl font-display font-bold gradient-text">
              The Musk Foundation
            </span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <SidebarLink to="/dashboard" icon={<FaChartLine />} label="Dashboard" />
            <SidebarLink to="/investments" icon={<FaTrophy />} label="My Investments" />
            <SidebarLink to="/withdrawals" icon={<FaWallet />} label="Withdrawals" />
            <SidebarLink to="/transactions" icon={<FaHistory />} label="Transactions" />
            <SidebarLink to="/profile" icon={<FaUser />} label="Profile" />
            {user?.isAdmin && (
              <SidebarLink to="/admin" icon={<FaClipboardList />} label="Admin Dashboard" />
            )}
          </nav>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-3 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition border border-red-500/30"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const SidebarLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/5 rounded-xl font-medium transition"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Sidebar;
