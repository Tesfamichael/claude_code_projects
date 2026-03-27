"""
Enhanced Financial MCP Server with Tools, Resources, and Prompts
Demonstrates the three core MCP primitives:
- Tools: Model-controlled, called when the AI decides
- Resources: App-controlled, loaded into context on demand
- Prompts: User-controlled, reusable interaction templates
"""

import json
from datetime import datetime
from mcp.server.fastmcp import FastMCP

# Initialize the FastMCP server
mcp = FastMCP("Financial Data Server")

# ============================================================================
# SIMULATED DATA LAYER (In production: REST APIs, Kafka, batch files)
# ============================================================================

STOCK_DATA = {
    "AAPL": {"price": 189.45, "currency": "USD", "last_updated": "2025-03-26T14:30:00Z"},
    "GOOGL": {"price": 142.87, "currency": "USD", "last_updated": "2025-03-26T14:30:00Z"},
    "MSFT": {"price": 425.60, "currency": "USD", "last_updated": "2025-03-26T14:30:00Z"},
    "TSLA": {"price": 238.92, "currency": "USD", "last_updated": "2025-03-26T14:30:00Z"},
}

PORTFOLIO_DATA = {
    "CLIENT_001": {
        "name": "Acme Corp",
        "holdings": [
            {"ticker": "AAPL", "shares": 100, "purchase_price": 150.00},
            {"ticker": "GOOGL", "shares": 50, "purchase_price": 120.00},
        ],
        "total_value": 32272.50,
    },
    "CLIENT_002": {
        "name": "TechVentures Inc",
        "holdings": [
            {"ticker": "MSFT", "shares": 200, "purchase_price": 300.00},
            {"ticker": "TSLA", "shares": 75, "purchase_price": 180.00},
        ],
        "total_value": 102226.00,
    },
}

# Topics represent data catalogs or datasets available in the system
TOPIC_REGISTRY = {
    "stock_prices": {
        "active": True,
        "description": "Real-time stock price data for major tech companies",
        "data_sources": ["REST API: AlphaVantage", "Kafka: price-updates topic"],
        "last_updated": "2025-03-26T14:30:00Z",
        "coverage": ["AAPL", "GOOGL", "MSFT", "TSLA"],
    },
    "portfolio_analytics": {
        "active": True,
        "description": "Portfolio holdings, performance metrics, and asset allocation",
        "data_sources": ["Batch CSV: portfolio_dump.csv", "Database: positions_db"],
        "last_updated": "2025-03-26T09:00:00Z",
        "coverage": ["CLIENT_001", "CLIENT_002"],
    },
    "market_sentiment": {
        "active": False,
        "description": "Social media sentiment analysis and news mentions",
        "data_sources": ["REST API: Pending integration"],
        "last_updated": None,
        "coverage": ["All tickers"],
    },
    "risk_metrics": {
        "active": True,
        "description": "Value at Risk, Beta, Volatility, and correlation matrices",
        "data_sources": ["Batch: risk_models_daily.json"],
        "last_updated": "2025-03-25T23:59:00Z",
        "coverage": ["All portfolios"],
    },
}

# Entitlements matrix: which API keys can access which tools
ENTITLEMENTS = {
    "API_KEY_ALPHA": {
        "tools": ["get_stock_price", "get_portfolio_summary", "calculate_returns", "check_entitlement"],
        "resources": ["stock_prices", "portfolio_analytics", "risk_metrics"],
    },
    "API_KEY_BETA": {
        "tools": ["get_stock_price"],
        "resources": ["stock_prices"],
    },
    "API_KEY_GAMMA": {
        "tools": [],
        "resources": [],
    },
}


# ============================================================================
# TOOLS: Model-controlled actions (AI decides when to call them)
# ============================================================================

@mcp.tool()
def get_stock_price(ticker: str, api_key: str) -> dict:
    """
    Fetch current stock price for a given ticker symbol.
    Simulates a REST API call to financial data provider.

    Args:
        ticker: Stock ticker symbol (e.g., AAPL, GOOGL)
        api_key: API key for entitlement checking

    Returns:
        Stock price data or error if not entitled or ticker not found
    """
    # Check entitlements
    if api_key not in ENTITLEMENTS or "get_stock_price" not in ENTITLEMENTS[api_key]["tools"]:
        return {"error": "401 Unauthorized", "message": f"API key '{api_key}' is not entitled to call get_stock_price"}

    # Fetch data (simulates REST API)
    if ticker not in STOCK_DATA:
        return {"error": "404 Not Found", "message": f"Ticker '{ticker}' not found in stock database"}

    data = STOCK_DATA[ticker]
    return {
        "success": True,
        "ticker": ticker,
        "price": data["price"],
        "currency": data["currency"],
        "last_updated": data["last_updated"],
        "source": "REST API (simulated AlphaVantage)"}


