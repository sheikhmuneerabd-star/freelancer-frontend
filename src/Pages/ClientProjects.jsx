// pages/ClientProjects.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import Nav from "../Components/Nav";
import { TbPlus, TbX } from "react-icons/tb";
import toast from "react-hot-toast";
import ReviewModal from "../Components/ReviewModal";
import { useNavigate } from "react-router-dom";

function ClientProjects() {
  const { serverUrl } = useContext(authDataContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [reviewProject, setReviewProject] = useState(null);
  const navigate = useNavigate();

  // Task modal
  const [taskModal, setTaskModal] = useState(null); // project object
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/client/projects`, { withCredentials: true });
      setProjects(res.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(p => p.status === filter);

  const openTaskModal = async (project) => {
    setTaskModal(project);
    try {
      const res = await axios.get(`${serverUrl}/api/tasks/${project._id}`, { withCredentials: true });
      setTasks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await axios.post(`${serverUrl}/api/tasks`, {
        projectId: taskModal._id,
        title: newTask
      }, { withCredentials: true });
      toast.success("Task add ho gaya");
      setNewTask("");
      const res = await axios.get(`${serverUrl}/api/tasks/${taskModal._id}`, { withCredentials: true });
      setTasks(res.data);
    } catch (error) {
      toast.error("Kuch ghalat ho gaya");
    }
  };

  const statusBadge = (status) => {
    const styles = {
      open: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      "in-progress": "text-green-400 bg-green-500/10 border-green-500/20",
      completed: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    };
    return styles[status] || styles.open;
  };

  // 🔴 FIX: ab poora 'project' object pass karenge, sirf id nahi —
  // taake completion ke baad usi project ke liye review modal khul sake
  const handleCompleteProject = async (project) => {
    try {
      await axios.put(`${serverUrl}/api/client/${project._id}/complete`, {}, { withCredentials: true });
      toast.success("Project complete ho gaya! 🎉");
      setReviewProject(project);   // 🔴 FIX: ab 'project' defined hai
      fetchProjects(); // refresh
    } catch (error) {
      toast.error("Kuch ghalat ho gaya");
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen pb-8 text-gray-200">
      <Nav />

      <div className="max-w-7xl mx-auto px-6 pt-10">

        <p className="text-[18px] font-medium text-gray-50 mb-1">My Projects</p>
        <p className="text-[12px] text-gray-500 mb-5">{projects.length} total projects</p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "open", "in-progress", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] font-medium px-4 py-1.5 rounded-full border transition-colors ${
                filter === f
                  ? "bg-[#534AB7] border-[#534AB7] text-white"
                  : "bg-transparent border-gray-600 text-gray-400 hover:text-gray-200"
              }`}
            >
              {f === "all" ? "Sab" : f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : filteredProjects.length === 0 ? (
          <p className="text-gray-500 text-sm">Koi project nahi mila</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredProjects.map((project) => (
              <div key={project._id} className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[15px] font-medium text-gray-50">{project.title}</p>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusBadge(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500">
                    {project.assignedFreelancer ? (
                      <>
                        Hired:{" "}
                        <span
                          onClick={() => navigate(`/freelancer/${project.assignedFreelancer._id}/profile`)}
                          className="text-[#a5b4fc] hover:underline cursor-pointer"
                        >
                          {project.assignedFreelancer.name}
                        </span>
                      </>
                    ) : (
                      "Abhi koi hire nahi"
                    )} • Deadline: {project.deadline} din
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-[14px] font-medium text-[#a5b4fc]">
                    ${project.budgetMin}–${project.budgetMax}
                  </p>
                  {project.assignedFreelancer && (
                    <>
                      <button
                        onClick={() => openTaskModal(project)}
                        className="bg-[#534ab720] border border-[#534AB7] text-[#a5b4fc] text-[12px] font-medium px-3.5 py-1.5 rounded-md hover:bg-[#534ab740]"
                      >
                        Tasks
                      </button>

                      {project.status === "in-progress" && (
                        <button
                          onClick={() => handleCompleteProject(project)}
                          className="bg-green-600/20 border border-green-600 text-green-400 text-[12px] font-medium px-3.5 py-1.5 rounded-md hover:bg-green-600/30"
                        >
                          Mark Completed
                        </button>
                      )}

                      {/* 🔴 NEW: agar project complete ho chuka hai aur review abhi tak nahi di, to button dikhao */}
                      {project.status === "completed" && (
                        <button
                          onClick={() => setReviewProject(project)}
                          className="bg-amber-600/20 border border-amber-600 text-amber-400 text-[12px] font-medium px-3.5 py-1.5 rounded-md hover:bg-amber-600/30"
                        >
                          Review Do
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {taskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0f0e1a] border border-gray-700 rounded-xl p-6 w-full max-w-[480px]">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[16px] font-medium text-gray-50">{taskModal.title} — Tasks</p>
              <TbX className="text-gray-400 cursor-pointer text-lg" onClick={() => setTaskModal(null)} />
            </div>

            <form onSubmit={addTask} className="flex gap-2 mb-4">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Naya task likho..."
                className="flex-1 bg-transparent border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 outline-none focus:border-[#534AB7] text-sm"
              />
              <button type="submit" className="bg-[#534AB7] hover:bg-[#4840a0] text-white px-4 rounded-md">
                <TbPlus />
              </button>
            </form>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-sm">Koi task nahi hai abhi</p>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} className="bg-[#ffffff08] border border-gray-700 rounded-md p-3 flex justify-between items-center">
                    <p className="text-[13px] text-gray-200">{task.title}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                      task.status === "completed"
                        ? "text-green-400 bg-green-500/10 border-green-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔴 FIX: Review Modal ab actually render ho raha hai */}
      {reviewProject && (
        <ReviewModal
          project={reviewProject}
          onClose={() => setReviewProject(null)}
          onSuccess={() => fetchProjects()}
        />
      )}
    </div>
  );
}

export default ClientProjects;