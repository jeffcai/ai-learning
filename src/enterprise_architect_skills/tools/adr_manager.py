import os
import datetime

ADR_DIR = "docs/adr"

def ensure_adr_dir():
    if not os.path.exists(ADR_DIR):
        os.makedirs(ADR_DIR)

def create_adr_file(title: str, status: str) -> str:
    ensure_adr_dir()
    
    # Generate a simple ID (e.g., 001) - simplified for demo
    existing_files = os.listdir(ADR_DIR)
    next_id = len(existing_files) + 1
    filename = f"{next_id:03d}-{title.lower().replace(' ', '-')}.md"
    filepath = os.path.join(ADR_DIR, filename)
    
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    
    content = f"""# {next_id}. {title}

Date: {date_str}

## Status
{status}

## Context
The issue that we are seeing is...

## Decision
We have decided to...

## Consequences
Positive:
* ...

Negative:
* ...
"""
    
    with open(filepath, "w") as f:
        f.write(content)
        
    return f"Successfully created ADR: {filepath}"

def list_adrs() -> str:
    ensure_adr_dir()
    files = sorted(os.listdir(ADR_DIR))
    if not files:
        return "No ADRs found."
    return "\n".join(files)
