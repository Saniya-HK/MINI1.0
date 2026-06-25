import React, { useEffect, useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Bookmark, 
  Send,
  Search
} from "lucide-react";
import { JobMatch } from "../types";

interface JobMatchesViewProps {
  token: string | null;
}

export default function JobMatchesView({ token }: JobMatchesViewProps) {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  
  // Local state to track Saved/Applied states
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  // Search keyword filter
  const [search, setSearch] = useState("");

  const loadJobMatches = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Run match calculations
      const res = await fetch("/api/jobs/generate-matches", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Error generating job compatibility list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobMatches();
  }, [token]);

  const handleRecalculate = async () => {
    try {
      setMatching(true);
      await loadJobMatches();
    } finally {
      setMatching(false);
    }
  };

  const toggleSaveJob = (id: string) => {
    if (savedJobIds.includes(id)) {
      setSavedJobIds(savedJobIds.filter(x => x !== id));
    } else {
      setSavedJobIds([...savedJobIds, id]);
    }
  };

  const handleApplyJob = (id: string) => {
    if (!appliedJobIds.includes(id)) {
      setAppliedJobIds([...appliedJobIds, id]);
    }
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => {
    return job.title.toLowerCase().includes(search.toLowerCase()) || 
           job.company.toLowerCase().includes(search.toLowerCase()) || 
           (job.skillsRequired && job.skillsRequired.some(s => s.toLowerCase().includes(search.toLowerCase())));
  });

  return (
    <div className="space-y-8 animate-fadeIn" id="job-matches-view-root">
      
      {/* Header element */}
      <div className="border-b border-gray-100 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4" id="jobs-header">
        <div>
          <h2 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">Personalized Job Matches</h2>
          <p className="text-sm text-gray-500">Discover top vacancies structured to utilize your registered active skills</p>
        </div>
        <div>
          <button
            onClick={handleRecalculate}
            disabled={matching}
            id="btn-recalculate-matches"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-50 border border-violet-100/30 transition-all cursor-pointer"
          >
            {matching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recalculating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-violet-100 text-violet-700" />
                <span>Recalculate Match Index</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Row with input search bar */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-gray-50 shadow-sm" id="jobs-filter-unit">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search matching job listings, companies or specific skills..."
            id="input-jobs-search"
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          <p className="text-sm text-gray-400 mt-3 font-light">Comparing skills profile indices with job requirements database...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-2">
          <p className="text-sm text-gray-400">No vacancy matches found matching "{search}"</p>
          <p className="text-xs text-gray-300">Try modifying your search or add more verified competencies in the "Skills" tab to qualify!</p>
        </div>
      ) : (
        /* Jobs List container */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="job-listings-grid-container">
          {filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const isApplied = appliedJobIds.includes(job.id);
            
            // Define score styling
            const score = job.matchPercentage || 50;
            const scoreColor = 
              score >= 80 ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
              score >= 50 ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-slate-50 border-slate-100 text-slate-600";

            return (
              <div key={job.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all h-[340px]" id={`job-card-${job.id}`}>
                
                {/* Header detail */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-extrabold text-gray-850 text-sm tracking-tight leading-tight">{job.title}</h3>
                      <span className="text-xs font-semibold text-slate-500 leading-none">{job.company}</span>
                    </div>
                    
                    {/* Compatibility Score badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${scoreColor}`}>
                      {score}% Match
                    </span>
                  </div>

                  {/* Metadata labels row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-400 font-medium text-[10px]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="capitalize">{job.location} ({job.type})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span className="capitalize">{job.experience} level</span>
                    </div>
                  </div>
                </div>

                {/* Brief description column */}
                <p className="text-[11px] text-gray-500 leading-relaxed font-light line-clamp-2 my-2.5">
                  {job.description}
                </p>

                {/* Match Requirements Tags checklist */}
                <div className="space-y-1.5 border-t border-gray-50 pt-2.5">
                  {job.matchingSkills && job.matchingSkills.length > 0 && (
                    <div className="flex items-start flex-wrap gap-1">
                      <span className="text-[9px] font-bold text-emerald-600 uppercase mt-1 shrink-0">Matching:</span>
                      <div className="flex flex-wrap gap-1 leading-none">
                        {job.matchingSkills.map(sk => (
                          <span key={sk} className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/30 uppercase tracking-wider">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.missingSkills && job.missingSkills.length > 0 && (
                    <div className="flex items-start flex-wrap gap-1">
                      <span className="text-[9px] font-bold text-amber-600 uppercase mt-1 shrink-0">Missing:</span>
                      <div className="flex flex-wrap gap-1 leading-none">
                        {job.missingSkills.map(sk => (
                          <span key={sk} className="text-[9px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/30 uppercase tracking-wider">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom actions strip */}
                <div className="flex items-center justify-between gap-3 border-t border-gray-50 pt-4 mt-2">
                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    id={`btn-save-job-${job.id}`}
                    className={`p-2 rounded-xl border transition-all ${
                      isSaved 
                        ? "bg-violet-50 text-violet-600 border-violet-100" 
                        : "bg-white text-gray-400 border-gray-200 hover:text-gray-700 hover:bg-slate-50"
                    }`}
                    title={isSaved ? "Saved Job" : "Save Job Opportunity"}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-violet-600" : ""}`} />
                  </button>

                  <button
                    onClick={() => handleApplyJob(job.id)}
                    disabled={isApplied}
                    id={`btn-apply-job-${job.id}`}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      isApplied 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold" 
                        : "bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 fill-emerald-100 text-emerald-600" />
                        <span>Application Sent</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply and Express Interest</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
