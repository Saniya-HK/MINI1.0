import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Award, 
  Target, 
  BookOpen, 
  Brain, 
  FileText, 
  Briefcase, 
  MessageSquare,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { CareerProfile, SkillItem, LearningGoal } from "../types";

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  token: string | null;
}

export default function DashboardView({ setActiveTab, token }: DashboardViewProps) {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [completedGoalsCount, setCompletedGoalsCount] = useState("0/0");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Fetch user profile
      const profRes = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
      }

      // Fetch user skills
      const skillsRes = await fetch("/api/skills", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setSkills(skillsData);
      }

      // Fetch user goals
      const goalsRes = await fetch("/api/goals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setGoals(goalsData);
        
        const completed = goalsData.filter((g: any) => g.status === "Completed").length;
        setCompletedGoalsCount(`${completed}/${goalsData.length}`);
      }
    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Calculate dynamic skill average level text
  const getAvgSkillText = () => {
    if (skills.length === 0) return "—";
    const totalProgress = skills.reduce((sum, s) => sum + s.progress, 0);
    const avg = totalProgress / skills.length;
    if (avg >= 80) return "Advanced";
    if (avg >= 55) return "Intermediate";
    return "Beginner";
  };

  // Convert progress score to level text
  const getReadinessLevel = (score: number) => {
    if (!score || score < 40) return "—";
    if (score >= 80) return "Advanced";
    if (score >= 60) return "Intermediate";
    return "Beginner";
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="dashboard-view-root">
      
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white border border-slate-800 shadow-lg" id="welcome-banner">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-15">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor" className="text-indigo-500">
            <circle cx="50" cy="50" r="50"/>
          </svg>
        </div>
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-indigo-600/15 blur-[85px] rounded-full"></div>
        <div className="absolute -left-4 -top-4 w-36 h-36 bg-teal-500/10 blur-[60px] rounded-full"></div>

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Smart Career Agent</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white leading-tight">Welcome back! 👋</h1>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            Your personalized career intelligence platform. Track progress, discover job alignments, and test your readiness with AI-powered diagnostics.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => setActiveTab("profile")} 
              id="dashboard-banner-view-profile"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all duration-150 shadow-sm cursor-pointer"
            >
              <span>View Career Profile</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of four core metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="stats-cards-grid">
        {/* Employability Score */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employability Score</span>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 tracking-tighter">
              {profile && profile.headline ? `${profile.employabilityScore}` : "—"}
            </span>
            {profile && profile.headline && <span className="text-xs text-slate-400 font-medium font-mono">/100</span>}
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: profile && profile.headline ? `${profile.employabilityScore}%` : "0%" }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Profile completeness score</span>
          </div>
        </div>

        {/* Career Readiness */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Competency level</span>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {profile && profile.headline ? getReadinessLevel(profile.careerReadinessScore) : "—"}
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                style={{ width: profile && profile.headline ? `${profile.careerReadinessScore || 60}%` : "0%" }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Assessed readiness level</span>
          </div>
        </div>

        {/* Avg Skill Level */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Skill Level</span>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {skills.length > 0 ? getAvgSkillText() : "—"}
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                style={{ width: skills.length > 0 ? "75%" : "0%" }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Based on {skills.length} skills</span>
          </div>
        </div>

        {/* Goals Completed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal Progress</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">{completedGoalsCount}</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: "50%" }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Roadmap milestone index</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4" id="quick-actions-section">
        <h3 className="text-slate-900 font-bold text-lg tracking-tight">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Action 1 */}
          <button 
            onClick={() => setActiveTab("assessments")}
            id="action-card-assessments"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center gap-3 transition-all duration-150 hover:-translate-y-1 hover:shadow-md cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-650 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-indigo-500 fill-indigo-100" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">Take Assessment</span>
          </button>

          {/* Action 2 */}
          <button 
            onClick={() => setActiveTab("resume")}
            id="action-card-resume"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center gap-3 transition-all duration-150 hover:-translate-y-1 hover:shadow-md cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-650 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-indigo-500 fill-indigo-100" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">Analyze Resume</span>
          </button>

          {/* Action 3 */}
          <button 
            onClick={() => setActiveTab("jobs")}
            id="action-card-jobs"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center gap-3 transition-all duration-150 hover:-translate-y-1 hover:shadow-md cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-650 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-indigo-500 fill-indigo-100" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">Find Jobs</span>
          </button>
        </div>
      </div>

      {/* Two cards section showing Top Skills & Learning Goals preview lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-bottom-grid">
        {/* Top Skills Card Preview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between" id="skills-preview-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm tracking-tight uppercase">Top Skills</h4>
            <button 
              onClick={() => setActiveTab("skills")} 
              id="skills-preview-view-all"
              className="text-[11px] text-indigo-600 font-bold flex items-center gap-1 hover:underline"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 py-6 flex flex-col items-center justify-center h-full">
            {skills.length === 0 ? (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-400">No verified skills detected yet</p>
                <button 
                  onClick={() => setActiveTab("skills")} 
                  id="dashboard-quick-add-skills"
                  className="px-4 py-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all uppercase tracking-wider"
                >
                  Add Skills
                </button>
              </div>
            ) : (
              <div className="w-full space-y-4 text-left">
                {skills.slice(0, 3).map((s) => (
                  <div key={s.id} className="space-y-1.5 animate-slideUp">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{s.name}</span>
                      <span className="text-slate-400 uppercase font-mono tracking-wider font-bold text-[9px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{s.category} ({s.level})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${s.progress}%` }}></div>
                    </div>
                  </div>
                ))}
                {skills.length > 3 && (
                  <p className="text-center text-[11px] text-slate-400 font-bold pt-2">
                    + {skills.length - 3} more skills listed
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Learning Goals Card Preview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between" id="goals-preview-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm tracking-tight uppercase">Learning Goals</h4>
            <button 
              onClick={() => setActiveTab("goals")} 
              id="goals-preview-view-all"
              className="text-[11px] text-indigo-600 font-bold flex items-center gap-1 hover:underline"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 py-6 flex flex-col items-center justify-center h-full">
            {goals.length === 0 ? (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-400">No structured learning objectives set</p>
                <button 
                  onClick={() => setActiveTab("goals")} 
                  id="dashboard-quick-set-goals"
                  className="px-4 py-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all uppercase tracking-wider"
                >
                  Set Goals
                </button>
              </div>
            ) : (
              <div className="w-full space-y-3 text-left">
                {goals.slice(0, 3).map((g) => {
                  const milestonesList = g.milestones ? g.milestones.split("|") : [];
                  const doneCount = milestonesList.filter(m => m.endsWith(":Completed")).length;
                  return (
                    <div key={g.id} className="p-3 border border-slate-155 rounded-2xl hover:bg-slate-50 transition-all">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-800 text-xs truncate max-w-[70%]">{g.title}</span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          g.status === "Completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          g.status === "In Progress" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-50 text-slate-500 border border-slate-150"
                        }`}>{g.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                        <span>Target: {g.targetDate}</span>
                        <span className="font-semibold">{doneCount}/{milestonesList.length} Milestones</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
