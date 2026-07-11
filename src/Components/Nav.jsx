import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { userDataContext } from "../Context/UserContext";
import { authDataContext } from "../Context/AuthContext";
import { socketDataContext } from "../Context/SocketContext";
import { LogOut, User, Settings, Menu, X } from "lucide-react";
import { TbBriefcase, TbBell, TbEye, TbTrash, TbCheck, TbInbox } from "react-icons/tb";
import axios from "axios";
import toast from "react-hot-toast";

function Nav() {
  const { userData, setUserData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { socket } = useContext(socketDataContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    }
  }, [userData]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = ({ notification, unreadCount: newCount }) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount(newCount);
      toast(notification.text, { icon: "🔔" });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowNotifDropdown(!showNotifDropdown);
  };

  const handleNotifClick = async (notif) => {
    setShowNotifDropdown(false);

    if (!notif.read) {
      try {
        await axios.put(`${serverUrl}/api/notifications/${notif._id}/read`, {}, { withCredentials: true });
        setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.log(error);
      }
    }

    navigate(notif.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${serverUrl}/api/notifications/mark-read`, {}, { withCredentials: true });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteNotif = async (e, notifId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${serverUrl}/api/notifications/${notifId}`, { withCredentials: true });
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === notifId);
        if (target && !target.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== notifId);
      });
    } catch (error) {
      toast.error("Delete nahi ho saka");
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${serverUrl}/api/notifications`, { withCredentials: true });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      toast.error("Clear nahi ho saka");
    }
  };

  const notifIconStyle = (type) => {
    const styles = {
      proposal: { bg: "bg-blue-500/15", text: "text-blue-400" },
      accepted: { bg: "bg-green-500/15", text: "text-green-400" },
      rejected: { bg: "bg-red-500/15", text: "text-red-400" },
      message: { bg: "bg-violet-500/15", text: "text-violet-400" },
      task: { bg: "bg-amber-500/15", text: "text-amber-400" },
      review: { bg: "bg-yellow-500/15", text: "text-yellow-400" },
    };
    return styles[type] || { bg: "bg-slate-500/15", text: "text-slate-400" };
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
    <header className="border-b border-slate-800 bg-[#0f111a] px-4 sm:px-6 py-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-2 text-violet-400 font-bold text-xl sm:text-2xl tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-2xl sm:text-3xl">🗲</span>
          <span className="hidden sm:inline">FreelancerHub</span>
          <span className="sm:hidden">FH</span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
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

        {/* Right side group */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Notification Bell */}
          {userData && (
            <div className="relative" ref={notifRef}>
              <div
                className="relative cursor-pointer"
                onClick={handleBellClick}
              >
                <TbBell className="text-gray-400 text-[20px] sm:text-[22px] hover:text-gray-200 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-medium w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#131520] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-4 py-3.5 border-b border-slate-800/60 flex items-center justify-between bg-[#161926]">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="bg-[#534AB7] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-[#a5b4fc] hover:text-white font-medium transition-colors"
                          >
                            Sab read karo
                          </button>
                        )}
                        <button
                          onClick={handleClearAll}
                          className="text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>

                  {/* List */}
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <TbInbox className="text-slate-700 text-4xl mb-2" />
                      <p className="text-gray-500 text-sm">Koi notification nahi hai</p>
                    </div>
                  ) : (
                    <div className="notif-scroll max-h-[400px] overflow-y-auto">
                      {notifications.map((notif) => {
                        const iconStyle = notifIconStyle(notif.type);
                        return (
                          <div
                            key={notif._id}
                            onClick={() => handleNotifClick(notif)}
                            className={`group px-4 py-3 border-b border-slate-800/40 last:border-b-0 cursor-pointer hover:bg-slate-800/40 transition-colors flex items-start gap-3 ${
                              !notif.read ? "bg-[#534ab712]" : ""
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full ${iconStyle.bg} ${iconStyle.text} flex items-center justify-center flex-shrink-0 mt-0.5 text-[13px] font-semibold uppercase`}>
                              {notif.type.charAt(0)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className={`text-[13px] leading-snug ${!notif.read ? "text-gray-100 font-medium" : "text-gray-400"}`}>
                                {notif.text}
                              </p>
                              <p className="text-[11px] text-gray-600 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-[#534AB7] mt-1.5"></span>
                              )}
                              <TbTrash
                                className="text-gray-600 hover:text-red-400 text-[14px] opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleDeleteNotif(e, notif._id)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profile Dropdown - desktop only */}
          {userData ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-all focus:outline-none border border-transparent hover:border-slate-700"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#131520] border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
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

                    {userData.role === "freelancer" && (
                      <button
                        onClick={() => {
                          navigate(`/freelancer/${userData._id}/profile`);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors text-left"
                      >
                        <TbEye size={14} /> My Public Profile
                      </button>
                    )}

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
              className="hidden sm:block bg-[#534AB7] hover:bg-[#4840a0] text-gray-100 text-sm font-medium px-5 py-2 rounded-md transition-colors"
            >
              Login
            </button>
          )}

          {/* Hamburger */}
          <button
            className="lg:hidden text-slate-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-4 pb-2 flex flex-col gap-1 border-t border-slate-800 pt-3 max-w-7xl mx-auto">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setIsMobileMenuOpen(false);
              }}
              className={`text-left px-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "text-violet-400 bg-violet-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              {link.label}
            </button>
          ))}

          {userData ? (
            <>
              <button
                onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }}
                className="text-left px-2 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 flex items-center gap-2"
              >
                <User size={16} /> My Profile
              </button>

              {userData.role === "freelancer" && (
                <button
                  onClick={() => { navigate(`/freelancer/${userData._id}/profile`); setIsMobileMenuOpen(false); }}
                  className="text-left px-2 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 flex items-center gap-2"
                >
                  <TbEye size={16} /> My Public Profile
                </button>
              )}

              <button
                onClick={handleLogout}
                className="text-left px-2 py-2.5 rounded-md text-sm font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => { navigate("/auth/login"); setIsMobileMenuOpen(false); }}
              className="text-left px-2 py-2.5 rounded-md text-sm font-medium bg-[#534AB7] text-white"
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Nav;