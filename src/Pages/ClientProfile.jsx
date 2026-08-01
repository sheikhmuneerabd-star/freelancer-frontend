import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import Nav from "../Components/Nav";
import {
  TbBriefcase, TbCalendar, TbShieldCheck, TbArrowLeft,
  TbUserCheck, TbCurrencyDollar, TbChecklist
} from "react-icons/tb";

function ClientProfile() {
  const { clientId } = useParams();
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await axios.get(
          `${serverUrl}/api/client/${clientId}/profile`,
          { withCredentials: true }
        );
        setData(res.data);
      } catch (err) {
        console.log(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [clientId]);

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen text-gray-800 dark:text-gray-200 transition-colors">
        <Nav />
        <div className="max-w-4xl mx-auto px-6 pt-10 animate-pulse">
          <div className="h-24 bg-white dark:bg-[#ffffff08] border border-gray-200 dark:border-transparent rounded-xl mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white dark:bg-[#ffffff08] border border-gray-200 dark:border-transparent rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen text-gray-800 dark:text-gray-200 transition-colors">
        <Nav />
        <div className="max-w-4xl mx-auto px-6 pt-20 text-center">
          <p className="text-gray-500 dark:text-gray-400">Ye profile nahi mil saki.</p>
          <button onClick={() => navigate(-1)} className="text-[#534AB7] dark:text-[#a5b4fc] text-sm mt-3">
            ← Wapas jao
          </button>
        </div>
      </div>
    );
  }

  const { client, stats } = data;

  const trustColor =
    stats.trustScore >= 80 ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20" :
    stats.trustScore >= 50 ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" :
    "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";

  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen pb-12 text-gray-800 dark:text-gray-200 transition-colors">
      <Nav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 text-sm mb-5 transition-colors"
        >
          <TbArrowLeft /> Wapas
        </button>

        <div className="bg-white dark:bg-[#ffffff08] border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 flex flex-col sm:flex-row gap-5 sm:items-center shadow-sm dark:shadow-none">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-3xl flex-shrink-0">
            {client.name?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{client.name}</h1>
              <span className="bg-[#534ab715] dark:bg-[#534ab730] border border-[#534AB7] text-[#534AB7] dark:text-[#a5b4fc] text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                Client
              </span>
              <span className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${trustColor}`}>
                <TbShieldCheck /> Trust Score: {stats.trustScore}%
              </span>
            </div>

            {client.bio && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">{client.bio}</p>
            )}

            <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-2">
              <TbCalendar />
              Member since {new Date(stats.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-[#ffffff08] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm dark:shadow-none">
            <p className="text-[11px] text-gray-500 mb-1 flex items-center gap-1"><TbBriefcase /> Total Posted</p>
            <p className="text-[20px] font-medium text-gray-900 dark:text-gray-50">{stats.totalProjects}</p>
          </div>
          <div className="bg-white dark:bg-[#ffffff08] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm dark:shadow-none">
            <p className="text-[11px] text-gray-500 mb-1 flex items-center gap-1"><TbChecklist /> Completed</p>
            <p className="text-[20px] font-medium text-gray-900 dark:text-gray-50">{stats.completedProjects}</p>
          </div>
          <div className="bg-white dark:bg-[#ffffff08] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm dark:shadow-none">
            <p className="text-[11px] text-gray-500 mb-1 flex items-center gap-1"><TbUserCheck /> Hire Rate</p>
            <p className="text-[20px] font-medium text-gray-900 dark:text-gray-50">{stats.hireRate}%</p>
          </div>
          <div className="bg-white dark:bg-[#ffffff08] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm dark:shadow-none">
            <p className="text-[11px] text-gray-500 mb-1">Active Now</p>
            <p className="text-[20px] font-medium text-gray-900 dark:text-gray-50">{stats.activeProjects}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#ffffff08] border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6 shadow-sm dark:shadow-none">
          <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <TbCurrencyDollar /> Spending Overview
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-gray-500 mb-1">Total Spent (completed)</p>
              <p className="text-[18px] font-medium text-[#534AB7] dark:text-[#a5b4fc]">${stats.totalSpent}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-1">Avg Project Budget</p>
              <p className="text-[18px] font-medium text-[#534AB7] dark:text-[#a5b4fc]">${stats.avgBudget}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#ffffff08] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm dark:shadow-none">
          <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-2">Completion Rate</p>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-2">
            <div
              className="bg-[#534AB7] h-2 rounded-full transition-all"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-xs">
            {stats.completionRate}% projects successfully complete hue hain
          </p>
        </div>

      </div>
    </div>
  );
}

export default ClientProfile;