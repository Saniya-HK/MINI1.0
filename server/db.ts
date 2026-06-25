import fs from "fs";
import path from "path";

// Define the root storage location
const DATA_DIR = path.join(process.cwd(), "data");

// Helper to ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Function to parse CSV lines safely
function parseCSV(content: string): any[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
  const results: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Regex to split on commas not inside quotes
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    
    // Fallback split if matches fail to parse simple row
    let list = line.split(",");
    if (matches.length === headers.length) {
      list = matches;
    }
    
    const obj: any = {};
    headers.forEach((header, index) => {
      let value = list[index] ? list[index].trim() : "";
      // Clean leading and trailing double quotes or whitespace
      value = value.replace(/^"|"$/g, '').trim();
      obj[header] = value;
    });
    results.push(obj);
  }
  return results;
}

export class JsonCollection<T extends { id: string }> {
  private filePath: string;
  private csvPath: string | null;
  private defaultData: T[];

  constructor(filename: string, csvFilename: string | null = null, defaultData: T[] = []) {
    this.filePath = path.join(DATA_DIR, `${filename}.json`);
    this.csvPath = csvFilename ? path.join(process.cwd(), "datasets", csvFilename) : null;
    this.defaultData = defaultData;
    this.init();
  }

  private init() {
    if (!fs.existsSync(this.filePath)) {
      let initialData: T[] = [...this.defaultData];
      
      // Attempt to load and parse CSV if provided
      if (this.csvPath && fs.existsSync(this.csvPath)) {
        try {
          const csvContent = fs.readFileSync(this.csvPath, "utf-8");
          const parsed = parseCSV(csvContent);
          
          initialData = parsed.map((item, index) => {
            // Clean up list properties split by pipeline (|)
            const cleaned: any = {};
            for (const key in item) {
              const val = item[key];
              if (typeof val === "string" && val.includes("|")) {
                cleaned[key] = val.split("|").map(s => s.trim());
              } else {
                cleaned[key] = val;
              }
            }
            if (!cleaned.id) {
              cleaned.id = `${Date.now()}_${index}`;
            }
            return cleaned as T;
          });
        } catch (err) {
          console.error(`Error seeding CSV ${this.csvPath}:`, err);
        }
      }
      
      this.writeList(initialData);
    }
  }

  private readList(): T[] {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(content) as T[];
    } catch {
      return [];
    }
  }

  private writeList(list: T[]) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(list, null, 2), "utf-8");
    } catch (err) {
      console.error(`Error writing to ${this.filePath}:`, err);
    }
  }

  public getAll(): T[] {
    return this.readList();
  }

  public find(predicate: (item: T) => boolean): T[] {
    return this.readList().filter(predicate);
  }

  public findOne(predicate: (item: T) => boolean): T | null {
    const found = this.readList().find(predicate);
    return found || null;
  }

  public insert(item: Omit<T, "id"> & { id?: string }): T {
    const list = this.readList();
    const id = item.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newItem = { ...item, id } as T;
    list.push(newItem);
    this.writeList(list);
    return newItem;
  }

  public update(id: string, updates: Partial<T>): T | null {
    const list = this.readList();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    list[index] = { ...list[index], ...updates };
    this.writeList(list);
    return list[index];
  }

  public delete(id: string): boolean {
    const list = this.readList();
    const filtered = list.filter(item => item.id !== id);
    if (filtered.length === list.length) return false;
    this.writeList(filtered);
    return true;
  }
}

// Instantiate Collections matching all Database Schemas
export const db = {
  users: new JsonCollection<any>("users", "users.csv"),
  careerProfiles: new JsonCollection<any>("career_profiles", "career_profiles.csv"),
  assessments: new JsonCollection<any>("assessments", "assessments.csv"),
  resumeAnalysis: new JsonCollection<any>("resume_analysis", "resume_analysis.csv"),
  learningGoals: new JsonCollection<any>("learning_goals", "learning_goals.csv"),
  skills: new JsonCollection<any>("skills", "skills.csv"),
  jobs: new JsonCollection<any>("jobs", "job_listings.csv"),
  courses: new JsonCollection<any>("courses", "courses.csv"),
  chatHistory: new JsonCollection<any>("chat_history", null), // Empty initially
};

console.log("Local JSON-backed DB systems loaded successfully with CSV-seeded values.");
