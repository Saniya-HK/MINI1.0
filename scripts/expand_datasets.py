#!/usr/bin/env python3
import csv
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATASETS = ROOT / "datasets"
DATA = ROOT / "data"

JOB_TITLES = [
    "Full Stack Developer",
    "Software Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Cloud Architect",
    "UI/UX Designer",
    "Product Manager",
    "Cybersecurity Analyst",
    "Mobile App Developer",
    "Quality Assurance Engineer",
    "Business Analyst",
    "Technical Project Manager",
    "Systems Engineer",
    "Backend Engineer",
    "Frontend Developer",
    "AI Research Engineer",
    "Data Engineer",
    "Technical Support Engineer",
    "Network Engineer",
    "Database Administrator",
    "Blockchain Developer",
    "Site Reliability Engineer",
    "Embedded Systems Engineer",
    "Game Developer",
    "E-commerce Specialist",
    "Salesforce Developer",
    "Digital Marketing Specialist",
    "Cloud Security Engineer",
    "IoT Engineer"
]

COMPANIES = [
    "TechWave", "NexaSoft", "DataPulse", "CloudSpan", "DevSphere", "SecureByte", "AppForge",
    "Visionary Labs", "ByteCraft", "FutureLink", "InfinityWorks", "CodeCrafters", "QuantumWorks",
    "NovaFusion", "AI Nexus", "Skyline Systems", "BlueWave Tech", "NextGen Solutions", "SparksTech",
    "Vertex Innovations", "Pioneer Labs"
]

LOCATIONS = ["Remote", "On-site", "Hybrid", "Bengaluru", "New York", "San Francisco", "London", "Berlin", "Toronto", "Singapore"]
EXPERIENCE = ["entry", "mid", "senior", "lead"]
SALARIES = ["$50k - $70k", "$70k - $90k", "$80k - $110k", "$100k - $130k", "$120k - $150k", "$140k - $170k", "$160k - $190k"]
SKILLS_POOL = [
    "JavaScript", "TypeScript", "React.js", "Angular", "Vue.js", "Node.js", "Express.js", "Python", "Django", "Flask", "Java",
    "Spring Boot", "Kotlin", "Swift", "Objective-C", "C#", ".NET", "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis",
    "AWS/Cloud Services", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Terraform", "Git", "GitHub",
    "REST APIs", "GraphQL", "Machine Learning", "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "Data Engineering",
    "Big Data", "Spark", "Hadoop", "Cyber Security", "Network Security", "Linux", "Shell Scripting", "DevOps", "Jenkins",
    "Figma", "UI/UX Design", "HTML", "CSS", "Sass", "Bootstrap", "Tailwind CSS", "SEO", "Analytics", "Product Management"
]

PROFILE_HEADLINES = [
    "Aspiring Software Engineer", "Frontend Enthusiast", "Backend Specialist", "AI & ML Learner",
    "DevOps Practitioner", "Cloud Computing Student", "Cybersecurity Aspirant", "Data Science Explorer",
    "Product-focused Developer", "Software Architect in Training"
]

SOFT_SKILLS = [
    "Communication", "Teamwork", "Problem Solving", "Adaptability", "Critical Thinking",
    "Leadership", "Time Management", "Attention to Detail", "Creativity", "Collaboration"
]

CERTIFICATIONS = [
    "AWS Certified Cloud Practitioner", "Google Cloud Certified", "Oracle Java Certified", "Microsoft AZ-900",
    "Certified Scrum Master", "Cisco CCNA", "CompTIA Security+", "IBM Data Science Professional Certificate"
]

INTERESTS = [
    "Web Development", "AI/ML", "Cloud Computing", "Cyber Security", "Mobile Apps",
    "UI/UX", "Data Analytics", "Automation", "Open Source", "Blockchain"
]

PREFERRED_ROLES = [
    "Full-Stack Developer", "Frontend Developer", "Backend Developer", "Data Scientist",
    "DevOps Engineer", "Cloud Architect", "Product Manager", "QA Engineer"
]

SKILL_CATEGORIES = {
    "JavaScript": "language", "TypeScript": "language", "React.js": "framework", "Angular": "framework",
    "Vue.js": "framework", "Node.js": "framework", "Express.js": "framework", "Python": "language",
    "Django": "framework", "Flask": "framework", "Java": "language", "Spring Boot": "framework",
    "Kotlin": "language", "Swift": "language", "Objective-C": "language", "C#": "language",
    ".NET": "framework", "SQL": "technical", "MySQL": "technical", "PostgreSQL": "technical",
    "MongoDB": "technical", "Redis": "technical", "AWS/Cloud Services": "tool", "Azure": "tool",
    "Google Cloud": "tool", "Docker": "tool", "Kubernetes": "tool", "CI/CD": "technical",
    "Terraform": "tool", "Git": "tool", "GitHub": "tool", "REST APIs": "technical", "GraphQL": "technical",
    "Machine Learning": "technical", "TensorFlow": "framework", "PyTorch": "framework", "scikit-learn": "framework",
    "Pandas": "technical", "NumPy": "technical", "Big Data": "technical", "Spark": "technical", "Hadoop": "technical",
    "Cyber Security": "technical", "Network Security": "technical", "Linux": "tool", "Shell Scripting": "technical",
    "DevOps": "technical", "Jenkins": "tool", "Figma": "tool", "UI/UX Design": "technical",
    "HTML": "language", "CSS": "language", "Sass": "tool", "Bootstrap": "tool", "Tailwind CSS": "tool",
    "SEO": "technical", "Analytics": "technical", "Product Management": "technical"
}


