import { useState, useEffect, useContext, useRef, useCallback } from "react";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";
import { socketDataContext } from "../Context/SocketContext";
import { TbCurrencyDollar, TbBriefcase, TbChecklist, TbSend } from "react-icons/tb";
import Nav from "../Components/Nav";
import toast from "react-hot-toast";

function FreelancerDashboard() {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);
  const { socket } = useContext(socketDataContext);

  const [stats, setStats] = useState({ earnings: 0, activeCount: 0, pendingTasksCount: 0, proposalsCount: 0 });
  const [activeProjects, setActiveProjects] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  const debounceRef = useRef(null);

  const fetchDashboard = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/freelancer/freelancerDashboard`, { withCredentials: true });
      setStats(res.data.stats);
      setActiveProjects(res.data.activeProjects);
      setMyProposals(res.data.myProposals);
      setTasks(res.data.tasks);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDashboard(false);
    }, 300);
  }, [serverUrl]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleDashboardRefresh = (payload) => {
      debouncedRefresh();

      const messages = {
        project_completed: `"${payload.projectTitle}" complete ho gaya! Earnings update ho gayi 💰`,
        review_received: "Aapko nayi review mili! ⭐",
        proposal_accepted: "Aapka proposal accept ho gaya! 🎉",
        proposal_rejected: "Ek proposal reject hua",
        task_added: "Naya task assign hua",
      };
      if (messages[payload.reason]) {
        toast.success(messages[payload.reason]);
      }
    };

    const handleNewTask = (newTask) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === newTask._id)) return prev;
        return [...prev, newTask];
      });
    };

    socket.on("dashboard:refresh", handleDashboardRefresh);
    socket.on("task:new", handleNewTask);

    return () => {
      socket.off("dashboard:refresh", handleDashboardRefresh);
      socket.off("task:new", handleNewTask);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [socket, debouncedRefresh]);

  const handleCompleteTask = async (taskId) => {
    try {
      await axios.put(`${serverUrl}/api/tasks/${taskId}/complete`, {}, { withCredentials: true });
      toast.success("Task complete mark ho gaya!");
      fetchDashboard();
    } catch (error) {
      toast.error("Kuch ghalat ho gaya");
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen pb-8 text-gray-200">
      <Nav />

      <div className="max-w-7xl mx-auto px-6 pt-10">

        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-medium text-gray-50">Welcome back, {userData?.name}</h1>
          <span className="bg-[#534ab730] border border-[#534AB7] text-[#a5b4fc] text-[11px] font-medium px-3 py-1 rounded-full">
            Freelancer
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-6">Aapke kaam ka overview</p>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4">
                <p className="text-[12px] text-gray-500 mb-1 flex items-center gap-1"><TbCurrencyDollar /> Earnings</p>
                <p className="text-[22px] font-medium text-gray-50">${stats.earnings}</p>
              </div>
              <div className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4">
                <p className="text-[12px] text-gray-500 mb-1 flex items-center gap-1"><TbBriefcase /> Active</p>
                <p className="text-[22px] font-medium text-gray-50">{stats.activeCount}</p>
              </div>
              <div className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4">
                <p className="text-[12px] text-gray-500 mb-1 flex items-center gap-1"><TbChecklist /> Pending Tasks</p>
                <p className="text-[22px] font-medium text-gray-50">{stats.pendingTasksCount}</p>
              </div>
              <div className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4">
                <p className="text-[12px] text-gray-500 mb-1 flex items-center gap-1"><TbSend /> Proposals</p>
                <p className="text-[22px] font-medium text-gray-50">{stats.proposalsCount}</p>
              </div>
            </div>

            <p className="text-[16px] font-medium text-gray-50 mb-3">Active Projects</p>
            <div className="flex flex-col gap-2.5 mb-8">
              {activeProjects.length === 0 ? (
                <p className="text-gray-500 text-sm">Abhi koi active project nahi hai</p>
              ) : (
                activeProjects.map((project) => (
                  <div key={project._id} className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[14px] font-medium text-gray-100">{project.title}</p>
                      <p className="text-[12px] text-gray-500">Client: {project.clientId?.name}</p>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full text-blue-400 bg-blue-500/10 border border-blue-500/20">
                      {project.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <p className="text-[16px] font-medium text-gray-50 mb-3">My Proposals</p>
            <div className="flex flex-col gap-2.5">
              {myProposals.length === 0 ? (
                <p className="text-gray-500 text-sm">Aapne abhi koi proposal nahi bheja</p>
              ) : (
                myProposals.map((proposal) => (
                  <div key={proposal._id} className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[14px] font-medium text-gray-100">{proposal.projectId?.title}</p>
                      <p className="text-[12px] text-gray-500">Bid: ${proposal.expectedBudget} • {proposal.deliveryTime} din</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                      proposal.status === "accepted"
                        ? "text-green-400 bg-green-500/10 border-green-500/20"
                        : proposal.status === "rejected"
                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {proposal.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <p className="text-[16px] font-medium text-gray-50 mb-3 mt-8">My Tasks</p>
            <div className="flex flex-col gap-2.5">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-sm">Abhi koi task assign nahi hua</p>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <p className={`text-[14px] ${task.status === "completed" ? "text-gray-500 line-through" : "text-gray-100"}`}>
                      {task.title}
                    </p>
                    {task.status === "completed" ? (
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full text-green-400 bg-green-500/10 border border-green-500/20">
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteTask(task._id)}
                        className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-[12px] font-medium px-3.5 py-1.5 rounded-md"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FreelancerDashboard;