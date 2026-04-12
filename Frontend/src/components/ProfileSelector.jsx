import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../config/api';
import useAuthStore from '../store/store';

export default function ProfileSelector({ onProfileSelect, disabled = false }) {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (user && token) {
      fetchProfiles();
    }
  }, [user, token]);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfiles(Array.isArray(data) ? data : data.profiles || []);
        if (Array.isArray(data) && data.length > 0) {
          const firstProfile = data[0];
          setSelectedProfile(firstProfile);
          onProfileSelect(firstProfile._id);
        }
      } else {
        setError('Failed to load profiles');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <span className="text-sm text-yellow-800">Please log in to view your financial profiles.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm text-slate-600">
        Loading profiles...
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900 mb-1">No Financial Profiles</p>
          <p className="text-xs text-blue-700">Create a financial profile first to save advisories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
        Select Financial Profile
      </label>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled || profiles.length === 0}
        className={`w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between transition-all ${
          disabled || profiles.length === 0
            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-white border-slate-300 hover:border-slate-400 text-slate-900'
        }`}
      >
        <div className="flex-1">
          {selectedProfile ? (
            <div>
              <p className="font-semibold text-sm">
                ₹{selectedProfile.investment_capital?.toLocaleString()} Investment
              </p>
              <p className="text-xs text-slate-500">
                {selectedProfile.risk_tolerance} risk • {selectedProfile.investment_duration}y duration
              </p>
            </div>
          ) : (
            <span className="text-slate-500">Choose a profile...</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {profiles.map((profile) => (
            <button
              key={profile._id}
              onClick={() => {
                setSelectedProfile(profile);
                onProfileSelect(profile._id);
                setShowDropdown(false);
              }}
              className={`w-full px-4 py-3 text-left border-b last:border-b-0 transition-colors ${
                selectedProfile?._id === profile._id
                  ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                  : 'hover:bg-slate-50'
              }`}
            >
              <p className="font-semibold text-sm text-slate-900">
                ₹{profile.investment_capital?.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600">
                Monthly: ₹{profile.monthly_income?.toLocaleString()} • {profile.risk_tolerance} risk
              </p>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