@mcp.tool()
def get_portfolio_summary(client_id: str, api_key: str) -> dict:
    """
    Retrieve portfolio summary for a specific client.
    Simulates batch file data access (CSV).

    Args:
        client_id: Client identifier
        api_key: API key for entitlement checking

    Returns:
        Portfolio holdings and valuation or error
    """
    # Check entitlements
    if api_key not in ENTITLEMENTS or "get_portfolio_summary" not in ENTITLEMENTS[api_key]["tools"]:
        return {"error": "401 Unauthorized",
                "message": f"API key '{api_key}' is not entitled to call get_portfolio_summary"}

    # Fetch data (simulates batch file read)
    if client_id not in PORTFOLIO_DATA:
        return {"error": "404 Not Found", "message": f"Client '{client_id}' not found in portfolio database"}

    data = PORTFOLIO_DATA[client_id]
    return {
        "success": True,
        "client_id": client_id,
        "client_name": data["name"],
        "holdings": data["holdings"],
        "total_value": data["total_value"],
        "source": "Batch CSV (simulated portfolio_dump.csv)"}


@mcp.tool()
def calculate_returns(client_id: str, api_key: str) -> dict:
    """
    Calculate portfolio returns and performance metrics.
    Combines real-time stock data with portfolio holdings.

    Args:
        client_id: Client identifier
        api_key: API key for entitlement checking

    Returns:
        Performance metrics including gains, losses, and ROI
    """
    # Check entitlements
    if api_key not in ENTITLEMENTS or "calculate_returns" not in ENTITLEMENTS[api_key]["tools"]:
        return {"error": "401 Unauthorized",
                "message": f"API key '{api_key}' is not entitled to call calculate_returns"}

    # Fetch portfolio
    if client_id not in PORTFOLIO_DATA:
        return {"error": "404 Not Found", "message": f"Client '{client_id}' not found"}

    portfolio = PORTFOLIO_DATA[client_id]
    metrics = {
        "client_id": client_id,
        "positions": []
    }

    total_cost_basis = 0
    total_current_value = 0

    for holding in portfolio["holdings"]:
        ticker = holding["ticker"]
        if ticker in STOCK_DATA:
            current_price = STOCK_DATA[ticker]["price"]
            cost = holding["shares"] * holding["purchase_price"]
            current = holding["shares"] * current_price
            gain = current - cost
            gain_pct = (gain / cost * 100) if cost > 0 else 0

            metrics["positions"].append({
                "ticker": ticker,
                "shares": holding["shares"],
                "purchase_price": holding["purchase_price"],
                "current_price": current_price,
                "cost_basis": cost,
                "current_value": current,
                "gain_loss": gain,
                "gain_loss_pct": round(gain_pct, 2)
            })

            total_cost_basis += cost
            total_current_value += current

    metrics["summary"] = {
        "total_cost_basis": round(total_cost_basis, 2),
        "total_current_value": round(total_current_value, 2),
        "total_gain_loss": round(total_current_value - total_cost_basis, 2),
        "total_return_pct": round((total_current_value - total_cost_basis) / total_cost_basis * 100,
                                  2) if total_cost_basis > 0 else 0
    }

    return {
        "success": True,
        "data": metrics,
        "source": "Calculated from REST + Batch data"
    }


@mcp.tool()
def check_entitlement(api_key: str, resource_type: str = None) -> dict:
    """
    Check what tools and resources an API key is entitled to access.
    Useful for inspecting permissions before making requests.

    Args:
        api_key: API key to inspect
        resource_type: Optional filter (tools or resources)

    Returns:
        List of entitled tools and resources
    """
    if api_key not in ENTITLEMENTS:
        return {"error": "401 Unauthorized", "message": f"API key '{api_key}' not found"}

    perms = ENTITLEMENTS[api_key]

    if resource_type == "tools":
        return {"api_key": api_key, "entitled_tools": perms["tools"]}
    elif resource_type == "resources":
        return {"api_key": api_key, "entitled_resources": perms["resources"]}
    else:
        return {
            "api_key": api_key,
            "entitled_tools": perms["tools"],
            "entitled_resources": perms["resources"],
            "total_tool_access": len(perms["tools"]),
            "total_resource_access": len(perms["resources"])
        }