def make_job(id_index):
    title = JOB_TITLES[id_index % len(JOB_TITLES)]
    company = COMPANIES[id_index % len(COMPANIES)]
    location = LOCATIONS[id_index % len(LOCATIONS)]
    type_choice = location if location in ["Remote", "On-site", "Hybrid"] else ("remote" if "Remote" in location else "on-site")
    if type_choice == "Remote":
        type_choice = "remote"
    if type_choice == "On-site":
        type_choice = "on-site"
    experience = EXPERIENCE[id_index % len(EXPERIENCE)]
    salary = SALARIES[id_index % len(SALARIES)]
    skills = SKILLS_POOL[id_index:id_index + 6]
    if len(skills) < 6:
        skills = SKILLS_POOL[id_index:] + SKILLS_POOL[:6-len(skills)]
    description = f"{title} role working on {company.lower()} engineering initiatives."
    return {
        "id": f"job_{id_index + 1}",
        "title": title,
        "company": company,
        "location": location,
        "type": type_choice,
        "experience": experience,
        "salary": salary,
        "skillsRequired": "|".join(skills),
        "description": description
    }


def make_profile(id_index):
    headline = PROFILE_HEADLINES[id_index % len(PROFILE_HEADLINES)]
    location = LOCATIONS[id_index % len(LOCATIONS)]
    work_pref = ["Remote", "On-site", "Hybrid"][id_index % 3]
    experience = ["Entry Level", "Mid Level", "Senior", "Lead"][id_index % 4]
    tech_skills = SKILLS_POOL[id_index:id_index + 8]
    if len(tech_skills) < 8:
        tech_skills += SKILLS_POOL[:8-len(tech_skills)]
    soft_skills = SOFT_SKILLS[id_index % len(SOFT_SKILLS):id_index % len(SOFT_SKILLS) + 3]
    certifications = CERTIFICATIONS[id_index % len(CERTIFICATIONS):id_index % len(CERTIFICATIONS) + 2] or [CERTIFICATIONS[0]]
    interests = INTERESTS[id_index % len(INTERESTS):id_index % len(INTERESTS) + 3]
    if len(interests) < 3:
        interests += INTERESTS[:3-len(interests)]
    preferred_roles = PREFERRED_ROLES[id_index % len(PREFERRED_ROLES):id_index % len(PREFERRED_ROLES) + 2]
    if len(preferred_roles) < 2:
        preferred_roles += PREFERRED_ROLES[:2-len(preferred_roles)]
    employability = min(100, 50 + (id_index * 2))
    readiness = min(100, employability + 5)

    return {
        "id": f"prof_{id_index + 1}",
        "userId": f"user_{id_index + 1}",
        "headline": headline,
        "location": location,
        "workPreference": work_pref,
        "experienceLevel": experience,
        "bio": f"{headline} with a strong interest in {interests[0]}.",
        "careerGoals": f"Become a leading professional in {preferred_roles[0]}.",
        "technicalSkills": "|".join(tech_skills),
        "softSkills": "|".join(soft_skills),
        "certifications": "|".join(certifications),
        "interests": "|".join(interests),
        "preferredRoles": "|".join(preferred_roles),
        "employabilityScore": employability,
        "careerReadinessScore": readiness
    }


def make_skills():
    skills = []
    idx = 1
    for skill in SKILLS_POOL:
        skills.append({
            "id": f"skill_{idx}",
            "userId": "student",
            "name": skill,
            "category": SKILL_CATEGORIES.get(skill, "technical"),
            "level": "Advanced" if idx % 3 == 0 else "Intermediate" if idx % 3 == 1 else "Beginner",
            "progress": 50 + (idx * 3 % 50)
        })
        idx += 1
    return skills


def write_csv(path, rows, fieldnames):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def main():
    DATASETS.mkdir(parents=True, exist_ok=True)
    DATA.mkdir(parents=True, exist_ok=True)

    jobs = [make_job(i) for i in range(40)]
    profiles = [make_profile(i) for i in range(20)]
    skills = make_skills()

    write_csv(DATASETS / "job_listings.csv", jobs, ["id", "title", "company", "location", "type", "experience", "salary", "skillsRequired", "description"])
    write_csv(DATASETS / "career_profiles.csv", profiles, ["id", "userId", "headline", "location", "workPreference", "experienceLevel", "bio", "careerGoals", "technicalSkills", "softSkills", "certifications", "interests", "preferredRoles", "employabilityScore", "careerReadinessScore"])
    write_csv(DATASETS / "skills.csv", skills, ["id", "userId", "name", "category", "level", "progress"])

    # Convert CSV-backed data into JSON storage used by the backend
    jobs_json = []
    for job in jobs:
        job_copy = job.copy()
        job_copy["skillsRequired"] = job_copy["skillsRequired"].split("|")
        jobs_json.append(job_copy)
    write_json(DATA / "jobs.json", jobs_json)

    profiles_json = []
    for profile in profiles:
        profile_copy = profile.copy()
        profile_copy["technicalSkills"] = profile_copy["technicalSkills"].split("|")
        profile_copy["softSkills"] = profile_copy["softSkills"].split("|")
        profile_copy["certifications"] = profile_copy["certifications"].split("|")
        profile_copy["interests"] = profile_copy["interests"].split("|")
        profile_copy["preferredRoles"] = profile_copy["preferredRoles"].split("|")
        profiles_json.append(profile_copy)
    write_json(DATA / "career_profiles.json", profiles_json)

    write_json(DATA / "skills.json", skills)
    print("Dataset expansion complete: 40 jobs, 20 profiles,", len(skills), "skills")

if __name__ == "__main__":
    main()
