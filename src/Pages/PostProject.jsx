import axios from "axios";
import { useContext, useState } from "react";
import { TbHeading, TbNotes, TbCurrencyDollar, TbCalendar, TbCode, TbSend, TbX, TbBriefcase } from "react-icons/tb";
import { authDataContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import Nav from "../Components/Nav";
import toast from "react-hot-toast";

function PostProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim() !== "") {
      e.preventDefault();
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${serverUrl}/api/client/projects`,
        {
          title,
          description,
          budgetMin,
          budgetMax,
          deadline,
          skillsRequired: skills,
        },
        { withCredentials: true }
      );
      toast.success("Project post ho gaya!");
      navigate("/client/dashboard");

    } catch (error) {
      toast.error(error.response?.data?.message || "Kuch ghalat ho gaya");
      setError(error.response?.data?.message || "Kuch ghalat ho gaya");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen pb-8 transition-colors">

      <Nav />

      <div className="max-w-[640px] mx-auto px-4 pt-8">

        <div className="mb-6">
          <p className="text-[22px] font-medium text-gray-900 dark:text-gray-50">Post a new project</p>
          <p className="text-[13px] text-gray-500 mt-1">
            Clearly write down your requirements — it will make things easier for freelancers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">

          <div>
            <label className="flex items-center gap-1 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <TbHeading /> Project title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. I need to build an E-commerce website"
              className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] transition-colors"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <TbNotes /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="I need a full e-commerce platform built with React and Node.js that includes login, products, a shopping cart, and payment functionality"
              className="w-full min-h-[100px] bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] transition-colors resize-none leading-relaxed"
              required
            />
          </div>

          <div className="flex gap-3.5">
            <div className="flex-1">
              <label className="flex items-center gap-1 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <TbCurrencyDollar /> Budget (min)
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="300"
                className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] transition-colors"
                required
              />
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-1 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <TbCurrencyDollar /> Budget (max)
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="500"
                className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <TbCalendar /> Deadline (days)
            </label>
            <input
              type="number"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="30"
              className="max-w-[200px] bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] transition-colors"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <TbCode /> Skills required
            </label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="Type skill and press enter..."
              className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] transition-colors mb-2.5"
            />
            <div className="flex gap-2 flex-wrap">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1.5 bg-[#534ab710] dark:bg-[#534ab725] border border-[#534ab760] text-[#534AB7] dark:text-[#a5b4fc] text-xs px-2.5 py-1 rounded-full"
                >
                  {skill}
                  <TbX
                    className="cursor-pointer text-[12px]"
                    onClick={() => removeSkill(index)}
                  />
                </span>
              ))}
            </div>
          </div>
          {error && <span className="text-red-500 font-medium text-sm">*{error}</span>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              className="flex-1 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#ffffff08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 bg-[#534AB7] hover:bg-[#4840a0] rounded-md text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? "Posting..." : <><TbSend /> Post Project</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default PostProject;