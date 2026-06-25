import React, { useEffect, useState } from "react";
import { 
  Award, 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2, 
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  BookOpen
} from "lucide-react";
import { SkillItem } from "../types";

interface SkillsViewProps {
  token: string | null;
}

export default function SkillsView({ token }: SkillsViewProps) {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuggest, setLoadingSuggest] = useState(true);

  // Form input keys
  const [name, setName] = useState("");
  const [category, setCategory] = useState<any>("technical");
  const [level, setLevel] = useState<string>("Intermediate");
  const [progress, setProgress] = useState(65);
  
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSkillsAndSuggestions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/skills", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
    } finally {
      setLoading(false);
    }

    try {
      setLoadingSuggest(true);
      const suggestRes = await fetch("/api/skills/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (suggestRes.ok) {
        const suggestData = await suggestRes.json();
        setSuggestions(suggestData);
      }
    } catch (err) {
      console.error("Error fetching AI skill suggestions:", err);
    } finally {
      setLoadingSuggest(false);
    }
  };

  useEffect(() => {
    fetchSkillsAndSuggestions();
  }, [token]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !token) return;

    try {
      setAdding(true);
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          level,
          progress
        })
      });

      if (res.ok) {
        setName("");
        fetchSkillsAndSuggestions();
      }
    } catch (err) {
      console.error("Error adding skill:", err);
    } finally {
      setAdding(false);
    }
  };

  // Quick register recommended skill helper
  const handleQuickAdd = async (sName: string, sCat: string) => {
    if (!token) return;
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: sName,
          category: sCat,
          level: "Beginner",
          progress: 30
        })
      });
      if (res.ok) {
        fetchSkillsAndSuggestions();
      }
    } catch (err) {
      console.error("Quick registering skill failed:", err);
    }
  };

  const handleUpdateProgress = async (id: string, newProgress: number, updatedLevel: string) => {
    if (!token) return;
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/skills/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ progress: newProgress, level: updatedLevel })
      });
      if (res.ok) {
        // Local sync
        setSkills(skills.map(s => s.id === id ? { ...s, progress: newProgress, level: updatedLevel as any } : s));
      }
    } catch (err) {
      console.error("Error updating skill progress:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSkills(skills.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="skills-view-root">
      
      {/* Header boundary */}
      <div className="border-b border-gray-100 pb-5" id="skills-header">
        <h2 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">Skills & Competency Center</h2>
        <p className="text-sm text-gray-500">Benchmark your technical proficiencies and add recommended skills</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left components: Active Skill Lists & Add Skill Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add skill form card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4" id="skill-add-form-card">
            <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-550" />
              <h3 className="font-bold text-slate-800 text-sm font-sans">Add Verified Competency</h3>
            </div>

            <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Skill Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. React.js, TypeScript"
                  id="skill-name-input"
                  className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Category Type</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  id="skill-category-select"
                  className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white"
                >
                  <option value="technical">Technical Core</option>
                  <option value="framework">Framework / Library</option>
                  <option value="language">Programming Language</option>
                  <option value="tool">Tool / Utility</option>
                  <option value="soft">Soft Skill</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Proficiency Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  id="skill-level-select"
                  className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <span>Progress Rating</span>
                  <span className="font-mono text-indigo-600">{progress}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  id="skill-progress-range"
                  className="w-full h-2 rounded-lg bg-slate-100 cursor-pointer accent-indigo-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={adding || !name.trim()}
                  id="btn-add-verified-skill"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  {adding ? "Registering Competency..." : "Add Verified Skill"}
                </button>
              </div>
            </form>
          </div>

          {/* Active Skills Catalog Card list */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4" id="skill-catalog-card">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-550" />
                <h3 className="font-bold text-slate-800 text-sm font-sans">Active Verified Skills</h3>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-150">
                {skills.length} Skills Listed
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : skills.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                No active skills recorded yet. Fill out the form above or click recommended items from the AI Panel to seed your skill catalog!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="active-skills-collection-grid">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-4 border border-slate-200 rounded-2xl space-y-3 shadow-none hover:border-slate-350 transition-all bg-slate-50/20" id={`skill-card-${skill.id}`}>
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <h4 className="font-bold text-slate-850 text-sm">{skill.name}</h4>
                        <span className="text-[9px] uppercase font-extrabold text-slate-400 leading-none block mt-0.5 tracking-wider">
                          {skill.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <select
                          value={skill.level}
                          onChange={(e) => handleUpdateProgress(skill.id, skill.progress, e.target.value)}
                          className="text-[10px] px-2 py-0.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-600 focus:outline-none"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-1 text-slate-400 hover:text-red-750 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress sliders inside active cards to modify progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Proficiency progress:</span>
                        <span className="font-mono font-bold text-indigo-500">{skill.progress}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={skill.progress}
                          onChange={(e) => handleUpdateProgress(skill.id, parseInt(e.target.value), skill.level)}
                          className="flex-1 h-1.5 bg-slate-100 rounded-lg accent-indigo-500 outline-none cursor-pointer"
                        />
                        {updatingId === skill.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Recommended Panel matching Screenshot 8 style */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5" id="ai-recommendations-panel">
          <div className="pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-extrabold text-indigo-600 uppercase tracking-widest text-[10px]">
              <Sparkles className="w-4 h-4 fill-indigo-100 text-indigo-500" />
              <span>AI Market Recommendations</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Based on global tech standards & target role tags</p>
          </div>

          {loadingSuggest ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs text-slate-400 mt-2">Analyzing target parameters...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 leading-normal">
              No recommendations found yet. Configure a specific "Professional Title" under the Profile screen to trigger intelligence.
            </p>
          ) : (
            <div className="space-y-4" id="ai-suggestions-list">
              {suggestions.map((sug, idx) => {
                const alreadyRegistered = skills.some(s => s.name.toLowerCase() === sug.name.toLowerCase());
                return (
                  <div key={idx} className="p-4 border border-indigo-150 bg-slate-50/50 rounded-2xl space-y-2 relative overflow-hidden animate-fadeIn" id={`sug-${idx}`}>
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <span className="px-2 py-0.5 text-[9px] uppercase font-bold bg-indigo-50 text-indigo-700 rounded-md tracking-wider">
                          {sug.category}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs mt-1.5">{sug.name}</h4>
                      </div>
                      
                      {!alreadyRegistered ? (
                        <button
                          onClick={() => handleQuickAdd(sug.name, sug.category)}
                          className="px-2 py-1 text-[10px] font-bold text-indigo-600 bg-white border border-indigo-150 hover:bg-indigo-600 hover:text-white rounded-lg shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 inline-flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg border border-emerald-100">
                          <CheckCircle className="w-3.5 h-3.5 fill-emerald-50 text-emerald-500" />
                          <span>Added</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal pt-1 pl-0.5">
                      {sug.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
