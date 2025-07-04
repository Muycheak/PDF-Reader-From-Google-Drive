from google.adk.agents import Agent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters


root_agent = Agent(
    name="pdf_url_agent",
    model="gemini-2.0-flash",
    description="""
        This agent gets text from PDF documents from URLs and extracts their text content.
        It can handle both direct PDF URLs and Google Drive URLs.
    """,
    instruction="""
        You are an AI agent that can get all text from PDF documents that a user provides via a URL. You can handle both direct PDF URLs and Google Drive URLs.
    """,
    tools=[
        MCPToolset(
            connection_params=StdioServerParameters(
                args=["tools/pdf-reader/dist/index.js"], command="node"
            )
        ),
    ],
)


# root_agent = Agent(
#     name="google_auth_agent",
#     model="gemini-2.0-flash",
#     description="""
#         This agent provides Google authentication capabilities.
#     """,
#     instruction="""
#         You are a specialized AI assistant designed to handle Google authentication tasks.
#         Your primary function is to authenticate users with Google services and manage access tokens.
#     """,
#         tools=[
#         MCPToolset(
#             connection_params=StdioServerParameters(
#                 args=[
#                     'tools/google-auth/dist/index.js',
#                 ],
#                 command="node"
#             )
#         )
#     ],
#     )
