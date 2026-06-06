import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, Loader, Calendar, TrendingUp, DollarSign, Briefcase, Activity, Shield, PieChart, Info, ChevronRight } from 'lucide-react';
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
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start gap-4 shadow-sm">
        <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-yellow-800">Authentication Required</h3>
          <p className="text-sm text-yellow-700 mt-1">Please log in to view your investment advisories.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader className="w-10 h-10 animate-spin text-indigo-600 relative z-10" />
        </div>
        <p className="text-slate-500 font-medium mt-4 tracking-wide">Retrieving your advisories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 shadow-sm">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-red-800">Error Loading Data</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (advisories.length === 0) {
    return (
      <div className="p-12 bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
          <PieChart className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Advisories Yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto">Create and save an AI-generated investment advisory from the Advisor page to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Advisory List */}
      <div className="lg:col-span-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Saved Profiles
          </h3>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
            {advisories.length} Total
          </span>
        </div>
        
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pb-4">
          {advisories.map((advisory) => (
            <button
              key={advisory._id}
              onClick={() => setSelectedAdvisory(advisory)}
              className={`w-full group p-4 rounded-2xl border text-left transition-all duration-300 ${selectedAdvisory?._id === advisory._id
                  ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-300 shadow-md transform scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <p className="font-bold text-lg text-slate-900">
                      ₹{advisory.current_price?.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(advisory.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md uppercase tracking-wider">
                      Eq: <span className="text-indigo-600">{advisory.equity_allocation}%</span>
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md uppercase tracking-wider">
                      Bonds: <span className="text-blue-600">{advisory.bond_allocation}%</span>
                    </span>
                  </div>
                </div>
                <div className={`p-2 rounded-full transition-colors ${selectedAdvisory?._id === advisory._id ? 'bg-indigo-100' : 'bg-slate-50 group-hover:bg-indigo-50'}`}>
                  <ChevronRight className={`w-4 h-4 ${selectedAdvisory?._id === advisory._id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Details */}
      <div className="lg:col-span-8">
        {selectedAdvisory ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col transition-all duration-500">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-indigo-500" />
                  Portfolio Allocation
                </h4>
                <p className="text-sm text-slate-500 mt-1">Detailed breakdown of your AI-recommended strategy</p>
              </div>
              <div className="hidden sm:block p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Investment</p>
                <p className="text-xl font-bold text-emerald-600">₹{selectedAdvisory.current_price?.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 space-y-8 flex-1 overflow-y-auto">
              {/* Allocation Overview */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  Asset Distribution
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <p className="text-xs text-indigo-600/80 font-bold uppercase tracking-wider mb-1 relative z-10">Equities</p>
                    <p className="text-3xl font-black text-indigo-900 relative z-10">{selectedAdvisory.equity_allocation}%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <p className="text-xs text-blue-600/80 font-bold uppercase tracking-wider mb-1 relative z-10">Bonds</p>
                    <p className="text-3xl font-black text-blue-900 relative z-10">{selectedAdvisory.bond_allocation}%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <p className="text-xs text-amber-600/80 font-bold uppercase tracking-wider mb-1 relative z-10">Gold</p>
                    <p className="text-3xl font-black text-amber-900 relative z-10">{selectedAdvisory.gold_allocation}%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <p className="text-xs text-emerald-600/80 font-bold uppercase tracking-wider mb-1 relative z-10">Mutual Funds</p>
                    <p className="text-3xl font-black text-emerald-900 relative z-10">{selectedAdvisory.mutual_fund_allocation}%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 relative z-10">Cash</p>
                    <p className="text-3xl font-black text-slate-800 relative z-10">{selectedAdvisory.cash_allocation}%</p>
                  </div>
                  <div className="sm:hidden p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden group">
                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1 relative z-10">Total Amount</p>
                    <p className="text-xl font-black text-emerald-900 relative z-10">₹{selectedAdvisory.current_price?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Advisory Text */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  Strategic Recommendation
                </h5>
                <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-2xl shadow-sm relative">
                  <div className="absolute top-4 right-4 text-indigo-200">
                    <Info className="w-6 h-6 opacity-50" />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed relative z-10 pr-6">
                    {selectedAdvisory.advisory_text}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Metadata
                </h5>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold mb-1">Market Source</span>
                      <span className="font-medium text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-500" />
                        {selectedAdvisory.market_source || 'AI Generation'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold mb-1">Created On</span>
                      <span className="font-medium text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {new Date(selectedAdvisory.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => deleteAdvisory(selectedAdvisory._id)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-semibold text-sm transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200 border-dashed shadow-sm h-full flex flex-col items-center justify-center min-h-[400px] text-center p-12">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <PieChart className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Profile</h3>
            <p className="text-slate-500 max-w-sm">Choose an investment advisory from the list to view its detailed asset allocation and strategic recommendations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
