import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import ProfileView from "./components/ProfileView";
import AssessmentsView from "./components/AssessmentsView";
import ResumeAnalyzerView from "./components/ResumeAnalyzerView";
import SkillsView from "./components/SkillsView";
import JobMatchesView from "./components/JobMatchesView";
import LearningGoalsView from "./components/LearningGoalsView";
import MentorView from "./components/MentorView";
import { User } from "./types";
import { Loader2 } from "lucide-react";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("sca_session_token"));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [aiActive, setAiActive] = useState(false);
  const [aiModeText, setAiModeText] = useState("Local Rule-based Matching");
  
  const [initLoading, setInitLoading] = useState(true);

  // Probe authentication session and AI compatibility status on boot
  useEffect(() => {
    const bootstrapSca = async () => {
      try {
        // 1. Probe AI API capability status
        const statusRes = await fetch("/api/status");
        if (statusRes.ok) {
          const statusVal = await statusRes.json();
          setAiActive(statusVal.aiActive);
          setAiModeText(statusVal.mode);
        }
      } catch (err) {
        console.warn("Express endpoint state probe failed:", err);
      }

      // 2. Fetch logged-in user profile if token is saved
      const savedToken = localStorage.getItem("sca_session_token");
      if (savedToken) {
        try {
          const meRes = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (meRes.ok) {
            const meVal = await meRes.json();
            setCurrentUser(meVal.user);
          } else {
            // Sessions expired
            localStorage.removeItem("sca_session_token");
            setToken(null);
          }
        } catch {
          // Fallback offline session
          setCurrentUser({
            id: "student",
            name: "Saniya HK",
            email: "student@example.com",
            role: "student"
          });
        }
      }
      setInitLoading(false);
    };

    bootstrapSca();
  }, [token]);

  const handleLoginSuccess = (newToken: string, userData: any) => {
    localStorage.setItem("sca_session_token", newToken);
    setToken(newToken);
    setCurrentUser(userData);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("sca_session_token");
    setToken(null);
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  if (initLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Assembling modules...</span>
      </div>
    );
  }

  // Not authenticated? Show the beautiful login deck
  if (!token || !currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Render matching view panel
  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView setActiveTab={setActiveTab} token={token} />;
      case "profile":
        return <ProfileView token={token} />;
      case "assessments":
        return <AssessmentsView token={token} />;
      case "resume":
        return <ResumeAnalyzerView token={token} />;
      case "skills":
        return <SkillsView token={token} />;
      case "jobs":
        return <JobMatchesView token={token} />;
      case "goals":
        return <LearningGoalsView token={token} />;
      case "mentor":
        return <MentorView token={token} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} token={token} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900" id="smart-advisor-app-container">
      
      {/* Sidebar Core column */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        aiActive={aiActive}
      />

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden" id="main-content-flow">
        
        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-8 relative" id="scrollable-content-window">
          {renderActiveView()}
        </div>

      </main>
    </div>
  );
}
