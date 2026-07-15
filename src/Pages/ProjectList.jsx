// pages/ProjectList.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import { TbCurrencyDollar, TbClock, TbUsers, TbX } from "react-icons/tb";
import { socketDataContext } from "../Context/SocketContext";
import Nav from "../Components/Nav";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ProjectList() {
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();
  const { socket } = useContext(socketDataContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [expectedBudget, setExpectedBudget] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sort, setSort] = useState("newest");

  const fetchProjects = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (minBudget) params.append("minBudget", minBudget);
      if (maxBudget) params.append("maxBudget", maxBudget);
      if (sort) params.append("sort", sort);

      const res = await axios.get(`${serverUrl}/api/freelancer?${params.toString()}`, { withCredentials: true });
      setProjects(res.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProjects();
    }, 400);

    return () => clearTimeout(delay);
  }, [search, minBudget, maxBudget, sort]);

  useEffect(() => {
    if (!socket) return;

    const handleNewProject = (newProject) => {
      setProjects((prev) => {
        if (prev.some((p) => p._id === newProject._id)) return prev;
        return [newProject, ...prev];
      });
      toast.success(`Naya project post hua: "${newProject.title}"`);
    };

    socket.on("project:new", handleNewProject);

    return () => {
      socket.off("project:new", handleNewProject);
    };
  }, [socket]);

  const handleSendProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      let res = await axios.post(`${serverUrl}/api/freelancer`, {
        projectId: selectedProject._id,
        coverLetter,
        expectedBudget,
        deliveryTime
      }, { withCredentials: true });
      toast.success("Proposal bhej diya!");
      setSelectedProject(null);
      setCoverLetter("");
      setExpectedBudget("");
      setDeliveryTime("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Kuch ghalat ho gaya");
      setError(error.response?.data?.message || "Kuch ghalat ho gaya");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen pb-8 transition-colors">
      
      <Nav />

      <div className="max-w-7xl mx-auto px-6 pt-10">

        <div className="mb-5">
          <p className="text-[18px] font-medium text-gray-900 dark:text-gray-50">Available Projects</p>
          <p className="text-[12px] text-gray-500 mt-1">{projects.length} projects mil gaye</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title ya skill search karo..."
            className="flex-1 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7]"
          />
          <input
            type="number"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            placeholder="Min budget"
            className="w-full sm:w-[140px] bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7]"
          />
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="Max budget"
            className="w-full sm:w-[140px] bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7]"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full sm:w-[160px] bg-white dark:bg-[#0a0a0f] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#534AB7]"
          >
            <option value="newest">Newest</option>
            <option value="budget-high">Budget: High to Low</option>
            <option value="budget-low">Budget: Low to High</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 text-sm">Abhi koi project available nahi hai</p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {projects.map((project) => (
              <div key={project._id} className="bg-white dark:bg-[#ffffff08] border p-3 border-gray-200 dark:border-gray-700 rounded-lg p-4.5 hover:border-[#534AB7] transition-colors cursor-pointer shadow-sm dark:shadow-none">
                <div className="flex justify-between items-start mb-2.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[15px] font-medium text-gray-900 dark:text-gray-50">{project.title}</p>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                        Open
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500">
                      Client:{" "}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/client/${project.clientId?._id}/profile`);
                        }}
                        className="text-[#534AB7] dark:text-[#a5b4fc] hover:underline cursor-pointer"
                      >
                        {project.clientId?.name}
                      </span>
                    </p>
                  </div>
                  <p className="text-[16px] font-medium text-[#534AB7] dark:text-[#a5b4fc] whitespace-nowrap ml-3">
                    ${project.budgetMin}–${project.budgetMax}
                  </p>
                </div>

                <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex gap-1.5 flex-wrap mb-3">
                  {project.skillsRequired.map((skill, i) => (
                    <span key={i} className="text-[11px] bg-[#534ab710] dark:bg-[#534ab725] border border-[#534ab760] text-[#534AB7] dark:text-[#a5b4fc] px-2.5 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-[12px] text-gray-500">
                    <span className="flex items-center gap-1"><TbClock /> {project.deadline} din</span>
                  </div>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="bg-[#534ab710] dark:bg-[#534ab720] border border-[#534AB7] text-[#534AB7] dark:text-[#a5b4fc] text-[12px] font-medium px-3.5 py-1.5 rounded-md hover:bg-[#534ab725] dark:hover:bg-[#534ab740]"
                  >
                    Proposal Bhejo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-[#0f0e1a] border border-gray-200 dark:border-gray-700 rounded-xl p-6 w-full max-w-[480px]">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[16px] font-medium text-gray-900 dark:text-gray-50">
                Proposal Bhejo — {selectedProject.title}
              </p>
              <TbX 
                className="text-gray-500 dark:text-gray-400 cursor-pointer text-lg" 
                onClick={() => setSelectedProject(null)} 
              />
            </div>

            <form onSubmit={handleSendProposal} className="flex flex-col gap-3.5">
              <div>
                <label className="text-[13px] text-gray-600 dark:text-gray-400 mb-1.5 block">Cover Letter</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Apna experience aur approach batao..."
                  className="w-full min-h-[90px] bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] resize-none text-sm"
                  required
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[13px] text-gray-600 dark:text-gray-400 mb-1.5 block">Expected Budget ($)</label>
                  <input
                    type="number"
                    value={expectedBudget}
                    onChange={(e) => setExpectedBudget(e.target.value)}
                    className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:border-[#534AB7] text-sm"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[13px] text-gray-600 dark:text-gray-400 mb-1.5 block">Delivery Time (days)</label>
                  <input
                    type="number"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:border-[#534AB7] text-sm"
                    required
                  />
                </div>
              </div>

              {error && <span className="text-red-500 text-sm">*{error}</span>}

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#534AB7] hover:bg-[#4840a0] text-white py-2.5 rounded-md text-sm font-medium disabled:opacity-60"
              >
                {submitting ? "Bhej rahe hain..." : "Proposal Submit Karo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectList;