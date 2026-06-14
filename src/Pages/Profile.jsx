// pages/Profile.jsx
import { useState, useContext } from "react";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";
import Nav from "../Components/Nav";
import { TbUser, TbMail, TbNotes, TbCode, TbX, TbDeviceFloppy } from "react-icons/tb";

function Profile() {
  const { serverUrl } = useContext(authDataContext);
  const { userData, setUserData } = useContext(userDataContext);

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
    <div className="bg-[#0a0a0f] min-h-screen pb-8 text-gray-200">
      <Nav />

      <div className="max-w-[600px] mx-auto px-4 pt-10">

        <div className="mb-6">
          <p className="text-[20px] font-medium text-gray-50">My Profile</p>
          <p className="text-[13px] text-gray-500 mt-1">Apni profile information update karo</p>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-2xl">
            {userData?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[15px] font-medium text-gray-100">{userData?.name}</p>
            <p className="text-[12px] text-gray-500">{userData?.email}</p>
            <span className="inline-block mt-1 bg-[#534ab730] border border-[#534AB7] text-[#a5b4fc] text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize">
              {userData?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">

          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-400 mb-1.5">
              <TbUser /> Poora naam
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-gray-600 rounded-md px-3 py-2.5 text-gray-100 outline-none focus:border-[#534AB7]"
            />
          </div>

          {/* Email - readonly */}
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-400 mb-1.5">
              <TbMail /> Email address
            </label>
            <input
              type="email"
              value={userData?.email}
              disabled
              className="w-full bg-[#ffffff05] border border-gray-700 rounded-md px-3 py-2.5 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-400 mb-1.5">
              <TbNotes /> Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Apne baare mein, apne experience ke baare mein likho..."
              className="w-full min-h-[100px] bg-transparent border border-gray-600 rounded-md px-3 py-2.5 text-gray-100 placeholder-gray-500 outline-none focus:border-[#534AB7] resize-none leading-relaxed"
            />
          </div>

          {/* Skills - sirf freelancer ke liye */}
          {userData?.role === "freelancer" && (
            <div>
              <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-400 mb-1.5">
                <TbCode /> Skills
              </label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type skill aur Enter dabao..."
                className="w-full bg-transparent border border-gray-600 rounded-md px-3 py-2.5 text-gray-100 placeholder-gray-500 outline-none focus:border-[#534AB7] mb-2.5"
              />
              <div className="flex gap-2 flex-wrap">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1.5 bg-[#534ab725] border border-[#534ab760] text-[#a5b4fc] text-xs px-2.5 py-1 rounded-full"
                  >
                    {skill}
                    <TbX className="cursor-pointer text-[12px]" onClick={() => removeSkill(index)} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#534AB7] hover:bg-[#4840a0] text-white py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            <TbDeviceFloppy /> {loading ? "Save ho raha hai..." : "Profile Save Karo"}
          </button>

          {success && (
            <p className="text-green-400 text-sm text-center">✓ Profile update ho gaya!</p>
          )}

        </form>
      </div>
    </div>
  );
}

export default Profile;