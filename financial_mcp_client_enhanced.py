"""
financial_mcp_client_enhanced.py
---------------------------------
Enhanced MCP Client - Demonstrates all three MCP primitives:
  - Tools    : get_stock_price, get_portfolio_summary, calculate_returns, check_entitlement
  - Resources: topic://data_catalog, topic://stock_prices, topic://portfolio_analytics
  - Prompts  : financial_analysis_prompt, portfolio_health_check_prompt, data_discovery_prompt

Run with:
    python financial_mcp_client_enhanced.py
"""

import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


# ============================================================================
# Helper: pretty print section headers
# ============================================================================

def header(title: str):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def demo(title: str):
    print(f"\n--- {title} ---")


# ============================================================================
# Main client logic
# ============================================================================

async def run_enhanced_client():

    # Point client at the enhanced server script
    server_params = StdioServerParameters(
        command="python",
        args=["financial_mcp_server_enhanced.py"],
        env=None,
    )

    header("Enhanced Financial MCP Client")

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:

            # Initialize connection
            await session.initialize()
            print("\n✅ Connected to Enhanced Financial MCP Server\n")

            # ── LIST ALL PRIMITIVES ───────────────────────────────────────

            header("Available MCP Primitives")

            # Tools
            tools_response = await session.list_tools()
            print("\n📦 TOOLS (model-controlled actions):")
            for tool in tools_response.tools:
                print(f"   • {tool.name}")
                print(f"     {tool.description[:80]}...")

            # Resources
            resources_response = await session.list_resources()
            print("\n📂 RESOURCES (app-controlled context data):")
            for resource in resources_response.resources:
                print(f"   • {resource.uri}")
                print(f"     {resource.description[:80]}...")

            # Prompts
            prompts_response = await session.list_prompts()
            print("\n💬 PROMPTS (reusable interaction templates):")
            for prompt in prompts_response.prompts:
                print(f"   • {prompt.name}")
                print(f"     {prompt.description[:80]}...")

            # ================================================================
            # TOOLS DEMOS
            # ================================================================

            header("TOOLS DEMOS")

            # Demo 1: Get stock price - entitled key
            demo("DEMO 1: Entitled key fetches AAPL stock price")
            result = await session.call_tool(
                "get_stock_price",
                arguments={"ticker": "AAPL", "api_key": "API_KEY_ALPHA"}
            )
            print(f"Result: {result.content[0].text}")

            # Demo 2: Get portfolio summary - entitled key
            demo("DEMO 2: Entitled key fetches portfolio for CLIENT_001")
            result = await session.call_tool(
                "get_portfolio_summary",
                arguments={"client_id": "CLIENT_001", "api_key": "API_KEY_ALPHA"}
            )
            print(f"Result: {result.content[0].text}")

            # Demo 3: Calculate returns - NEW TOOL
            demo("DEMO 3: Calculate portfolio returns for CLIENT_001 (NEW TOOL)")
            result = await session.call_tool(
                "calculate_returns",
                arguments={"client_id": "CLIENT_001", "api_key": "API_KEY_ALPHA"}
            )
            print(f"Result: {result.content[0].text}")

            # Demo 4: Calculate returns for CLIENT_002
            demo("DEMO 4: Calculate portfolio returns for CLIENT_002")
            result = await session.call_tool(
                "calculate_returns",
                arguments={"client_id": "CLIENT_002", "api_key": "API_KEY_ALPHA"}
            )
            print(f"Result: {result.content[0].text}")

            # Demo 5: Restricted key tries calculate_returns - should get 401
            demo("DEMO 5: Restricted key tries calculate_returns (expect 401)")
            result = await session.call_tool(
                "calculate_returns",
                arguments={"client_id": "CLIENT_001", "api_key": "API_KEY_BETA"}
            )
            print(f"Result: {result.content[0].text}")

            # Demo 6: Check entitlements - tools only
            demo("DEMO 6: Check what tools API_KEY_BETA is entitled to")
            result = await session.call_tool(
                "check_entitlement",
                arguments={"api_key": "API_KEY_BETA", "resource_type": "tools"}
            )
            print(f"Result: {result.content[0].text}")

            # Demo 7: Check entitlements - resources only
            demo("DEMO 7: Check what resources API_KEY_ALPHA is entitled to")
            result = await session.call_tool(
                "check_entitlement",
                arguments={"api_key": "API_KEY_ALPHA", "resource_type": "resources"}
            )
            print(f"Result: {result.content[0].text}")

            # ================================================================
            # RESOURCES DEMOS
            # ================================================================

            header("RESOURCES DEMOS")

            # Demo 8: Load the data catalog - YOUR TOPIC REGISTRY!
            demo("DEMO 8: Load DATA CATALOG resource (topic registry)")
            resource_result = await session.read_resource("topic://data_catalog")
            print(f"Result: {resource_result.contents[0].text}")

            # Demo 9: Load stock prices resource
            demo("DEMO 9: Load STOCK PRICES resource")
            resource_result = await session.read_resource("topic://stock_prices")
            print(f"Result: {resource_result.contents[0].text}")

            # Demo 10: Load portfolio analytics resource
            demo("DEMO 10: Load PORTFOLIO ANALYTICS resource")
            resource_result = await session.read_resource("topic://portfolio_analytics")
            print(f"Result: {resource_result.contents[0].text}")

            # Demo 11: Load market sentiment (inactive topic)
            demo("DEMO 11: Load MARKET SENTIMENT resource (inactive topic)")
            resource_result = await session.read_resource("topic://market_sentiment")
            print(f"Result: {resource_result.contents[0].text}")

            # Demo 12: Load risk metrics resource
            demo("DEMO 12: Load RISK METRICS resource")
            resource_result = await session.read_resource("topic://risk_metrics")
            print(f"Result: {resource_result.contents[0].text}")

            # ================================================================
            # PROMPTS DEMOS
            # ================================================================

            header("PROMPTS DEMOS")

            # Demo 13: Get financial analysis prompt for AAPL
            demo("DEMO 13: Get FINANCIAL ANALYSIS prompt for AAPL")
            prompt_result = await session.get_prompt(
                "financial_analysis_prompt",
                arguments={"ticker": "AAPL"}
            )
            print(f"Prompt template returned:")
            for msg in prompt_result.messages:
                print(f"  Role: {msg.role}")
                print(f"  Content: {msg.content.text}")

            # Demo 14: Get portfolio health check prompt for CLIENT_002
            demo("DEMO 14: Get PORTFOLIO HEALTH CHECK prompt for CLIENT_002")
            prompt_result = await session.get_prompt(
                "portfolio_health_check_prompt",
                arguments={"client_id": "CLIENT_002"}
            )
            print(f"Prompt template returned:")
            for msg in prompt_result.messages:
                print(f"  Role: {msg.role}")
                print(f"  Content: {msg.content.text}")

            # Demo 15: Get data discovery prompt
            demo("DEMO 15: Get DATA DISCOVERY prompt (uses topic registry)")
            prompt_result = await session.get_prompt(
                "data_discovery_prompt",
                arguments={}
            )
            print(f"Prompt template returned:")
            for msg in prompt_result.messages:
                print(f"  Role: {msg.role}")
                print(f"  Content: {msg.content.text}")

            # ── SUMMARY ───────────────────────────────────────────────────
            header("All Demos Complete")
            print(f"""
Summary of what was demonstrated:

  TOOLS      ({len(tools_response.tools)} total)
    ✅ get_stock_price         - fetch real-time price via REST
    ✅ get_portfolio_summary   - fetch holdings via batch data
    ✅ calculate_returns       - compute gain/loss across portfolio
    ✅ check_entitlement       - inspect API key permissions

  RESOURCES  ({len(resources_response.resources)} total)
    ✅ topic://data_catalog        - full topic registry (active/inactive)
    ✅ topic://stock_prices        - available tickers and prices
    ✅ topic://portfolio_analytics - available clients and portfolios
    ✅ topic://market_sentiment    - inactive topic with pending status
    ✅ topic://risk_metrics        - VaR, beta, volatility metadata

  PROMPTS    ({len(prompts_response.prompts)} total)
    ✅ financial_analysis_prompt       - guided stock analysis workflow
    ✅ portfolio_health_check_prompt   - guided portfolio review workflow
    ✅ data_discovery_prompt           - guided topic catalog exploration
""")


# ============================================================================
# Entry point
# ============================================================================

if __name__ == "__main__":
    asyncio.run(run_enhanced_client())