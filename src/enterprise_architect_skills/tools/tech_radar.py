# Mock database of approved technologies
TECH_RADAR = {
    "python": {"status": "Adopt", "notes": "Standard language for AI/ML and backend."},
    "react": {"status": "Adopt", "notes": "Standard for frontend."},
    "kubernetes": {"status": "Adopt", "notes": "Standard for orchestration."},
    "rust": {"status": "Trial", "notes": "Approved for high-performance components."},
    "php": {"status": "Hold", "notes": "Legacy only. Do not use for new projects."},
    "mongo": {"status": "Assess", "notes": "Evaluate for specific non-relational use cases."}
}

def check_status(technology: str) -> str:
    tech_key = technology.lower().strip()
    
    if tech_key in TECH_RADAR:
        info = TECH_RADAR[tech_key]
        return f"Technology: {technology}\nStatus: {info['status']}\nNotes: {info['notes']}"
    else:
        return f"Technology '{technology}' is not explicitly tracked in the Tech Radar. Default status: Assess."
