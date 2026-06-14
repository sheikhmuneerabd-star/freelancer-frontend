import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { userDataContext } from "../Context/UserContext";
import { authDataContext } from "../Context/AuthContext";
import { LogOut, User, Settings } from "lucide-react";
import { TbBriefcase } from "react-icons/tb";
import { TbBell } from "react-icons/tb";
import axios from "axios";
import toast from "react-hot-toast";

function Nav() {
  const { userData, setUserData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/notifications`, { withCredentials: true });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // har 15 sec refresh
      return () => clearInterval(interval);
    }
  }, [userData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    setShowNotifDropdown(!showNotifDropdown);
    
    // Dropdown khulte hi "read" mark karo
    if (!showNotifDropdown && unreadCount > 0) {
      try {
        await axios.put(`${serverUrl}/api/notifications/mark-read`, {}, { withCredentials: true });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleNotifClick = (link) => {
    setShowNotifDropdown(false);
    navigate(link);
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      toast.success("Logout ho gaya");
      navigate("/auth/login");
    } catch (error) {
      console.log(error);
    }
  };

  // Role ke hisaab se links
  const links = userData?.role === "client"
    ? [
        { label: "Dashboard", path: "/client/dashboard" },
        { label: "Post Project", path: "/client/post-project" },
        { label: "My Projects", path: "/client/projects" },
        { label: "Chat", path: "/client/chat" },
      ]
    : userData?.role === "freelancer"
    ? [
        { label: "Dashboard", path: "/freelancer/dashboard" },
        { label: "Browse Projects", path: "/freelancer/projects" },
        { label: "Chat", path: "/freelancer/chat" },
      ]
    : [];

  return (
    <header className="border-b border-slate-800 bg-[#0f111a] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-2 text-violet-400 font-bold text-2xl tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-3xl">🗲</span>
          FreelancerHub
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-8 text-sm font-medium text-slate-400">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={
                location.pathname === link.path
                  ? "text-violet-400 border-b-2 border-violet-500 pb-1"
                  : "hover:text-slate-200 transition-colors"
              }
            >
              {link.label}
            </button>
          ))}
        </nav>

        {userData && (
          <div className="relative" ref={notifRef}>
            <div 
              className="relative cursor-pointer"
              onClick={handleBellClick}
            >
              <TbBell className="text-gray-400 text-[22px] hover:text-gray-200 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-medium w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-[#131520] border border-slate-800 rounded-xl shadow-2xl py-2 z-50 max-h-[400px] overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-800/60">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">Koi notification nahi hai</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotifClick(notif.link)}
                      className={`px-4 py-3 border-b border-slate-800/40 cursor-pointer hover:bg-slate-800/40 transition-colors ${
                        !notif.read ? "bg-[#534ab715]" : ""
                      }`}
                    >
                      <p className="text-[13px] text-gray-200">{notif.text}</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Profile Dropdown */}
        {userData ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-all focus:outline-none border border-transparent hover:border-slate-700"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {userData.name.charAt(0).toUpperCase()}
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#131520] border border-slate-800 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
                <div className="px-4 py-3 border-b border-slate-800/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-base">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">{userData.name}</span>
                    <span className="text-xs text-slate-500 truncate">{userData.email}</span>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button 
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors text-left"
                  >
                    <User size={14} /> My Profile
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors text-left">
                    <Settings size={14} /> Settings
                  </button>
                </div>

                <div className="p-1.5 border-t border-slate-800/60 mt-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth/login")}
            className="bg-[#534AB7] hover:bg-[#4840a0] text-gray-100 text-sm font-medium px-5 py-2 rounded-md transition-colors"
          >
            Login
          </button>
        )}

      </div>
    </header>
  );
}

export default Nav;