# ============================================================================
# RESOURCES: App-controlled data loaded into context on demand
# ============================================================================

@mcp.resource("topic://stock_prices")
def get_stock_prices_resource() -> str:
    """
    Resource: List all available stock price data.
    Useful for understanding what ticker data is available without calling a tool.
    """
    return json.dumps({
        "description": "Available stock price data",
        "tickers": list(STOCK_DATA.keys()),
        "data": STOCK_DATA,
        "note": "Load this resource to see available stock data before querying"
    }, indent=2)


@mcp.resource("topic://portfolio_analytics")
def get_portfolio_analytics_resource() -> str:
    """
    Resource: Overview of available portfolio data.
    Helps clients understand what portfolios can be queried.
    """
    clients = [{"id": cid, "name": data["name"], "holdings_count": len(data["holdings"])}
               for cid, data in PORTFOLIO_DATA.items()]
    return json.dumps({
        "description": "Available portfolio data",
        "clients": clients,
        "note": "Load this resource to see which clients and portfolios are available"
    }, indent=2)


@mcp.resource("topic://data_catalog")
def get_data_catalog_resource() -> str:
    """
    Resource: Complete data topic registry.
    Shows what data topics exist, their status, sources, and coverage.
    THIS IS YOUR TOPIC LOOKUP! Shows active/inactive topics and metadata.
    """
    catalog = {
        "timestamp": datetime.now().isoformat(),
        "total_topics": len(TOPIC_REGISTRY),
        "active_topics": sum(1 for t in TOPIC_REGISTRY.values() if t["active"]),
        "topics": TOPIC_REGISTRY
    }
    return json.dumps(catalog, indent=2)


@mcp.resource("topic://market_sentiment")
def get_market_sentiment_resource() -> str:
    """
    Resource: Market sentiment topic metadata.
    Shows status of sentiment analysis data (currently inactive - pending integration).
    """
    return json.dumps(TOPIC_REGISTRY["market_sentiment"], indent=2)


@mcp.resource("topic://risk_metrics")
def get_risk_metrics_resource() -> str:
    """
    Resource: Risk metrics and analytics data.
    Contains volatility, beta, correlation, and VaR data.
    """
    return json.dumps(TOPIC_REGISTRY["risk_metrics"], indent=2)


# ============================================================================
# PROMPTS: Reusable interaction templates
# ============================================================================

@mcp.prompt()
def financial_analysis_prompt(ticker: str = "AAPL") -> str:
    """
    Reusable prompt template for comprehensive financial analysis.
    Guides Claude through a structured analysis of a stock.
    """
    return f"""
Perform a comprehensive financial analysis for {ticker}.

Steps:
1. Fetch the current stock price for {ticker}
2. Check if we have portfolio holdings for {ticker}
3. Calculate potential returns if held in a portfolio context
4. Provide investment insights based on the data

Please start by getting the stock price data, then perform the analysis in a structured format.
"""


@mcp.prompt()
def portfolio_health_check_prompt(client_id: str = "CLIENT_001") -> str:
    """
    Reusable prompt template for portfolio health assessment.
    Guides Claude through evaluating portfolio status, performance, and risks.
    """
    return f"""
Perform a health check on portfolio {client_id}.

Analysis framework:
1. Retrieve the portfolio summary for {client_id}
2. Calculate returns and performance metrics
3. Assess concentration risk (% of total value in each position)
4. Provide recommendations for rebalancing or diversification
5. Highlight top performers and underperformers

Start by loading the portfolio data, then proceed with the analysis.
"""


@mcp.prompt()
def data_discovery_prompt() -> str:
    """
    Reusable prompt template for exploring available data.
    Helps users understand what data topics and resources are available.
    THIS USES THE TOPIC REGISTRY RESOURCE!
    """
    return """
Discover what financial data is available in this system.

Process:
1. Load the data_catalog resource to see all available topics
2. For each active topic, provide:
   - Topic name and description
   - Current status and last update time
   - Data sources being used
   - Coverage (what entities are covered)
3. Identify any inactive topics and explain their status
4. Suggest which topics would be most useful for a new user

Start by loading the data_catalog resource.
"""


# ============================================================================
# Server Initialization
# ============================================================================

if __name__ == "__main__":
    # The server will be started by the client via stdio transport
    mcp.run(transport="stdio")