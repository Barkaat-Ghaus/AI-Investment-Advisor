import React, { useEffect, useState } from 'react';
import { Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import useAdvisorStore from '../store/advisorStore';
import useAuthStore from '../store/store';

export default function SaveAdvisoryButton({ profileId, disabled = false }) {
  const { saveAdvisory, savingAdvisory, saveError, saveSuccess, clearSaveMessages } = useAdvisorStore();
  const { user } = useAuthStore();
  const [showMessage, setShowMessage] = useState(false);

  const handleSaveAdvisory = async () => {
    if (!user || !profileId) {
      alert('Please ensure you are logged in and have a financial profile created.');
      return;
    }

    const result = await saveAdvisory(user.id, profileId);
    setShowMessage(true);
    
    setTimeout(() => {
      setShowMessage(false);
      clearSaveMessages();
    }, 4000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleSaveAdvisory}
        disabled={disabled || savingAdvisory || !user}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
          disabled || savingAdvisory || !user
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
        }`}
      >
        {savingAdvisory ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Advisory
          </>
        )}
      </button>

      {showMessage && (saveSuccess || saveError) && (
        <div className={`absolute top-full mt-3 right-0 p-4 rounded-lg shadow-lg text-sm font-medium z-50 ${
          saveSuccess
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-start gap-3">
            {saveSuccess ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{saveSuccess || saveError}</span>
          </div>
        </div>
      )}
    </div>
  );
}
