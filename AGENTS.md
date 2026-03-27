# AGENTS.md - Financial MCP Demo Project

i## Architecture Overview
This is a Model Context Protocol (MCP) demonstration project with client-server architecture:
- **Server** (`financial_mcp_server_enhanced.py`): Exposes financial data via MCP primitives using FastMCP
- **Client** (`financial_mcp_client_enhanced.py`): Runs 15 demo scenarios, spawning server as subprocess via stdio transport
- **Communication**: JSON-RPC over stdio pipes (production could use SSE/WebSocket)

## Key Components
- **Tools**: Model-controlled actions (4 total) - `get_stock_price`, `get_portfolio_summary`, `calculate_returns`, `check_entitlement`
- **Resources**: App-controlled data (5 total) - `topic://` URIs for data catalog, stock prices, portfolios, etc.
- **Prompts**: Reusable templates (3 total) - `financial_analysis_prompt`, `portfolio_health_check_prompt`, `data_discovery_prompt`

## Data Layer
Simulated in-memory data mimicking production sources:
- Stocks: AAPL, GOOGL, MSFT, TSLA with prices
- Portfolios: CLIENT_001 (Acme Corp), CLIENT_002 (TechVentures Inc)
- Topics: Registry of data sources (REST APIs, Kafka, batch CSV)

## Entitlement System
API key-based access control:
- `API_KEY_ALPHA`: Full access to all tools/resources
- `API_KEY_BETA`: Limited to stock prices only
- `API_KEY_GAMMA`: No access
Always include `api_key` parameter in tool calls; returns 401/404 errors for unauthorized access.

## Development Workflow
```bash
# Install dependencies
pip install -r requirements_mcp_demo.txt

# Run full demo (client spawns server automatically)
python financial_mcp_client_enhanced.py

# Server can be run standalone for debugging
python financial_mcp_server_enhanced.py
```

## Code Patterns
- **Decorators**: Use `@mcp.tool()`, `@mcp.resource()`, `@mcp.prompt()` to register handlers
- **Entitlement Checks**: Always check `ENTITLEMENTS[api_key]["tools/resources"]` at start of tools
- **Error Handling**: Return `{"error": "401 Unauthorized"}` or `{"error": "404 Not Found"}` dicts
- **JSON Responses**: Tools return structured dicts; resources return `json.dumps()` strings
- **Simulated Sources**: Comment data origins (e.g., "REST API (simulated AlphaVantage)")

## Key Files
- `financial_mcp_server_enhanced.py`: Core server with all MCP primitives
- `financial_mcp_client_enhanced.py`: Demo client running 15 scenarios
- `Quasi_Agent.py`: Separate litellm-based code generation script (unrelated to MCP)
- `requirements_mcp_demo.txt`: Dependencies (mcp>=1.0.0, anthropic, python-dotenv)

## Testing Approach
Client runs comprehensive demos covering:
- Entitled vs unauthorized tool calls
- All resource URIs
- Prompt template usage
- Error scenarios (401/404)

## Integration Points
- **MCP Framework**: Built on `mcp.server.fastmcp.FastMCP`
- **Transport**: Stdio for demos; production uses SSE/WebSocket
- **Data Sources**: In-memory simulation of REST APIs, Kafka topics, batch files</content>
<parameter name="filePath">C:\Users\tesfa\PycharmProjects\PythonProject\AGENTS.md
