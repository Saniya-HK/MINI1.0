import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Save, 
  MapPin, 
  Briefcase, 
  Clock, 
  Plus, 
  X, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Loader2,
  Award
} from "lucide-react";
import { CareerProfile } from "../types";

interface ProfileViewProps {
  token: string | null;
}

export default function ProfileView({ token }: ProfileViewProps) {
  const [profile, setProfile] = useState<CareerProfile>({
    id: "",
    userId: "",
    headline: "",
    location: "",
    workPreference: "Remote",
    experienceLevel: "Entry Level",
    bio: "",
    careerGoals: "",
    technicalSkills: [],
    softSkills: [],
    certifications: [],
    interests: [],
    preferredRoles: [],
    employabilityScore: 30,
    careerReadinessScore: 35
  });

  const [techInput, setTechInput] = useState("");
  const [softInput, setSoftInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [roleInput, setRoleInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          ...data,
          technicalSkills: Array.isArray(data.technicalSkills) ? data.technicalSkills : [],
          softSkills: Array.isArray(data.softSkills) ? data.softSkills : [],
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
          interests: Array.isArray(data.interests) ? data.interests : [],
          preferredRoles: Array.isArray(data.preferredRoles) ? data.preferredRoles : []
        });
      }
    } catch (err) {
      console.error("Error loading career profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setMessage({ type: "success", text: "Career profile saved successfully!" });
        // Auto-scroll on completion or clear message later
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save profile. Check logs." });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage({ type: "error", text: "An error occurred during save." });
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!token) return;
    try {
      setAnalyzing(true);
      setMessage(null);
      const res = await fetch("/api/profile/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
        // Sync profile score
        if (data.employabilityScore) {
          setProfile(p => ({
            ...p,
            employabilityScore: data.employabilityScore,
            careerReadinessScore: data.careerReadinessScore || data.employabilityScore + 3
          }));
        }
      }
    } catch (err) {
      console.error("Error analyzing profile score:", err);
      setMessage({ type: "error", text: "Error running score analysis." });
    } finally {
      setAnalyzing(false);
    }
  };

  // Adding skills tag array helpers
  const appendTag = (key: keyof CareerProfile, value: string, clearFn: () => void) => {
    if (!value.trim()) return;
    const currentList = Array.isArray(profile[key]) ? (profile[key] as string[]) : [];
    if (!currentList.includes(value.trim())) {
      setProfile({
        ...profile,
        [key]: [...currentList, value.trim()]
      });
    }
    clearFn();
  };

  const removeTag = (key: keyof CareerProfile, value: string) => {
    const currentList = Array.isArray(profile[key]) ? (profile[key] as string[]) : [];
    setProfile({
      ...profile,
      [key]: currentList.filter(item => item !== value)
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="profile-view-root">
      
      {/* Upper header line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5" id="profile-header">
        <div>
          <h2 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">Career Profile</h2>
          <p className="text-sm text-gray-500">Build your professional identity</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !profile.headline}
            id="profile-analyze-btn"
            title={!profile.headline ? "Define professional headline to analyze" : "Run profile metrics assessment"}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-violet-600" />
                <span>Analyze Score</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            id="profile-save-btn"
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-70 shadow-sm shadow-violet-100 transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div id="profile-alert-message" className={`p-4 rounded-xl border text-sm ${
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {profile.recommendedCareer && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Recommended Career</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{profile.recommendedCareer}</h3>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-violet-600">Powered by profile analysis</span>
          </div>
          {profile.recommendedCareerSkills && profile.recommendedCareerSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.recommendedCareerSkills.map(skill => (
                <span key={skill} className="text-[10px] font-semibold uppercase tracking-wider bg-white text-slate-800 border border-slate-200 rounded-full px-3 py-1">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Basic core profiles form cards */}
      <div className="grid grid-cols-1 gap-6" id="profile-form-grid">
        
        {/* Basic Information Block */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6" id="basic-info-card">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet-600">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h3 className="font-bold text-gray-900 text-md">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Professional Headline</label>
              <input
                type="text"
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                placeholder="e.g. Full-Stack Developer"
                id="input-headline"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 focus:outline-none text-gray-800 text-sm transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Preferred Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. New York, USA"
                id="input-location"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 focus:outline-none text-gray-800 text-sm transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Work Preference</label>
              <select
                value={profile.workPreference}
                onChange={(e) => setProfile({ ...profile, workPreference: e.target.value as any })}
                id="select-work-preference"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 focus:outline-none text-gray-800 text-sm transition-all bg-white"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Experience Level</label>
              <select
                value={profile.experienceLevel}
                onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value as any })}
                id="select-experience-level"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 focus:outline-none text-gray-800 text-sm transition-all bg-white"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Bio</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              id="input-bio"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 focus:outline-none text-gray-800 text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Career Goals</label>
            <textarea
              rows={3}
              value={profile.careerGoals}
              onChange={(e) => setProfile({ ...profile, careerGoals: e.target.value })}
              placeholder="What are your career aspirations?"
              id="input-goals"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 focus:outline-none text-gray-800 text-sm transition-all"
            />
          </div>
        </div>

        {/* Skills & Expertise Segment */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6" id="skills-expertise-card">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
            <Award className="w-4.5 h-4.5 text-violet-600" />
            <h3 className="font-bold text-gray-900 text-md">Skills & Expertise</h3>
          </div>

          {/* Technical Skills Tag Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Technical Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && appendTag("technicalSkills", techInput, () => setTechInput(""))}
                placeholder="Add technical skill..."
                id="tech-skills-input"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400"
              />
              <button
                type="button"
                onClick={() => appendTag("technicalSkills", techInput, () => setTechInput(""))}
                className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 text-gray-600 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.technicalSkills.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium">
                  <span>{tag}</span>
                  <X className="w-3.5 h-3.5 text-violet-400 hover:text-violet-700 cursor-pointer" onClick={() => removeTag("technicalSkills", tag)} />
                </span>
              ))}
            </div>
          </div>

          {/* Soft Skills Tag Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Soft Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={softInput}
                onChange={(e) => setSoftInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && appendTag("softSkills", softInput, () => setSoftInput(""))}
                placeholder="Add soft skill..."
                id="soft-skills-input"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400"
              />
              <button
                type="button"
                onClick={() => appendTag("softSkills", softInput, () => setSoftInput(""))}
                className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 text-gray-600 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.softSkills.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium">
                  <span>{tag}</span>
                  <X className="w-3.5 h-3.5 text-indigo-400 hover:text-indigo-700 cursor-pointer" onClick={() => removeTag("softSkills", tag)} />
                </span>
              ))}
            </div>
          </div>

          {/* Certifications Block */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Certifications</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && appendTag("certifications", certInput, () => setCertInput(""))}
                placeholder="Add certification..."
                id="certifications-input"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400"
              />
              <button
                type="button"
                onClick={() => appendTag("certifications", certInput, () => setCertInput(""))}
                className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 text-gray-600 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.certifications.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">
                  <span>{tag}</span>
                  <X className="w-3.5 h-3.5 text-emerald-400 hover:text-emerald-700 cursor-pointer" onClick={() => removeTag("certifications", tag)} />
                </span>
              ))}
            </div>
          </div>

          {/* Interests block */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Interests</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && appendTag("interests", interestInput, () => setInterestInput(""))}
                placeholder="Add interest..."
                id="interests-input"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400"
              />
              <button
                type="button"
                onClick={() => appendTag("interests", interestInput, () => setInterestInput(""))}
                className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 text-gray-600 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.interests.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-700 text-xs font-medium">
                  <span>{tag}</span>
                  <X className="w-3.5 h-3.5 text-pink-400 hover:text-pink-700 cursor-pointer" onClick={() => removeTag("interests", tag)} />
                </span>
              ))}
            </div>
          </div>

          {/* Preferred target roles */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Preferred Roles</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && appendTag("preferredRoles", roleInput, () => setRoleInput(""))}
                placeholder="Add preferred role..."
                id="preferred-roles-input"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400"
              />
              <button
                type="button"
                onClick={() => appendTag("preferredRoles", roleInput, () => setRoleInput(""))}
                className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 text-gray-600 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.preferredRoles.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                  <span>{tag}</span>
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-750 cursor-pointer" onClick={() => removeTag("preferredRoles", tag)} />
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Analysis Results Details */}
      {analysisResult && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6 animate-slideUp" id="profile-analysis-panel">
          
          <div className="flex items-center gap-2 pb-4 border-b border-light-50">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-gray-900 text-md">AI Insights & Suitability Review</h3>
          </div>

          {/* Core score output */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-gradient-to-r from-violet-50 to-indigo-50/50 p-6 rounded-2xl border border-violet-100/40">
            <div>
              <span className="text-xs font-semibold uppercase text-violet-800 tracking-wider">Dynamic Employability Score</span>
              <p className="text-4xl font-extrabold text-violet-950 mt-1">{analysisResult.employabilityScore}%</p>
              <p className="text-xs text-violet-600/70 mt-1">Reflects your competitive score indexing across industry targets.</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-violet-800 tracking-wider">Career Readiness Grade</span>
              <p className="text-4xl font-extrabold text-violet-950 mt-1">
                {typeof analysisResult.careerReadinessScore === "number" ? `${analysisResult.careerReadinessScore}%` : analysisResult.careerReadinessScore}
              </p>
              <p className="text-xs text-violet-600/70 mt-1">Assessed alignment with junior, mid-level, or lead engineer thresholds.</p>
            </div>
          </div>

          {/* Grid layout for Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <div className="p-5 border border-emerald-100/70 bg-emerald-50/30 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                <span>Strengths</span>
              </div>
              <ul className="space-y-2">
                {analysisResult.strengths.map((st: string, idx: number) => (
                  <li key={idx} className="text-xs text-emerald-800 flex items-start gap-1.5 leading-relaxed">
                    <span className="text-emerald-500 font-semibold mt-0.5">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="p-5 border border-amber-100/70 bg-amber-50/20 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Areas to Improve</span>
              </div>
              <ul className="space-y-2">
                {analysisResult.weaknesses.map((wk: string, idx: number) => (
                  <li key={idx} className="text-xs text-amber-800 flex items-start gap-1.5 leading-relaxed">
                    <span className="text-amber-500 font-semibold mt-0.5">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Suggestions Checklist */}
          {analysisResult.suggestions && (
            <div className="p-5 border border-violet-100/50 bg-slate-50/30 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-violet-900 font-bold text-sm">
                <Lightbulb className="w-5 h-5 text-violet-600 fill-violet-50" />
                <span>Action Suggestions & Recommendations</span>
              </div>
              <div className="space-y-3">
                {analysisResult.suggestions.map((sg: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start leading-relaxed text-xs text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <span>{sg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
