// pages/Profile.jsx
import { useState, useContext } from "react";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";
import { TbEye } from "react-icons/tb";
import Nav from "../Components/Nav";
import { TbUser, TbMail, TbNotes, TbCode, TbX, TbDeviceFloppy } from "react-icons/tb";

function Profile() {
  const { serverUrl } = useContext(authDataContext);
  const { userData, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const [name, setName] = useState(userData?.name || "");
  const [bio, setBio] = useState(userData?.bio || "");
  const [skills, setSkills] = useState(userData?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const res = await axios.put(`${serverUrl}/api/user/profile`, {
        name, bio, skills
      }, { withCredentials: true });

      setUserData(res.data);
      setSuccess(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen pb-8 text-gray-800 dark:text-gray-200 transition-colors">
      <Nav />

      <div className="max-w-[600px] mx-auto px-4 pt-10">

        <div className="mb-6">
          <p className="text-[20px] font-medium text-gray-900 dark:text-gray-50">My Profile</p>
          <p className="text-[13px] text-gray-500 mt-1">Update your profile information</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-2xl">
            {userData?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{userData?.name}</p>
            <p className="text-[12px] text-gray-500">{userData?.email}</p>
            <span className="inline-block mt-1 bg-[#534ab715] dark:bg-[#534ab730] border border-[#534AB7] text-[#534AB7] dark:text-[#a5b4fc] text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize">
              {userData?.role}
            </span>
          </div>
        </div>

        {userData?.role === "freelancer" && (
          <button
            onClick={() => navigate(`/freelancer/${userData._id}/profile`)}
            className="flex items-center gap-2 bg-white dark:bg-[#ffffff08] border border-gray-300 dark:border-gray-700 hover:border-[#534AB7] text-gray-700 dark:text-gray-300 text-[13px] font-medium px-4 py-2 rounded-md mb-6 transition-colors"
          >
            <TbEye /> View my public profile (as it appears to the client)
          </button>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">

          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <TbUser /> Full naam
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-gray-900 dark:text-gray-100 outline-none focus:border-[#534AB7]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <TbMail /> Email address
            </label>
            <input
              type="email"
              value={userData?.email}
              disabled
              className="w-full bg-gray-100 dark:bg-[#ffffff05] border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2.5 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <TbNotes /> Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write about yourself and your experience..."
              className="w-full min-h-[100px] bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] resize-none leading-relaxed"
            />
          </div>

          {userData?.role === "freelancer" && (
            <div>
              <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <TbCode /> Skills
              </label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type skill and press Enter..."
                className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] mb-2.5"
              />
              <div className="flex gap-2 flex-wrap">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1.5 bg-[#534ab710] dark:bg-[#534ab725] border border-[#534ab760] text-[#534AB7] dark:text-[#a5b4fc] text-xs px-2.5 py-1 rounded-full"
                  >
                    {skill}
                    <TbX className="cursor-pointer text-[12px]" onClick={() => removeSkill(index)} />
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#534AB7] hover:bg-[#4840a0] text-white py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            <TbDeviceFloppy /> {loading ? "Saving..." : "Save Profile"}
          </button>

          {success && (
            <p className="text-green-600 dark:text-green-400 text-sm text-center">✓ Profile updated successfully!</p>
          )}

        </form>
      </div>
    </div>
  );
}

export default Profile;