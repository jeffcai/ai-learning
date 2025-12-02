# Claude Skills (MCP) for Enterprise Architecture

This project demonstrates how to package "Skills" for Claude using the **Model Context Protocol (MCP)**. 

In this context, a "Skill" is a tool exposed by an MCP Server that Claude can invoke to perform actions or retrieve information.

## Concept: Enterprise Architect Agent
This MCP server provides Claude with the skills of an Enterprise Architect, allowing it to:
1.  **Manage ADRs**: Create and retrieve Architecture Decision Records.
2.  **Generate Diagrams**: Create C4 model templates in Mermaid/PlantUML.
3.  **Check Compliance**: Verify if a technology is on the approved "Tech Radar".

## Structure
- `server.py`: The entry point for the MCP server.
- `tools/`: Individual modules implementing the logic for each skill.
- `templates/`: Markdown and diagram templates used by the tools.

## How to Use
1.  Install dependencies: `pip install mcp`
2.  Run the server: `python server.py`
3.  Configure Claude Desktop to use this server.

## Configuration (claude_desktop_config.json)
```json
{
  "mcpServers": {
    "enterprise-architect": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}
```
