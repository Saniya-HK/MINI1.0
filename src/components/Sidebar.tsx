import React from "react";
import { 
  LayoutDashboard, 
  UserCircle, 
  BrainCircuit, 
  FileCheck, 
  Award, 
  Briefcase, 
  BookOpen, 
  MessageSquare,
  LogOut,
  Sparkles
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  aiActive: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout, aiActive }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Career Profile", icon: UserCircle },
    { id: "assessments", label: "Assessments", icon: BrainCircuit },
    { id: "resume", label: "Resume Analyzer", icon: FileCheck },
    { id: "skills", label: "Skills", icon: Award },
    { id: "jobs", label: "Job Matches", icon: Briefcase },
    { id: "goals", label: "Learning Goals", icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0" id="sidebar-container">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-850 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full opacity-90 shadow-sm"></div>
        </div>
        <div>
          <span className="text-white font-bold text-md tracking-tight block">Career Advisor</span>
        </div>
      </div>

      {/* User Info Capsule */}
      {currentUser && (
        <div className="px-6 py-4 border-b border-slate-850 bg-slate-800/10">
          <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase block">Signed In As</span>
          <span className="font-semibold text-slate-200 text-xs block truncate mt-0.5">{currentUser.name}</span>
          <span className="text-xs text-slate-400 block truncate">{currentUser.email}</span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-left ${
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-550/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-450" : "text-slate-500 group-hover:text-slate-350"}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Pro Tip Unit */}
      <div className="p-4 m-4 mt-auto rounded-2xl bg-slate-800/40 border border-slate-800/60" id="sidebar-pro-tip">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Pro Advisory</span>
        <p className="text-[11px] text-slate-500 mt-1 leading-normal italic">
          "Your career readiness improved this week. Keep optimizing."
        </p>
      </div>

      {/* Log Out Actions Footer */}
      {currentUser && (
        <div className="p-4 border-t border-slate-850 bg-slate-950/20">
          <button
            onClick={onLogout}
            id="btn-logout"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
