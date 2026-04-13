import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  Wallet, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Info,
  DollarSign,
  TrendingDown,
  Activity
} from 'lucide-react';
import useProfileStore from '../store/profileStore';
import useAuthStore from '../store/store';

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex gap-2 mb-8">
    {[...Array(totalSteps)].map((_, i) => (
      <div 
        key={i} 
        className={`h-1.5 rounded-full transition-all duration-500 ${
          i <= currentStep ? 'bg-[#2a6a3f] w-8' : 'bg-slate-200 w-4'
        }`}
      />
    ))}
  </div>
);

const QuestionCard = ({ title, subtitle, icon: Icon, children }) => (
  <div className="anim-fade-up bg-white rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12 max-w-2xl w-full">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <Icon className="w-6 h-6 text-[#0d1f3d]" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-[#0d1f3d] tracking-tight">{title}</h2>
        <p className="text-slate-500 text-sm font-medium">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

export default function ProfileQuestion() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  const { saveProfile, fetchProfile, profile, loading } = useProfileStore();
  
  const [step, setStep] = useState(0);
  const [profileExists, setProfileExists] = useState(false);
  const [formData, setFormData] = useState({
    monthly_income: '',
    investment_capital: '',
    risk_tolerance: 'Medium',
    investment_duration: 5
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (token) {
      fetchProfile(token);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (profile) {
      setProfileExists(true);
      setFormData({
        monthly_income: profile.monthly_income || '',
        investment_capital: profile.investment_capital || '',
        risk_tolerance: profile.risk_tolerance || 'Medium',
        investment_duration: profile.investment_duration || 5
      });
    }
  }, [profile]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    // Validate that all fields are filled
    if (!formData.monthly_income || !formData.investment_capital) {
      alert('Please fill in all required fields');
      return;
    }

    // Convert string values to numbers
    const profileDataToSave = {
      monthly_income: Number(formData.monthly_income),
      investment_capital: Number(formData.investment_capital),
      risk_tolerance: formData.risk_tolerance,
      investment_duration: Number(formData.investment_duration)
    };

    const result = await saveProfile(profileDataToSave, token);
    if (result.success) {
      // Fetch the updated profile before navigating to ensure data is fresh
      await fetchProfile(token);
      navigate('/profile');
    } else {
      alert('Error saving profile: ' + (result.message || 'Unknown error'));
    }
  };

  const steps = [
    {
      title: "Monthly Cash Flow",
      subtitle: "How much is your steady monthly income?",
      icon: Wallet,
      content: (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <input 
              type="number"
              value={formData.monthly_income}
              onChange={(e) => setFormData({...formData, monthly_income: e.target.value})}
              placeholder="e.g. 75,000"
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-[#0d1f3d] focus:outline-none focus:ring-2 focus:ring-[#2a6a3f]/20 focus:border-[#2a6a3f] transition-all"
            />
          </div>
          <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Total post-tax income from all sources including salary, rentals, and dividends.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Investment Capital",
      subtitle: "Initial amount you wish to put to work.",
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <input 
              type="number"
              value={formData.investment_capital}
              onChange={(e) => setFormData({...formData, investment_capital: e.target.value})}
              placeholder="e.g. 5,00,000"
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-[#0d1f3d] focus:outline-none focus:ring-2 focus:ring-[#2a6a3f]/20 focus:border-[#2a6a3f] transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => setFormData({...formData, investment_capital: '50000'})} className="py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50">₹50K</button>
             <button onClick={() => setFormData({...formData, investment_capital: '100000'})} className="py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50">₹1L</button>
             <button onClick={() => setFormData({...formData, investment_capital: '500000'})} className="py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50">₹5L</button>
             <button onClick={() => setFormData({...formData, investment_capital: '1000000'})} className="py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50">₹10L</button>
          </div>
        </div>
      )
    },
    {
      title: "Risk Appetite",
      subtitle: "How comfortable are you with market swings?",
      icon: Shield,
      content: (
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'Low', desc: 'Prioritize capital preservation', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Medium', desc: 'Balanced growth and volatility', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'High', desc: 'Aggressive growth seeking', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-50' }
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => setFormData({...formData, risk_tolerance: r.label})}
              className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                formData.risk_tolerance === r.label 
                ? `border-[#0d1f3d] bg-[#0d1f3d] text-white shadow-lg -translate-y-0.5` 
                : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <div className={`p-3 rounded-xl ${formData.risk_tolerance === r.label ? 'bg-white/10' : r.bg}`}>
                <r.icon className={`w-5 h-5 ${formData.risk_tolerance === r.label ? 'text-white' : r.color}`} />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider">{r.label}</h4>
                <p className={`text-[11px] ${formData.risk_tolerance === r.label ? 'text-white/60' : 'text-slate-500'}`}>{r.desc}</p>
              </div>
              {formData.risk_tolerance === r.label && <CheckCircle2 className="w-5 h-5 text-[#2a6a3f] ml-auto" />}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Investment Horizon",
      subtitle: "How long do you plan to stay invested?",
      icon: Clock,
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <span className="text-6xl font-black text-[#0d1f3d] tracking-tight">{formData.investment_duration}</span>
            <span className="text-xl font-bold text-slate-400 ml-2">Years</span>
          </div>
          <input 
            type="range"
            min="1"
            max="30"
            value={formData.investment_duration}
            onChange={(e) => setFormData({...formData, investment_duration: e.target.value})}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2a6a3f]"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Short Term</span>
            <span>Long Term</span>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[step];

  // Success Screen Component
  if (profileExists) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]" />

        <div className="z-10 w-full flex flex-col items-center">
          <div className="anim-fade-up bg-white rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12 max-w-2xl w-full">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-emerald-50 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-[#0d1f3d] tracking-tight mb-3">
                Profile Already Created
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                You have already completed your financial profile. Your details are secure and verified.
              </p>
            </div>

            {/* Current Profile Details */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-600">Monthly Income</span>
                <span className="text-lg font-bold text-[#0d1f3d]">₹{formData.monthly_income?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-600">Investment Capital</span>
                <span className="text-lg font-bold text-[#0d1f3d]">₹{formData.investment_capital?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-600">Risk Tolerance</span>
                <span className="text-lg font-bold text-[#0d1f3d]">{formData.risk_tolerance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">Investment Duration</span>
                <span className="text-lg font-bold text-[#0d1f3d]">{formData.investment_duration} Years</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/profile')}
                className="flex-1 px-6 py-3 bg-[#2a6a3f] text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5"
              >
                View Full Profile
              </button>
              <button 
                onClick={() => setProfileExists(false)}
                className="flex-1 px-6 py-3 bg-slate-100 text-[#0d1f3d] rounded-xl text-sm font-bold shadow-lg hover:bg-slate-200 transition-all"
              >
                Update Profile
              </button>
            </div>
          </div>

          <p className="mt-8 text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            Institutional Grade Data Security
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]" />

      <div className="z-10 w-full flex flex-col items-center">
        <StepIndicator currentStep={step} totalSteps={steps.length} />

        <QuestionCard 
          title={currentStepData.title}
          subtitle={currentStepData.subtitle}
          icon={currentStepData.icon}
        >
          <div className="min-h-55 flex flex-col justify-center py-6">
            {currentStepData.content}
          </div>

          <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-100">
            <button 
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-2 text-sm font-bold tracking-tight transition-colors ${
                step === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-[#0d1f3d]'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button 
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-[#0d1f3d] text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : step === steps.length - 1 ? (
                <>
                  {profile ? 'Update Profile' : 'Complete Profile'} <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>Next Step <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </QuestionCard>

        <p className="mt-8 text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Institutional Grade Data Security
        </p>
      </div>
    </div>
  );
}
