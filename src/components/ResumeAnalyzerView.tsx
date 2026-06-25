import React, { useEffect, useState } from "react";
import { 
  FileCheck, 
  UploadCloud, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Plus, 
  Loader2,
  Trash2
} from "lucide-react";
import { ResumeAnalysis } from "../types";

interface ResumeAnalyzerViewProps {
  token: string | null;
}

// Single SVG Circular gauge component for exact circular matching
function CircularGauge({ value, label, size = 68, strokeWidth = 5.5, color = "stroke-indigo-550" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-1.5" id={`gauge-${label.toLowerCase()}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Grey track circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            className="stroke-slate-100 fill-transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Active colored percentage arc circle */}
          <circle
            className={`fill-transparent transition-all duration-1000 ease-out ${color}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        {/* Percentage text centered inside */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-extrabold text-gray-800 font-mono">{value}%</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function ResumeAnalyzerView({ token }: ResumeAnalyzerViewProps) {
  const [history, setHistory] = useState<ResumeAnalysis[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeAnalysis | null>(null);
  
  // Form input fields
  const [file, setFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (autoSelect = true) => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/resumes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (data.length > 0 && autoSelect) {
          // Auto-select latest
          setActiveAnalysis(data[data.length - 1]);
        }
      }
    } catch (err) {
      console.error("Error fetching resumes resume analysis list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/resumes/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setActiveAnalysis(data);
        setFile(null); // reset file
        fetchHistory(false); // reload but don't force select first
      } else {
        alert("Upload error. Check network connectivity.");
      }
    } catch (err) {
      console.error("Error analyzing uploaded file:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="resume-view-root">
      
      {/* Header element */}
      <div className="border-b border-gray-100 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4" id="resume-header">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-sans animate-fadeIn">Resume Analyzer</h2>
          <p className="text-sm text-gray-500">Conduct comprehensive ATS matching alignment diagnostics</p>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase">Analysis History:</label>
            <select
              value={activeAnalysis?.id || ""}
              onChange={(e) => {
                const found = history.find(h => h.id === e.target.value);
                if (found) setActiveAnalysis(found);
              }}
              id="select-past-analyses"
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white focus:outline-none text-slate-700"
            >
              {history.map(item => (
                <option key={item.id} value={item.id}>
                  {item.fileName} ({item.overallScore}%)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Drag/Drop and Upload Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6" id="resume-upload-card">
          <div className="pb-3 border-b border-secondary flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 text-sm">Submit New Resume</h3>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-5 pt-4">
            
                  <div className="space-y-1.5 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-slate-600 text-xs">
              <p className="font-semibold text-slate-900 uppercase tracking-wider text-[10px]">Resume Analysis Guidance</p>
              <p className="leading-relaxed text-[11px]">
                Your resume will be analyzed against your current recommended career path in the profile and the skills you have registered in the platform.
              </p>
            </div>

            {/* Drag and Drop Box */}
            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive ? "border-indigo-500 bg-indigo-50/10" : "border-slate-200 hover:border-indigo-200"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              id="resume-drag-drop-zone"
            >
              <UploadCloud className="w-10 h-10 text-gray-400 mx-auto fill-slate-50" />
              <p className="text-xs text-gray-600 font-medium mt-3">
                {file ? file.name : "Drag and drop your resume here, or"}
              </p>
              
              {!file ? (
                <label className="mt-2 block cursor-pointer">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all inline-block">
                    Browse File
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                </label>
              ) : (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-2 text-[10px] uppercase font-bold text-red-600 hover:underline inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Selected</span>
                </button>
              )}
              
              <p className="text-[10px] text-gray-400 mt-2 font-light">
                Supports PDF, DOC, DOCX, or TXT formats (Max 5MB)
              </p>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              id="btn-trigger-analyze"
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning with ATS rules...</span>
                </>
              ) : (
                <>
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Dashboard: Render visual percentages if available */}
        <div className="lg:col-span-2 space-y-6" id="resume-analysis-output-container">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-400 mt-3 font-light">Loading analysis metrics...</p>
            </div>
          ) : !activeAnalysis ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-sm text-slate-400">No resumes analyzed yet.</p>
              <p className="text-xs text-slate-350">Upload your target resume file in the panel on the left to review your live ratings.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-slideUp">
              
              {/* Gauges Grid Card matching Screenshot 6 */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5" id="resume-gauges-block">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-slate-100 text-xs gap-3">
                  <div>
                    <span className="font-bold text-slate-700">Scan Match Report: {activeAnalysis.fileName}</span>
                    {activeAnalysis.recommendedCareer && (
                      <p className="text-[11px] text-slate-500 mt-1">Recommended Career Path: <span className="font-semibold text-slate-700">{activeAnalysis.recommendedCareer}</span></p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-bold text-indigo-600 uppercase tracking-widest text-[10px]">
                    <Sparkles className="w-4 h-4 fill-indigo-100 text-indigo-500" />
                    <span>Calculated Alignment Diagnostics</span>
                    {typeof activeAnalysis.careerMatchScore === "number" && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Career Fit: {activeAnalysis.careerMatchScore}%</span>
                    )}
                  </div>
                </div>

                {/* 7 Circular Progress Meters Row */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 pt-1" id="gauges-container-horizontal">
                  <CircularGauge value={activeAnalysis.overallScore} label="Overall" color="stroke-indigo-600" size={72} />
                  <CircularGauge value={activeAnalysis.atsScore} label="ATS Score" color="stroke-indigo-400" />
                  <CircularGauge value={activeAnalysis.formatScore} label="Format" color="stroke-teal-500" />
                  <CircularGauge value={activeAnalysis.skillsScore} label="Skills" color="stroke-amber-500" />
                  <CircularGauge value={activeAnalysis.educationScore} label="Education" color="stroke-emerald-500" />
                  <CircularGauge value={activeAnalysis.experienceScore} label="Experience" color="stroke-rose-500" />
                  <CircularGauge value={activeAnalysis.keywordsScore} label="Keywords" color="stroke-indigo-300" />
                </div>
              </div>

              {/* Analysis Lists Block (Strengths, Weaknesses, suggestions) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="resume-feedback-grid">
                
                {/* Strengths Card */}
                <div className="bg-white border border-emerald-100 rounded-3xl p-5 space-y-3" id="resume-strengths-card">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600 fill-emerald-50" />
                    <span>Resume Strengths</span>
                  </div>
                  <ul className="space-y-2.5">
                    {activeAnalysis.strengths.map((str: string, index: number) => (
                      <li key={index} className="text-[11px] text-emerald-800 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-500 font-bold mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas to Improve Warnings */}
                <div className="bg-white border border-amber-100 rounded-3xl p-5 space-y-3" id="resume-weaknesses-card">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                    <span>Areas to Improve</span>
                  </div>
                  <ul className="space-y-2.5">
                    {activeAnalysis.weaknesses.map((wk: string, index: number) => (
                      <li key={index} className="text-[11px] text-amber-800 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Suggestions Timeline card */}
              <div className="bg-white border border-slate-205 shadow-sm rounded-3xl p-6 space-y-4" id="resume-suggestions-card">
                <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-2">
                  <Lightbulb className="w-5 h-5 text-indigo-550 fill-indigo-50" />
                  <span className="uppercase tracking-wider text-xs">Improvement Roadmap Details</span>
                </div>
                <div className="space-y-4">
                  {activeAnalysis.suggestions.map((sg: string, index: number) => (
                    <div key={index} className="flex gap-3 items-start text-xs text-slate-600 leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-indigo-100">
                        {index + 1}
                      </div>
                      <span>{sg}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Extraction Box */}
              <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl space-y-5" id="extracted-missing-skills">
                
                {/* Extracted Skills badges */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Extracted Skills Tagged:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeAnalysis.extractedSkills.map((sk: string) => (
                      <span key={sk} className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-800 text-[10px] font-medium uppercase tracking-wider">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills alert markers */}
                <div className="space-y-2 border-t border-gray-50 pt-3">
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest block">Target Missing Skills (Highly Suited):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeAnalysis.careerMissingSkills || activeAnalysis.missingSkills || []).map((sk: string) => (
                      <span key={sk} className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-700 text-[10px] font-medium uppercase tracking-wider">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
