import React, { useEffect, useState } from "react";
import { 
  BrainCircuit, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  Award, 
  HelpCircle,
  TrendingUp,
  Loader2,
  CheckCircle,
  RotateCcw
} from "lucide-react";
import { AssessmentAttempt } from "../types";

interface AssessmentsViewProps {
  token: string | null;
}

export default function AssessmentsView({ token }: AssessmentsViewProps) {
  const [history, setHistory] = useState<AssessmentAttempt[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Questionnaire state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedResult, setLastSubmittedResult] = useState<AssessmentAttempt | null>(null);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      setLoadingHistory(true);
      const res = await fetch("/api/assessments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Error setting assessment history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // Questions Database
  const tests: Record<string, {
    title: string;
    description: string;
    questions: Array<{ id: string; text: string; options: Array<{ label: string; value: string }> }>;
  }> = {
    RIASEC: {
      title: "Holland RIASEC Career Interest Test",
      description: "Evaluate your interest categories matching technical (Realistic), investigative, artistic, social, enterprising, or conventional careers.",
      questions: [
        {
          id: "realistic_1",
          text: "Do you enjoy writing structural logic, working with databases, or repairing software scripts?",
          options: [
            { label: "Yes, I highly enjoy that", value: "5" },
            { label: "Somewhat / Neutral", value: "3" },
            { label: "No, I find it draining", value: "1" }
          ]
        },
        {
          id: "investigative_1",
          text: "Do you enjoy researching algorithms, exploring computer vision models, or resolving mathematical code?",
          options: [
            { label: "Yes, researching systems is my passion", value: "5" },
            { label: "I can do it occasionally", value: "3" },
            { label: "No, not interested", value: "1" }
          ]
        },
        {
          id: "artistic_1",
          text: "Do you enjoy designing high-fidelity layouts, sketching digital interfaces, or choosing custom color presets?",
          options: [
            { label: "Yes, designing screens is highly creative for me", value: "5" },
            { label: "Neutral comfort", value: "3" },
            { label: "No, I prefer hard systems/backend and CLI", value: "1" }
          ]
        },
        {
          id: "enterprising_1",
          text: "Do you enjoy pitching product solutions, leading coordinate sprints, and organizing product dashboards?",
          options: [
            { label: "Yes, leading and pitching ideas fits me", value: "5" },
            { label: "I can participate if needed", value: "3" },
            { label: "No, I just want to write code", value: "1" }
          ]
        }
      ]
    },
    Aptitude: {
      title: "Aptitude & Logical Reasoning Quiz",
      description: "Verify your Quantitative, Logical, and Verbal computer science core reasoning foundations.",
      questions: [
        {
          id: "apt_1",
          text: "Analyze the sequence: 2, 6, 12, 20, 30, what number comes next?",
          options: [
            { label: "42 (Sequence is n² + n)", value: "correct" },
            { label: "38", value: "wrong" },
            { label: "40", value: "wrong" },
            { label: "44", value: "wrong" }
          ]
        },
        {
          id: "apt_2",
          text: "A web crawler traverses 60 client pages per minute. How many seconds does it take to crawl 1 single page?",
          options: [
            { label: "1 second", value: "correct" },
            { label: "6 seconds", value: "wrong" },
            { label: "10 seconds", value: "wrong" },
            { label: "0.1 seconds", value: "wrong" }
          ]
        },
        {
          id: "apt_3",
          text: "If all Developers code and some coders compile, are some developers guaranteed to compile?",
          options: [
            { label: "No, it cannot be determined with certainty", value: "correct" },
            { label: "Yes, with absolute certainty", value: "wrong" }
          ]
        }
      ]
    },
    Personality: {
      title: "Professional Personality Index",
      description: "Determine your collaborative traits, conscientiousness index, and adaptability inside scaling agile engineering sprints.",
      questions: [
        {
          id: "openness",
          text: "I adjust quickly to shifting technical specifications and enjoy learning modern systems over mature routines.",
          options: [
            { label: "Strongly Agree", value: "5" },
            { label: "Agree", value: "4" },
            { label: "Neutral / Disagree", value: "2" }
          ]
        },
        {
          id: "conscientiousness",
          text: "I document my code modules systematically, track tasks meticulously on boards, and complete sprints on schedule.",
          options: [
            { label: "Strongly Agree", value: "5" },
            { label: "Agree", value: "4" },
            { label: "Neutral / Disagree", value: "2" }
          ]
        }
      ]
    },
    "Skill Gap": {
      title: "Core Framework Skill Gap Quiz",
      description: "Perform a gap inspection of your comfort level across modern full-stack web and cloud systems.",
      questions: [
        {
          id: "gap_react",
          text: "Rate your current understanding of React component state management & custom hook lifecycle methods:",
          options: [
            { label: "Advanced (I write reusable triggers)", value: "5" },
            { label: "Intermediate (I understand state/effects)", value: "3" },
            { label: "Beginner (I have barely used React)", value: "1" }
          ]
        },
        {
          id: "gap_node",
          text: "Rate your experience designing backend REST APIs, Express route controls, and handling JSON requests:",
          options: [
            { label: "Advanced (I construct secure token routers)", value: "5" },
            { label: "Intermediate (I can build basic routes)", value: "3" },
            { label: "Beginner (No backend node exposure)", value: "1" }
          ]
        },
        {
          id: "gap_cloud",
          text: "Rate your current exposure to AWS core services, Google Cloud scaling VPCs, or Docker orchestration:",
          options: [
            { label: "Advanced (I build production cloud pipelines)", value: "5" },
            { label: "Intermediate (I can launch static servers)", value: "3" },
            { label: "Beginner (Haven't used cloud instances yet)", value: "1" }
          ]
        }
      ]
    }
  };

  const handleStartTest = (type: string) => {
    setActiveTest(type);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setLastSubmittedResult(null);
  };

  const handleSelectAnswer = (qId: string, val: string) => {
    setAnswers({
      ...answers,
      [qId]: val
    });
  };

  const handleNext = () => {
    const activeTestQuestions = tests[activeTest!].questions;
    if (currentQuestionIndex < activeTestQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question completed, trigger submit
      submitTest();
    }
  };

  const submitTest = async () => {
    if (!token || !activeTest) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: activeTest,
          answers
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLastSubmittedResult(data);
        fetchHistory(); // refresh list
      }
    } catch (err) {
      console.error("Error submitting test:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveTest(null);
    setLastSubmittedResult(null);
    setAnswers({});
  };

  // Convert answers text string representation to clean display lines
  const renderScoreDetails = (answersStr: string) => {
    return answersStr.split("|").map((item, idx) => {
      const parts = item.split(":");
      if (parts.length < 2) return null;
      return (
        <div key={idx} className="flex justify-between items-center text-xs text-slate-600 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
          <span className="font-semibold text-slate-700">{parts[0]}</span>
          <span className="font-mono text-violet-600 font-bold">{parts[1]}</span>
        </div>
      );
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="assessments-view-root">
      
      {/* Header bar */}
      <div className="border-b border-gray-100 pb-5" id="assessments-header">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Assessments Center</h2>
        <p className="text-sm text-gray-500">Gauge your analytical aptitude and discover career alignment</p>
      </div>

      {/* Main interactive testing layout */}
      {!activeTest ? (
        <div className="space-y-8">
          
          {/* List of four test options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="assessments-option-list">
            {Object.entries(tests).map(([key, config]) => {
              const pastAttempts = history.filter(h => h.type === key);
              const latestScore = pastAttempts.length > 0 ? pastAttempts[pastAttempts.length - 1].score : null;
              
              return (
                <div key={key} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-violet-100 hover:shadow-md transition-all flex flex-col justify-between h-[230px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-1 rounded-full bg-violet-50 text-[10px] uppercase font-bold text-violet-600 tracking-wider">
                        {key} Quiz
                      </div>
                      {latestScore !== null && (
                        <span className="text-xs font-semibold bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                          Completed: {latestScore}%
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 text-md mt-3 leading-tight font-sans">{config.title}</h3>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed h-[60px] overflow-hidden truncate whitespace-normal">
                      {config.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleStartTest(key)}
                    id={`start-test-${key}`}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all cursor-pointer"
                  >
                    <span>{latestScore !== null ? "Retake Test" : "Begin Assessment"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Past History Table Component */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4" id="assessments-history-card">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
              <Award className="w-5 h-5 text-violet-600" />
              <h4 className="font-bold text-gray-800 text-md">Past Assessment Records</h4>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No past assessments recorded. Choose one of the tests above to calibrate your career score!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">Metric Score</th>
                      <th className="py-3 px-2">Date Taken</th>
                      <th className="py-3 px-4">Recommendations / Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b border-gray-50 text-gray-700 hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-2 font-bold text-gray-900">{h.type}</td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2 py-0.5 rounded-full font-mono font-bold ${
                            h.score >= 80 ? "bg-emerald-50 text-emerald-700" :
                            h.score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                          }`}>{h.score}%</span>
                        </td>
                        <td className="py-3.5 px-2 text-gray-400 font-mono">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 leading-normal max-w-xs truncate" title={h.recommendations}>
                          {h.recommendations}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active questionnaire view screen */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 max-w-xl mx-auto space-y-6 animate-scaleIn" id="active-questionnaire-card">
          
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wider">Quiz Mode</span>
              <h3 className="font-bold text-gray-800 text-sm font-sans">{tests[activeTest].title}</h3>
            </div>
            <button 
              onClick={handleReset}
              className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-gray-500 hover:text-gray-900"
              title="Cancel quiz"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {!lastSubmittedResult ? (
            /* Running Questionnaire Stepper */
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Question {currentQuestionIndex + 1} of {tests[activeTest].questions.length}</span>
                  <span>{Math.round(((currentQuestionIndex) / tests[activeTest].questions.length) * 100)}% Completed</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-violet-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex) / tests[activeTest].questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Active question */}
              <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100/30">
                <div className="flex items-start gap-1.5 font-semibold text-gray-800 text-xs">
                  <HelpCircle className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                  <span>{tests[activeTest].questions[currentQuestionIndex].text}</span>
                </div>
              </div>

              {/* Multi-choice options list */}
              <div className="space-y-3">
                {tests[activeTest].questions[currentQuestionIndex].options.map((opt) => {
                  const qId = tests[activeTest].questions[currentQuestionIndex].id;
                  const isChecked = answers[qId] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectAnswer(qId, opt.value)}
                      className={`w-full text-left p-4 rounded-xl border text-xs leading-normal transition-all duration-150 flex items-center justify-between ${
                        isChecked 
                          ? "bg-violet-600 border-violet-600 text-white font-medium shadow-sm" 
                          : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isChecked ? "border-white bg-white/20" : "border-slate-300 bg-white"
                      }`}>
                        {isChecked && <span className="w-2 h-2 rounded-full bg-violet-600"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!answers[tests[activeTest].questions[currentQuestionIndex].id]}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  {currentQuestionIndex === tests[activeTest].questions.length - 1 ? (
                    submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      "Submit Assessment"
                    )
                  ) : (
                    <>
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            /* Results Presentation after submitting */
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-md shadow-emerald-100">
                  <CheckCircle className="w-8 h-8 fill-emerald-100 text-emerald-600" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-md font-sans">Assessment Calibrated!</h4>
                <p className="text-xs text-gray-500">Your profile indices have been successfully customized.</p>
              </div>

              {/* Metrics score details */}
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50/50 p-6 rounded-2xl border border-violet-100/40 space-y-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-violet-800 tracking-wider">Overall Validity Index</span>
                  <p className="text-4xl font-extrabold text-violet-950 mt-1">{lastSubmittedResult.score}%</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-violet-100/50">
                  {renderScoreDetails(lastSubmittedResult.answers)}
                </div>
              </div>

              {/* Recommendations capsule */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex gap-1.5 items-center text-xs font-bold text-gray-800">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  <span>Strategic Advisor Recommendations:</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mt-2">
                  {lastSubmittedResult.recommendations}
                </p>
              </div>

              {/* Close button */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-slate-50 text-gray-600 text-xs font-semibold cursor-pointer"
                >
                  Back to Assessments
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
