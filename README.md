# Financial MCP Server & Client — Enhanced

A demonstration project showcasing how to build a **Model Context Protocol (MCP)**
server and client in a financial data domain. It illustrates all three core MCP
primitives — **Tools**, **Resources**, and **Prompts** — using simulated financial
data modeled after real-world patterns (REST APIs, Kafka topics, batch CSV files).

---

## Overview

| File | Role |
|------|------|
| `financial_mcp_server_enhanced.py` | The MCP **server** — exposes financial data via tools, resources, and prompts |
| `financial_mcp_client_enhanced.py` | The MCP **client** — connects to the server and runs 15 structured demo scenarios |

---

## How They Interact

The two files communicate over **stdio transport** (standard input/output piped between
processes). When you run the client, it spawns the server as a subprocess, establishes
an MCP session, and then exercises every capability the server exposes.

```
[ financial_mcp_client_enhanced.py ]
           │
           │  spawns subprocess via stdio
           ▼
[ financial_mcp_server_enhanced.py ]
           │
           │  responds with JSON-RPC over MCP protocol
           ▼
[ Client reads responses and prints formatted output ]
```

Communication flow:
1. Client calls `StdioServerParameters` pointing at the server script.
2. `stdio_client()` launches the server process and opens read/write pipes.
3. `ClientSession.initialize()` performs the MCP handshake.
4. Client sends requests (list tools, call tool, read resource, get prompt).
5. Server handles each request, applies entitlement checks, and returns JSON results.
6. Client prints all results to the terminal in a formatted, sectioned layout.

---

## The Three MCP Primitives

### 1. Tools — Model-Controlled Actions
Tools are callable functions that an AI model decides when to invoke. Each tool
enforces an **entitlement check** using an `api_key` parameter before returning data.

| Tool | Description | Data Source Simulated |
|------|-------------|----------------------|
| `get_stock_price` | Fetch current price for a ticker (AAPL, GOOGL, MSFT, TSLA) | REST API (AlphaVantage) |
| `get_portfolio_summary` | Retrieve holdings and total value for a client | Batch CSV file |
| `calculate_returns` | Compute gain/loss and ROI across all positions in a portfolio | REST + Batch combined |
| `check_entitlement` | Inspect what tools and resources an API key can access | Internal entitlements matrix |

### 2. Resources — App-Controlled Context Data
Resources are read-only data endpoints identified by URIs. They are loaded into context
on demand — the application (or user) decides when, not the AI model.

| Resource URI | Contents |
|-------------|----------|
| `topic://data_catalog` | Full topic registry — all topics, their status, data sources, and coverage |
| `topic://stock_prices` | All available ticker symbols and their current prices |
| `topic://portfolio_analytics` | Available client IDs, names, and holding counts |
| `topic://market_sentiment` | Metadata for an **inactive** topic (pending integration) |
| `topic://risk_metrics` | VaR, beta, volatility, and correlation matrix metadata |

### 3. Prompts — Reusable Interaction Templates
Prompts are parameterized instruction templates that guide an LLM through a structured
workflow. They are user-initiated and designed to be reused across sessions.

| Prompt | Purpose | Key Parameter |
|--------|---------|--------------|
| `financial_analysis_prompt` | Step-by-step stock analysis workflow | `ticker` (e.g., `AAPL`) |
| `portfolio_health_check_prompt` | Portfolio review: performance, concentration risk, rebalancing | `client_id` (e.g., `CLIENT_001`) |
| `data_discovery_prompt` | Explores the data catalog to surface what topics/data are available | _(none)_ |

---

## Entitlement System

The server has a built-in **API key entitlements matrix** that gates access to both
tools and resources.

| API Key | Entitled Tools | Entitled Resources |
|---------|---------------|-------------------|
| `API_KEY_ALPHA` | All 4 tools | `stock_prices`, `portfolio_analytics`, `risk_metrics` |
| `API_KEY_BETA` | `get_stock_price` only | `stock_prices` only |
| `API_KEY_GAMMA` | None | None |

Unauthorized calls return a `401 Unauthorized` error. Unknown tickers or client IDs
return `404 Not Found`. This mirrors real-world financial API access control patterns.

---

## Simulated Data

The server ships with hard-coded in-memory data representing what would come from live
systems in production:

**Stocks:** AAPL ($189.45), GOOGL ($142.87), MSFT ($425.60), TSLA ($238.92)

**Portfolios:**
- `CLIENT_001` — Acme Corp: 100 shares AAPL + 50 shares GOOGL (~$32K total value)
- `CLIENT_002` — TechVentures Inc: 200 shares MSFT + 75 shares TSLA (~$102K total value)

---

## Demo Scenarios (15 total)

The client runs 15 sequential demos organized into three sections:

**Tools Demos (Demos 1–7)**
1. Entitled key fetches AAPL stock price
2. Entitled key fetches portfolio for CLIENT_001
3. Calculate portfolio returns for CLIENT_001
4. Calculate portfolio returns for CLIENT_002
5. Restricted key (`API_KEY_BETA`) attempts `calculate_returns` → **401 expected**
6. Check tools entitled to `API_KEY_BETA`
7. Check resources entitled to `API_KEY_ALPHA`

**Resources Demos (Demos 8–12)**
8. Load full data catalog (topic registry)
9. Load stock prices resource
10. Load portfolio analytics resource
11. Load market sentiment resource (inactive topic)
12. Load risk metrics resource

**Prompts Demos (Demos 13–15)**
13. Get `financial_analysis_prompt` for AAPL
14. Get `portfolio_health_check_prompt` for CLIENT_002
15. Get `data_discovery_prompt` (topic catalog exploration)

---

## Running the Project

**Prerequisites:**
```bash
pip install mcp
```

**Run (client spawns server automatically):**
```bash
python financial_mcp_client_enhanced.py
```

The client handles subprocess lifecycle — you do not need to start the server separately.

---

## Architecture Notes

- **Transport:** `stdio` — server runs as a child process; communication is over pipes.
  In production this could be replaced with `sse` (HTTP/SSE) or `websocket` transport.
- **Data layer:** All data is in-memory dicts. In production these would be replaced
  with REST API calls, Kafka consumer reads, or database queries.
- **Entitlements:** Checked inside each tool at runtime. In production this would
  integrate with an identity/authorization service (e.g., OAuth scopes, LDAP groups).
- **MCP Framework:** Built with `FastMCP` (`mcp.server.fastmcp`), which uses Python
  decorators (`@mcp.tool()`, `@mcp.resource()`, `@mcp.prompt()`) to register handlers.

---

## File Structure

```
PythonProject/
├── financial_mcp_server_enhanced.py   # MCP server — tools, resources, prompts
├── financial_mcp_client_enhanced.py   # MCP client — 15 demo scenarios
├── README.md                          # This file
└── ...
```
