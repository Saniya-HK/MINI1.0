#!/usr/bin/env python3
import json
import os
import sys

try:
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.model_selection import GridSearchCV, KFold
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.svm import SVR
    from xgboost import XGBRegressor
except Exception as exc:
    print(f"Missing Python ML dependency: {exc}", file=sys.stderr)
    sys.exit(1)

DATA_DIR = os.path.join(os.getcwd(), "datasets")
CAREER_PROFILES_PATH = os.path.join(DATA_DIR, "career_profiles.csv")
JOB_LISTINGS_PATH = os.path.join(DATA_DIR, "job_listings.csv")


def parse_pipe_list(value):
    if pd.isna(value):
        return []
    return [part.strip().lower() for part in str(value).split("|") if part.strip()]


def normalize_location(value):
    return str(value or "").strip().lower()


def experience_to_numeric(value):
    value = str(value or "").strip().lower()
    mapping = {
        "entry": 0,
        "mid": 1,
        "senior": 2,
        "lead": 3,
        "manager": 3,
    }
    for key, score in mapping.items():
        if key in value:
            return score
    return 0


def build_features(profile, job):
    profile_skills = {skill.strip().lower() for skill in profile.get("technicalSkills", []) if skill}
    job_skills = {skill.strip().lower() for skill in parse_pipe_list(job.get("skillsRequired", ""))}

    shared_skills = profile_skills.intersection(job_skills)
    job_type = str(job.get("type", "")).strip().lower()
    profile_pref = str(profile.get("workPreference", "")).strip().lower()
    job_location = normalize_location(job.get("location"))
    profile_location = normalize_location(profile.get("location"))

    return {
        "profile_skill_count": len(profile_skills),
        "job_skill_count": len(job_skills),
        "shared_skill_count": len(shared_skills),
        "skill_overlap_ratio": len(shared_skills) / max(1, len(job_skills)),
        "prefers_remote": 1 if profile_pref == "remote" else 0,
        "job_is_remote": 1 if job_type == "remote" else 0,
        "job_is_hybrid": 1 if job_type == "hybrid" else 0,
        "job_is_onsite": 1 if job_type in ["on-site", "onsite", "on site"] else 0,
        "experience_distance": abs(experience_to_numeric(profile.get("experienceLevel")) - experience_to_numeric(job.get("experience"))),
        "location_match": 1 if profile_location and profile_location in job_location else 0,
        "headline_count": len(str(profile.get("headline", "")).split()),
    }


def build_match_label(profile, job):
    job_skills = {skill.strip().lower() for skill in parse_pipe_list(job.get("skillsRequired", ""))}
    profile_skills = {skill.strip().lower() for skill in profile.get("technicalSkills", []) if skill}
    shared_count = len(profile_skills.intersection(job_skills))
    base_score = 100 * shared_count / max(1, len(job_skills))
    experience_match_bonus = 5 if experience_to_numeric(profile.get("experienceLevel")) == experience_to_numeric(job.get("experience")) else 0
    work_pref_bonus = 5 if (profile.get("workPreference", "")).strip().lower() == job.get("type", "").strip().lower() else 0
    return min(100.0, base_score + experience_match_bonus + work_pref_bonus)


def load_training_data():
    if not os.path.exists(CAREER_PROFILES_PATH) or not os.path.exists(JOB_LISTINGS_PATH):
        raise FileNotFoundError("Required dataset files not found in datasets/ folder.")

    profiles = pd.read_csv(CAREER_PROFILES_PATH, keep_default_na=False)
    jobs = pd.read_csv(JOB_LISTINGS_PATH, keep_default_na=False)

    records = []
    for _, profile_row in profiles.iterrows():
        profile = {
            "technicalSkills": parse_pipe_list(profile_row.get("technicalSkills", "")),
            "experienceLevel": profile_row.get("experienceLevel", "Entry Level"),
            "workPreference": profile_row.get("workPreference", "Remote"),
            "location": profile_row.get("location", ""),
            "headline": profile_row.get("headline", ""),
        }

        for _, job_row in jobs.iterrows():
            job = job_row.to_dict()
            features = build_features(profile, job)
            features["label"] = build_match_label(profile, job)
            records.append(features)

    training_df = pd.DataFrame(records)
    if training_df.empty:
        raise ValueError("No training samples could be built from the dataset.")

    return training_df


def train_model(estimator, param_grid, X, y):
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    search = GridSearchCV(estimator, param_grid, cv=cv, scoring="neg_mean_squared_error", n_jobs=-1, verbose=0)
    search.fit(X, y)
    return search.best_estimator_


def load_input_payload():
    payload_text = sys.stdin.read()
    if not payload_text:
        raise ValueError("No input payload received.")
    try:
        return json.loads(payload_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON payload: {exc}") from exc


def predict_for_jobs(models, payload_jobs, profile):
    predictions = {}
    rows = []
    job_ids = []
    for job in payload_jobs:
        rows.append(build_features(profile, job))
        job_ids.append(job.get("id", str(len(job_ids))))

    X = pd.DataFrame(rows)
    if X.empty:
        return predictions

    X_pred = X
    rf_pred = np.clip(models["rf"].predict(X_pred), 0, 100)
    xgb_pred = np.clip(models["xgb"].predict(X_pred), 0, 100)
    svm_pred = np.clip(models["svm"].predict(X_pred), 0, 100)
    ensemble_pred = np.clip(np.vstack([rf_pred, xgb_pred, svm_pred]).mean(axis=0), 0, 100)

    for idx, job_id in enumerate(job_ids):
        predictions[job_id] = {
            "rfScore": float(round(float(rf_pred[idx]), 2)),
            "xgbScore": float(round(float(xgb_pred[idx]), 2)),
            "svmScore": float(round(float(svm_pred[idx]), 2)),
            "ensembleScore": float(round(float(ensemble_pred[idx]), 2)),
        }

    return predictions


def main():
    try:
        payload = load_input_payload()
        profile = payload.get("profile") or {}
        payload_jobs = payload.get("jobs") or []

        training_df = load_training_data()
        X = training_df.drop(columns=["label"])
        y = training_df["label"]

        rf = train_model(
            RandomForestRegressor(random_state=42),
            {
                "n_estimators": [50, 100],
                "max_depth": [5, 10, None],
                "min_samples_split": [2, 5],
            },
            X,
            y,
        )

        xgb = train_model(
            XGBRegressor(random_state=42, verbosity=0, objective="reg:squarederror"),
            {
                "n_estimators": [50, 100],
                "max_depth": [3, 6],
                "learning_rate": [0.05, 0.1],
                "subsample": [0.7, 1.0],
            },
            X,
            y,
        )

        svm_pipeline = train_model(
            Pipeline([("scaler", StandardScaler()), ("svm", SVR())]),
            {
                "svm__kernel": ["rbf"],
                "svm__C": [0.5, 1.0, 2.0],
                "svm__gamma": ["scale", "auto"],
            },
            X,
            y,
        )

        models = {"rf": rf, "xgb": xgb, "svm": svm_pipeline}
        predictions = predict_for_jobs(models, payload_jobs, profile)

        output = {"results": predictions}
        print(json.dumps(output))
    except Exception as exc:
        print(f"Error running ensemble pipeline: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
