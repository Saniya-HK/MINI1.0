export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface CareerProfile {
  id: string;
  userId: string;
  headline: string;
  location: string;
  workPreference: 'Remote' | 'On-site' | 'Hybrid';
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior' | 'Lead';
  bio: string;
  careerGoals: string;
  technicalSkills: string[];
  softSkills: string[];
  certifications: string[];
  interests: string[];
  preferredRoles: string[];
  employabilityScore: number;
  careerReadinessScore: number;
  recommendedCareer?: string;
  recommendedCareerSkills?: string[];
}

export interface SkillItem {
  id: string;
  userId: string;
  name: string;
  category: 'technical' | 'soft' | 'tool' | 'framework' | 'language';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  type: 'RIASEC' | 'Aptitude' | 'Personality' | 'Skill Gap';
  score: number;
  answers: string; // Combined format
  recommendations: string;
  createdAt: string;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  fileName: string;
  overallScore: number;
  atsScore: number;
  formatScore: number;
  skillsScore: number;
  educationScore: number;
  experienceScore: number;
  keywordsScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missingSkills: string[];
  extractedSkills: string[];
  recommendedCareer?: string;
  recommendedCareerSkills?: string[];
  careerMatchScore?: number;
  careerMissingSkills?: string[];
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'on-site' | 'hybrid' | string;
  experience: 'entry' | 'mid' | 'senior' | 'lead' | string;
  salary: string;
  skillsRequired: string[];
  description: string;
  matchPercentage?: number;
  missingSkills?: string[];
  matchingSkills?: string[];
  careerScore?: number;
  careerSkillMatches?: string[];
}

export interface LearningGoal {
  id: string;
  userId: string;
  title: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  skills: string; // pipe-joined
  milestones: string; // pipe-joined step definitions with active status
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
}
