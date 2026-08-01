import { useState, useContext } from "react";
import axios from "axios";
import { TbStar, TbStarFilled, TbX } from "react-icons/tb";
import { authDataContext } from "../Context/AuthContext";
import toast from "react-hot-toast";

function ReviewModal({ project, onClose, onSuccess }) {
  const { serverUrl } = useContext(authDataContext);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Rating dena zaroori hai");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await axios.post(`${serverUrl}/api/reviews`, {
        projectId: project._id,
        rating,
        comment
      }, { withCredentials: true });

      toast.success("Review submit ho gayi!");
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Kuch ghalat ho gaya";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-[#0f0e1a] border border-gray-200 dark:border-gray-700 rounded-xl p-6 w-full max-w-[440px]">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[16px] font-medium text-gray-900 dark:text-gray-50">
            Review Do — {project.title}
          </p>
          <TbX className="text-gray-500 dark:text-gray-400 cursor-pointer text-lg" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[13px] text-gray-600 dark:text-gray-400 mb-2 block">Freelancer ko rate karo</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl text-amber-400 transition-transform hover:scale-110"
                >
                  {(hoverRating || rating) >= star ? <TbStarFilled /> : <TbStar />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[13px] text-gray-600 dark:text-gray-400 mb-1.5 block">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Kaam kaisa raha, kya achha laga..."
              className="w-full min-h-[90px] bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#534AB7] resize-none text-sm"
              required
              maxLength={500}
            />
          </div>

          {error && <span className="text-red-500 text-sm">*{error}</span>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#534AB7] hover:bg-[#4840a0] text-white py-2.5 rounded-md text-sm font-medium disabled:opacity-60"
          >
            {submitting ? "Submit ho raha hai..." : "Review Submit Karo"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;