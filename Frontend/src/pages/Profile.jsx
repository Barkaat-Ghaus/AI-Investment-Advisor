import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/store';
import useProfileStore from '../store/profileStore';
import { 
  User as UserIcon, 
  Mail, 
  Wallet, 
  Shield, 
  Clock, 
  TrendingUp, 
  Edit3,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const InfoCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-[#0d1f3d]">{value}</p>
    </div>
  </div>
);

export default function Profile() {
  const { user, token } = useAuthStore();
  const { profile, fetchProfile, loading } = useProfileStore();

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    }
  }, [token, fetchProfile]);

  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
      {/* Header Profile Section */}
      <div className="anim-fade-up relative overflow-hidden bg-[#0d1f3d] rounded-[32px] p-10 mb-8 border border-white/5">
        {/* Abstract background blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-[#2a6a3f]/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[60px]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#2a6a3f] to-[#3d9e5f] flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white/10">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              {user?.name || 'Investor Profile'}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/60 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Member since {new Date().getFullYear()}
              </span>
            </div>
          </div>
          <Link 
            to="/profile-setup" 
            className="md:ml-auto px-6 py-3 bg-white text-[#0d1f3d] rounded-xl text-[13px] font-bold shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group no-underline"
          >
            <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="anim-fade-up delay-1 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-extrabold text-[#0d1f3d] tracking-tight">Financial Overview</h2>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Verified Data
          </span>
        </div>

        {!profile && !loading ? (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-amber-900 mb-2">Complete Your Profile</h3>
            <p className="text-amber-700 text-sm mb-6">You haven't set up your financial profile yet. Let's do it now to get personalized advice.</p>
            <Link to="/profile-setup" className="inline-block px-8 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-amber-600 transition-colors no-underline">
              Set Up Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard 
              icon={Wallet} 
              label="Monthly Income" 
              value={`₹${profile?.monthly_income?.toLocaleString() || '0'}`} 
              color="text-blue-500" 
            />
            <InfoCard 
              icon={TrendingUp} 
              label="Capital to Invest" 
              value={`₹${profile?.investment_capital?.toLocaleString() || '0'}`} 
              color="text-[#2a6a3f]" 
            />
            <InfoCard 
              icon={Shield} 
              label="Risk Tolerance" 
              value={profile?.risk_tolerance || 'Not Set'} 
              color="text-amber-500" 
            />
            <InfoCard 
              icon={Clock} 
              label="Investment Duration" 
              value={`${profile?.investment_duration || '0'} Years`} 
              color="text-purple-500" 
            />
          </div>
        )}

        {/* Account Details Card */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-8">
           <div className="flex items-center gap-2 mb-8">
             <div className="w-1.5 h-6 bg-[#2a6a3f] rounded-full" />
             <h3 className="text-lg font-bold text-[#0d1f3d]">System Preferences</h3>
           </div>
           
           <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-slate-50">
                 <div>
                    <p className="text-sm font-bold text-[#0d1f3d]">AI Insights Level</p>
                    <p className="text-xs text-slate-500">How detailed you want the advisor recommendations to be.</p>
                 </div>
                 <div className="flex gap-1">
                    {['Standard', 'Advanced'].map(l => (
                      <button key={l} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold ${l === 'Standard' ? 'bg-[#0d1f3d] text-white' : 'bg-slate-50 text-slate-400'}`}>
                        {l}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-slate-50">
                 <div>
                    <p className="text-sm font-bold text-[#0d1f3d]">Currency Visualization</p>
                    <p className="text-xs text-slate-500">Primary currency for display across the platform.</p>
                 </div>
                 <select className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-[11px] font-bold text-[#0d1f3d] outline-none">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                 </select>
              </div>

              <div className="flex items-center justify-between py-4">
                 <div>
                    <p className="text-sm font-bold text-[#0d1f3d]">Data Security</p>
                    <p className="text-xs text-slate-500 font-medium text-emerald-600 flex items-center gap-1.5">
                       <CheckCircle2 className="w-3.5 h-3.5" /> 
                       End-to-end encryption active
                    </p>
                 </div>
                 <button className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors">
                    Manage Data Access
                 </button>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
