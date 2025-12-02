# Claude Skills & Architecture Research

## 1. What are "Claude Skills"?

Based on current ecosystem analysis, "Claude Skills" is **not** a distinct official product feature name (like "Alexa Skills"). Instead, it is a colloquial term likely referring to one of the following:

*   **Model Context Protocol (MCP) Servers**: This is the most likely meaning in a modern context. MCP allows you to create servers that expose "resources", "prompts", and **"tools"** to Claude. These tools effectively act as "skills" that Claude can use (e.g., "read database", "search git repo").
*   **Claude Tool Use (Function Calling)**: In the API context, defining client-side tools that Claude can decide to call is often referred to as giving the model "skills".
*   **Claude Code**: Anthropic's CLI tool which can be extended.

## 2. Claude Code Skills

"Claude Code" is a CLI tool for coding assistance. It integrates deeply with the **Model Context Protocol (MCP)**.
*   You "teach" Claude Code new skills by configuring it to connect to **MCP Servers**.
*   For example, connecting a "Postgres MCP Server" gives Claude Code the "skill" to query your database.

## 3. Claude Enterprise Architect

This likely refers to **architectural patterns** for deploying Claude in enterprise environments, rather than a specific software agent. Common patterns include:
*   **RAG (Retrieval Augmented Generation)**: Connecting Claude to internal knowledge bases.
*   **Agentic Workflows**: Using a "Router" LLM to delegate tasks to specific "Worker" agents (e.g., a Coding Agent, a Data Analysis Agent).
*   **MCP Ecosystem**: Using MCP as the universal connector for enterprise data sources.

## 4. Recommended Project Structure (MCP Server)

To provide "skills" to Claude (Desktop or Code), the standard way is to build an **MCP Server**.

### Python MCP Server Structure
```
my-claude-skills/
├── pyproject.toml       # Dependencies (mcp, etc.)
├── README.md
└── src/
    └── my_skills/
        ├── __init__.py
        ├── server.py    # Main entry point, defines the MCP server
        └── tools.py     # The actual "skills" (functions)
```

### Example `server.py` (Conceptual)
```python
from mcp.server.fastmcp import FastMCP

# Create the "Skill" Server
mcp = FastMCP("my-custom-skills")

@mcp.tool()
def calculate_roi(investment: float, return_amount: float) -> str:
    """Calculates Return on Investment as a percentage."""
    roi = ((return_amount - investment) / investment) * 100
    return f"ROI is {roi:.2f}%"

if __name__ == "__main__":
    mcp.run()
```

## 5. Conclusion

*   **Term**: "Claude Skills" ≈ **MCP Tools**.
*   **Implementation**: Build an **MCP Server**.
*   **Usage**: Configure Claude Desktop or Claude Code to connect to your MCP server.
