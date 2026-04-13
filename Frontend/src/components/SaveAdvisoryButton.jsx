import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Loader, UserX } from 'lucide-react';
import useAdvisorStore from '../store/advisorStore';
import useAuthStore from '../store/store';
import API_BASE_URL from '../config/api';

export default function SaveAdvisoryButton({ disabled = false }) {
  const { saveAdvisory, savingAdvisory, saveError, saveSuccess, clearSaveMessages } = useAdvisorStore();
  const { user, token } = useAuthStore();

  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error'|'warn', message }

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
      clearSaveMessages();
    }, 5000);
  };

  const handleSave = async () => {
    if (!user || !token) {
      showFeedback('error', 'You must be logged in to save an advisory.');
      return;
    }

    setChecking(true);
    try {
      // ── Step 1: fetch financial profile from DB ──────────────────
      const profileRes = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.status === 404 || !profileRes.ok) {
        showFeedback('warn', 'No financial profile found. Please set up your financial profile first.');
        return;
      }

      const profileData = await profileRes.json();
      const profileId = profileData?._id;

      if (!profileId) {
        showFeedback('warn', 'Financial profile is incomplete. Please update your profile and try again.');
        return;
      }

      // ── Step 2: save advisory using the real profile ID ──────────
      const result = await saveAdvisory(user.id, profileId, token);

      if (result?.success) {
        showFeedback('success', 'Advisory saved successfully!');
      } else {
        showFeedback('error', result?.message || 'Failed to save advisory. Please try again.');
      }
    } catch (err) {
      showFeedback('error', 'Network error. Please check your connection and try again.');
    } finally {
      setChecking(false);
    }
  };

  const isWorking = checking || savingAdvisory;

  const feedbackStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error:   'bg-red-50 border-red-200 text-red-800',
    warn:    'bg-amber-50 border-amber-200 text-amber-800',
  };
  const FeedbackIcon = {
    success: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
    error:   <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />,
    warn:    <UserX className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
  };

  return (
    <div className="relative w-full">
      <button
        onClick={handleSave}
        disabled={disabled || isWorking || !user}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
          disabled || isWorking || !user
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md'
        }`}
      >
        {isWorking ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            {checking ? 'Checking profile...' : 'Saving...'}
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Advisory
          </>
        )}
      </button>

      {feedback && (
        <div className={`absolute top-full mt-2 right-0 left-0 p-3 rounded-lg border shadow-lg text-xs font-medium z-50 ${feedbackStyles[feedback.type]}`}>
          <div className="flex items-start gap-2">
            {FeedbackIcon[feedback.type]}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
