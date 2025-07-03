from google.adk.agents import Agent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters


# root_agent = Agent(
#     name="pdf_reader_url_agent",
#     model="gemini-2.0-flash",
#     description="""
#         This agent reads PDF documents from URLs and extracts their text content. 
#     """,
#      instruction="""
#         You are a specialized AI assistant designed to read and analyze PDF documents from URLs. 
#         Your primary function is to extract text content from PDFs and provide summaries or answer questions based on that content.
#         You can handle various types of PDF links, including direct links, Google Drive links, Dropbox links, and other common PDF hosting services.
#         In case of Google Drive links, you will need to ensure that the file is publicly accessible.
#     """,
#     tools=[
#         MCPToolset(
#             connection_params=StdioServerParameters(
#                 args=[
#                     'tools\pdf-reader\dist\index.js'
#                 ],
#                 command="node"
#             )
#         )
#     ],
# )

root_agent = Agent(
    name="google_auth_agent",
    model="gemini-2.0-flash",
    description="""
        This agent provides Google authentication capabilities.
    """,
    instruction="""
        You are a specialized AI assistant designed to handle Google authentication tasks. 
        Your primary function is to authenticate users with Google services and manage access tokens.
    """,
        tools=[
        MCPToolset(
            connection_params=StdioServerParameters(
                args=[
                    'tools/google-auth/dist/index.js',
                ],
                command="node"
            )
        )
    ],
    )