import React, { useState, useEffect } from 'react';
import { Trash2, Eye, AlertCircle, Loader } from 'lucide-react';
import API_BASE_URL from '../config/api';
import useAuthStore from '../store/store';

export default function AdvisoryHistory() {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAdvisory, setSelectedAdvisory] = useState(null);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (user && token) {
      fetchAdvisories();
    }
  }, [user, token]);

  const fetchAdvisories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/advisory/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setAdvisories(data.advisories || []);
      } else {
        setError('Failed to load advisories');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAdvisory = async (advisoryId) => {
    if (!window.confirm('Are you sure you want to delete this advisory?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/advisory/${advisoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setAdvisories(advisories.filter(a => a._id !== advisoryId));
        if (selectedAdvisory?._id === advisoryId) {
          setSelectedAdvisory(null);
        }
      }
    } catch (err) {
      alert('Failed to delete advisory');
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <span className="text-sm text-yellow-800">Please log in to view your advisories.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
        <p className="text-slate-600 mt-2">Loading advisories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <span className="text-sm text-red-800">{error}</span>
      </div>
    );
  }

  if (advisories.length === 0) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
        <p className="text-slate-600 font-medium mb-1">No Advisories Yet</p>
        <p className="text-sm text-slate-500">Create and save an advisory from the Advisor page to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Advisory List */}
      <div className="lg:col-span-1">
        <h3 className="font-bold text-slate-800 mb-4">Your Advisories ({advisories.length})</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {advisories.map((advisory) => (
            <button
              key={advisory._id}
              onClick={() => setSelectedAdvisory(advisory)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedAdvisory?._id === advisory._id
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">
                    ₹{advisory.current_price?.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(advisory.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      Eq: {advisory.equity_allocation}%
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      Bonds: {advisory.bond_allocation}%
                    </span>
                  </div>
                </div>
                <Eye className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Details */}
      <div className="lg:col-span-2">
        {selectedAdvisory ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-800">Advisory Details</h4>
            </div>
            <div className="p-6 space-y-6">
              {/* Allocation Overview */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-4">Asset Allocation</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 font-medium mb-1">Equities</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedAdvisory.equity_allocation}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 font-medium mb-1">Bonds</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedAdvisory.bond_allocation}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 font-medium mb-1">Gold</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedAdvisory.gold_allocation}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 font-medium mb-1">Mutual Funds</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedAdvisory.mutual_fund_allocation}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 font-medium mb-1">Cash</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedAdvisory.cash_allocation}%</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700 font-medium mb-1">Investment Amount</p>
                    <p className="text-2xl font-bold text-amber-900">₹{selectedAdvisory.current_price?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Advisory Text */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-3">Investment Recommendation</h5>
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedAdvisory.advisory_text}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-3">Information</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Market Source:</span>
                    <span className="font-medium text-slate-900">{selectedAdvisory.market_source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Created:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(selectedAdvisory.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => deleteAdvisory(selectedAdvisory._id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Advisory
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex items-center justify-center text-center">
            <div>
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Select an advisory to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
