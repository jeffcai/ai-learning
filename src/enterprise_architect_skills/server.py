from mcp.server.fastmcp import FastMCP
import os
from tools import adr_manager, tech_radar

# Initialize the MCP Server
# This "server" is what provides the "skills" to Claude
mcp = FastMCP("Enterprise Architect Skills")

# --- Skill 1: Architecture Decision Records (ADR) ---

@mcp.tool()
def create_adr(title: str, status: str = "Proposed") -> str:
    """
    Creates a new Architecture Decision Record (ADR) file from a template.
    
    Args:
        title: The title of the decision (e.g., "Use Postgres for User Data")
        status: The status of the decision (Proposed, Accepted, Rejected)
    """
    return adr_manager.create_adr_file(title, status)

@mcp.tool()
def list_adrs() -> str:
    """Lists all existing ADRs in the workspace."""
    return adr_manager.list_adrs()

# --- Skill 2: Technology Radar (Compliance) ---

@mcp.tool()
def check_tech_compliance(technology: str) -> str:
    """
    Checks if a specific technology is approved for use in the enterprise.
    Returns the status (Adopt, Trial, Assess, Hold) and notes.
    """
    return tech_radar.check_status(technology)

# --- Skill 3: Diagramming ---

@mcp.tool()
def get_c4_template(level: str = "system") -> str:
    """
    Returns a Mermaid.js template for a C4 diagram.
    
    Args:
        level: The C4 level ("context", "container", "component")
    """
    if level == "context":
        return """
C4Context
    title System Context diagram for Internet Banking System
    Enterprise_Boundary(b0, "BankBoundary0") {
        Person(customerA, "Banking Customer", "A customer of the bank, with personal bank accounts.")
        System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")
    }
    System_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")
    Rel(customerA, SystemAA, "Uses")
    Rel(SystemAA, SystemE, "Uses")
"""
    return "Template not found for this level."

if __name__ == "__main__":
    mcp.run()
