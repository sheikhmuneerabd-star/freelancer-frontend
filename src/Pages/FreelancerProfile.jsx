import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import Nav from "../Components/Nav";
import {
  TbStarFilled, TbBriefcase, TbCalendar, TbShieldCheck,
  TbArrowLeft, TbMessageCircle
} from "react-icons/tb";

function FreelancerProfile() {
  const { freelancerId } = useParams();
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
          `${serverUrl}/api/reviews/freelancer/${freelancerId}`,
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
  }, [freelancerId]);

  if (loading) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen text-gray-200">
        <Nav />
        <div className="max-w-4xl mx-auto px-6 pt-10 animate-pulse">
          <div className="h-24 bg-[#ffffff08] rounded-xl mb-6"></div>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-[#ffffff08] rounded-lg"></div>)}
          </div>
          <div className="h-40 bg-[#ffffff08] rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen text-gray-200">
        <Nav />
        <div className="max-w-4xl mx-auto px-6 pt-20 text-center">
          <p className="text-gray-400">Ye profile nahi mil saki.</p>
          <button onClick={() => navigate(-1)} className="text-[#a5b4fc] text-sm mt-3">
            ← Wapas jao
          </button>
        </div>
      </div>
    );
  }

  const { freelancer, stats, reviews } = data;

  const trustColor =
    stats.trustScore >= 80 ? "text-green-400 bg-green-500/10 border-green-500/20" :
    stats.trustScore >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
    "text-gray-400 bg-gray-500/10 border-gray-500/20";

  return (
    <div className="bg-[#0a0a0f] min-h-screen pb-12 text-gray-200">
      <Nav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-5 transition-colors"
        >
          <TbArrowLeft /> Wapas
        </button>

        {/* Header Card */}
        <div className="bg-[#ffffff08] border border-gray-700 rounded-xl p-6 mb-6 flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-3xl flex-shrink-0">
            {freelancer.name?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold text-gray-50">{freelancer.name}</h1>
              <span className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${trustColor}`}>
                <TbShieldCheck /> Trust Score: {stats.trustScore}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5">
              <TbStarFilled className="text-amber-400 text-sm" />
              <span className="text-gray-200 text-sm font-medium">{stats.avgRating || "Naya"}</span>
              <span className="text-gray-500 text-xs">({stats.totalReviews} reviews)</span>
            </div>

            <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1.5">
              <TbCalendar />
              Member since {new Date(stats.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4">
            <p className="text-[11px] text-gray-500 mb-1 flex items-center gap-1"><TbBriefcase /> Completed</p>
            <p className="text-[20px] font-medium text-gray-50">{stats.completedProjects}</p>
          </div>
          <div className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4">
            <p className="text-[11px] text-gray-500 mb-1">Active</p>
            <p className="text-[20px] font-medium text-gray-50">{stats.activeProjects}</p>
          </div>
          <div className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4">
            <p className="text-[11px] text-gray-500 mb-1">Avg Rating</p>
            <p className="text-[20px] font-medium text-gray-50">{stats.avgRating || "—"}</p>
          </div>
          <div className="bg-[#ffffff08] border border-gray-700 rounded-lg p-4">
            <p className="text-[11px] text-gray-500 mb-1">Reviews</p>
            <p className="text-[20px] font-medium text-gray-50">{stats.totalReviews}</p>
          </div>
        </div>

        {/* Bio */}
        {freelancer.bio && (
          <div className="bg-[#ffffff08] border border-gray-700 rounded-xl p-5 mb-6">
            <p className="text-[13px] font-medium text-gray-400 mb-2">About</p>
            <p className="text-gray-300 text-sm leading-relaxed">{freelancer.bio}</p>
          </div>
        )}

        {/* Skills */}
        {freelancer.skills?.length > 0 && (
          <div className="mb-6">
            <p className="text-[13px] font-medium text-gray-400 mb-2.5">Skills</p>
            <div className="flex gap-2 flex-wrap">
              {freelancer.skills.map((skill, i) => (
                <span key={i} className="text-[12px] bg-[#534ab725] border border-[#534ab760] text-[#a5b4fc] px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <p className="text-[16px] font-medium text-gray-50 mb-3 flex items-center gap-2">
            <TbMessageCircle /> Reviews ({reviews.length})
          </p>

          {reviews.length === 0 ? (
            <div className="bg-[#ffffff08] border border-gray-700 rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">Abhi tak koi review nahi mili</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <div key={review._id} className="bg-[#ffffff08] border border-gray-700 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-medium text-xs">
                        {review.clientId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-200">{review.clientId?.name}</p>
                        <p className="text-[11px] text-gray-500">{review.projectId?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((star) => (
                        <TbStarFilled
                          key={star}
                          className={`text-xs ${star <= review.rating ? "text-amber-400" : "text-gray-700"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-[13px] leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default FreelancerProfile;