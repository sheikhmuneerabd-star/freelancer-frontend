import React, { useEffect, useRef } from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import { userDataContext } from '../Context/UserContext';
import Nav from '../Components/Nav';
import { LayoutDashboard, Folder, MessageSquare, LogOut, Plus, CheckCircle, Clock, User, Settings } from 'lucide-react';
import axios from 'axios';
import { authDataContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function ClientDashboard() {
  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [stats, setStats] = useState([
    { label: 'Total Projects', count: 0 },
    { label: 'Active', count: 0 },
    { label: 'Pending Proposals', count: 0 },
    { label: 'Completed', count: 0 },
  ]);

  const [activeProjects, setActiveProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClDashboard = async () => {
    try {
      const res = await axios.get(serverUrl + "/api/client/dashboard", { withCredentials: true });

      const data = res.data;

      setStats([
        { label: 'Total Projects', count: data.stats.totalProjects },
        { label: 'Active', count: data.stats.activeCount },
        { label: 'Pending Proposals', count: data.stats.pendingProposalsCount },
        { label: 'Completed', count: data.stats.completedCount },
      ]);

      setActiveProjects(data.activeProjects);
      setProposals(data.recentProposals);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClDashboard();
  }, []);

  const handleAccept = async (proposalId) => {
    try {
      await axios.put(`${serverUrl}/api/client/proposals/${proposalId}/accept`, {}, { withCredentials: true });
      toast.success("Freelancer hire ho gaya!");
      fetchClDashboard();
    } catch (error) {
      toast.error("Kuch ghalat ho gaya");
    }
  }

  const handleReject = async (proposalId) => {
    try {
      await axios.put(`${serverUrl}/api/client/proposals/${proposalId}/reject`, {}, { withCredentials: true });
      toast.success("Proposal reject kar diya");
      fetchClDashboard();
    } catch (error) {
      toast.error("Kuch ghalat ho gaya");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0e15] text-slate-200 font-sans antialiased">

      <Nav />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">

        {/* Welcome Section */}
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-3xl font-semibold text-white tracking-tight break-words">
              Welcome back, {userData.name}
            </h1>
            <span className="bg-[#534ab730] border border-[#534AB7] text-[#a5b4fc] text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
              Client
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Aapke projects ka overview</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500 text-sm">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-[#131520] border border-slate-800/80 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition-all">
                  <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                    {stat.label}
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-slate-100">{stat.count}</span>
                </div>
              ))}
            </div>

            {/* Active Projects Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Aapke Active Projects</h2>
                <button
                  className="bg-indigo-600/90 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                  onClick={() => navigate("/client/post-project")}
                >
                  <Plus size={16} /> Naya Project Post Karo
                </button>
              </div>

              <div className="space-y-3">
                {activeProjects.length === 0 ? (
                  <p className="text-slate-500 text-sm">Koi active project nahi hai abhi</p>
                ) : (
                  activeProjects.map((project) => (
                    <div key={project._id} className="bg-[#131520] border border-slate-800/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-[#161926] transition-colors">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <h3 className="text-sm sm:text-base font-medium text-slate-100 break-words">{project.title}</h3>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border whitespace-nowrap ${
                            project.status === "open" 
                              ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                              : project.status === "in-progress"
                              ? "text-green-400 bg-green-500/10 border-green-500/20"
                              : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Deadline: {project.deadline} din
                        </p>
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-indigo-400 self-start sm:self-center whitespace-nowrap">
                        ${project.budgetMin} - ${project.budgetMax}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Proposals Section */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Recent Proposals</h2>

              <div className="space-y-3">
                {proposals.length === 0 ? (
                  <p className="text-slate-500 text-sm">Abhi koi proposal nahi aaya</p>
                ) : (
                  proposals.map((proposal) => (
                    <div key={proposal._id} className="bg-[#131520] border border-slate-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-sm tracking-wide shadow-inner flex-shrink-0">
                          {proposal.freelancerId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-slate-200 truncate">{proposal.freelancerId?.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            applied for <span className="text-slate-400">"{proposal.projectId?.title}"</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleAccept(proposal._id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 sm:flex-none"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(proposal._id)}
                          className="border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 sm:flex-none"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default ClientDashboard