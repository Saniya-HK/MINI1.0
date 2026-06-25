import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Loader2, 
  Tag,
  CheckCircle2
} from "lucide-react";
import { LearningGoal } from "../types";

interface LearningGoalsViewProps {
  token: string | null;
}

export default function LearningGoalsView({ token }: LearningGoalsViewProps) {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Form input keys
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [skills, setSkills] = useState("");
  const [milesInput, setMilesInput] = useState("");
  const [milestones, setMilestones] = useState<string[]>([]);

  const [adding, setAdding] = useState(false);

  const loadGoals = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/goals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error("Error loading learning goals list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [token]);

  const handleAddMilestone = () => {
    if (milesInput.trim() && !milestones.includes(milesInput.trim())) {
      setMilestones([...milestones, milesInput.trim()]);
      setMilesInput("");
    }
  };

  const removeMilestoneFromForm = (item: string) => {
    setMilestones(milestones.filter(x => x !== item));
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !token) return;

    try {
      setAdding(true);
      // If milestones list is empty, write default items
      const targetMiles = milestones.length > 0 ? milestones : ["Read documentation", "Build sample prototype"];
      
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          targetDate,
          skills,
          milestones: targetMiles
        })
      });

      if (res.ok) {
        setTitle("");
        setTargetDate("");
        setSkills("");
        setMilestones([]);
        loadGoals(); // refresh list
      }
    } catch (err) {
      console.error("Error setting goal:", err);
    } finally {
      setAdding(false);
    }
  };

  // Toggle milestone completion state on a goal
  const handleToggleMilestone = async (goal: LearningGoal, mileIndex: number) => {
    if (!token) return;

    // Split pipeline string
    const miles = goal.milestones.split("|");
    const mParts = miles[mileIndex].split(":");
    const currentStatus = mParts[1] || "Not Started";
    const nextStatus = currentStatus === "Completed" ? "Not Started" : "Completed";

    miles[mileIndex] = `${mParts[0]}:${nextStatus}`;
    const newMilesString = miles.join("|");

    // Automatically resolve parent goal status index
    const allDone = miles.every(m => m.endsWith(":Completed"));
    const anyDone = miles.some(m => m.endsWith(":Completed"));
    const finalStatus = allDone ? "Completed" : (anyDone ? "In Progress" : "Not Started");

    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: finalStatus,
          milestones: newMilesString
        })
      });

      if (res.ok) {
        // Local state update
        setGoals(goals.map(g => g.id === goal.id ? { ...g, status: finalStatus, milestones: newMilesString } : g));
      }
    } catch (err) {
      console.error("Error updating milestone state:", err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setGoals(goals.filter(g => g.id !== id));
      }
    } catch (err) {
      console.error("Error deleting target goal:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="goals-view-root">
      
      {/* Header bar */}
      <div className="border-b border-gray-100 pb-5" id="goals-header border">
        <h2 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">Active Learning Goals</h2>
        <p className="text-sm text-gray-500">Formulate structured roadmaps and mark off competency milestones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Set custom learning goals */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between" id="goal-adder-card">
          <div className="space-y-5">
            <div className="pb-3 border-b border-slate-50 flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-gray-800 text-sm font-sans">Set Roadmap Goal</h3>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 block tracking-wider">Goal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete NodeJS Backend course"
                  id="goal-title-input"
                  className="w-full px-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 block tracking-wider">Completion Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  id="goal-date-input"
                  className="w-full px-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400 text-gray-700 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 block tracking-wider">Targeted Skills (Pipe-joined)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Node.js | REST APIs | Docker"
                  id="goal-skills-input"
                  className="w-full px-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400"
                />
              </div>

              {/* Milestones Add Section */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 block tracking-wider">Milestones Checklist</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={milesInput}
                    onChange={(e) => setMilesInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMilestone())}
                    placeholder="e.g. Complete REST module"
                    id="milestone-text-input"
                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="p-2.5 bg-slate-50 border border-gray-200 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* Form milestones list */}
                <div className="flex flex-col gap-1.5 pt-1.5">
                  {milestones.map((item) => (
                    <div key={item} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-3 py-1 text-xs rounded-xl text-gray-650">
                      <span className="truncate max-w-[80%]">{item}</span>
                      <button type="button" onClick={() => removeMilestoneFromForm(item)} className="text-gray-400 hover:text-red-655 font-bold">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={adding || !title.trim()}
                id="btn-set-goal-roadmap"
                className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-violet-100"
              >
                {adding ? "Formulating Roadmap..." : "Set Goal"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: Core Timelines Progress lists */}
        <div className="lg:col-span-2 space-y-6" id="learning-goals-list-container">
          {loading ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
              <p className="text-xs text-gray-400 mt-2">Loading learning target roadmaps...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center space-y-2 shadow-sm">
              <p className="text-sm text-gray-400 font-medium">No learning goals defined.</p>
              <p className="text-xs text-gray-300">Set a specific skill progress goal in the left panel to organize your milestones timeline.</p>
            </div>
          ) : (
            <div className="space-y-6" id="goals-list-timeline">
              {goals.map((g) => {
                const milestonesList = g.milestones ? g.milestones.split("|") : [];
                const skillsList = g.skills ? g.skills.split("|").filter(s => s.trim().length > 0) : [];
                
                const doneCount = milestonesList.filter(m => m.endsWith(":Completed")).length;
                const progressPercent = milestonesList.length > 0 
                  ? Math.round((doneCount / milestonesList.length) * 100) 
                  : 0;

                return (
                  <div key={g.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4 hover:border-slate-200 transition-all" id={`goal-card-${g.id}`}>
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 max-w-[70%]">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Roadmap Goal</span>
                        <h4 className="font-extrabold text-gray-850 text-sm tracking-tight leading-tight">{g.title}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status badge */}
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          g.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                          g.status === "In Progress" ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-600"
                        }`}>
                          {g.status}
                        </span>

                        {/* Delete action button */}
                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          className="p-1 text-slate-400 hover:text-red-700 border border-transparent hover:border-red-50 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Slider Bar */}
                    <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                        <span>Milestones Completed</span>
                        <span className="font-mono text-violet-700">{doneCount}/{milestonesList.length} ({progressPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                        <div className="bg-violet-600 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Target skills badges */}
                    {skillsList.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <div className="flex flex-wrap gap-1 leading-none">
                          {skillsList.map(sk => (
                            <span key={sk} className="text-[9px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100/30 uppercase tracking-wider">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive milestones timeline checkbox checklist */}
                    <div className="space-y-2 border-t border-slate-50 pt-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Timeline Checklists:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="milestones-checkboxes-grid">
                        {milestonesList.map((m, idx) => {
                          const parts = m.split(":");
                          if (parts.length < 2) return null;
                          const mText = parts[0];
                          const mDone = parts[1] === "Completed";
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => handleToggleMilestone(g, idx)}
                              className={`p-2 rounded-xl text-left text-xs transition-all flex items-center gap-2.5 border group ${
                                mDone 
                                  ? "bg-slate-50/40 border-slate-100 text-slate-400 text-xs shadow-none" 
                                  : "bg-white border-slate-200 text-slate-700 hover:border-violet-300"
                              }`}
                            >
                              {mDone ? (
                                <CheckSquare className="w-4.5 h-4.5 text-violet-600 shrink-0 fill-violet-50" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-gray-300 group-hover:text-violet-500 shrink-0" />
                              )}
                              <span className={mDone ? "line-through text-gray-400 font-light" : "font-medium"}>{mText}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

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
