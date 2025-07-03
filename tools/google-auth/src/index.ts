import * as googleAuth from './google.auth.js';
import * as listDrive from './list.drive.js';

import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";


const ALL_TOOLS = [
    googleAuth.GET_AUTH_URL_TOOL,
    googleAuth.GET_NEW_TOKEN_TOOL,
    listDrive.LIST_FILES_TOOL
] as const;

const server = new Server({
    name: "pdf_url_mcp_server",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});


server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS
}
));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case googleAuth.GET_NEW_TOKEN_TOOL_NAME: {
                await googleAuth.getNewToken(request.params.arguments);
                if (!googleAuth.oAuth2Client.credentials.access_token) {
                    return {
                        isError: true,
                        content: [{
                            type: "String",
                            data: "Failed to retrieve access token. Please ensure you have authenticated successfully."
                        }]
                    };
                } else {
                    return {
                        isError: false,
                        content: [{
                            type: "String",
                            data: "Successfully authenticated with Google. You can now use other tools."
                        }]
                    };
                }
            }
            case googleAuth.GET_AUTH_URL_TOOL_NAME: {
                const url = googleAuth.getAuthUrl();
                if (!url) {
                    return {
                        isError: true,
                        content: [{
                            type: "String",
                            data: "Failed to generate authentication URL."
                        }]
                    };
                } else {
                    return {
                        isError: false,
                        content: [{
                            type: "String",
                            data: `Please visit the following URL to authenticate with Google: ${url}`
                        }]
                    };
                }
            }
            case listDrive.LIST_FILES_TOOL_NAME: {
                const result = await listDrive.listDriveFiles();
                if (result === undefined || result.length === 0) {
                    return {
                        isError: true,
                        content: [{
                            type: "String",
                            data: "Failed to list files."
                        }]
                    };
                }
                else {
                    return {
                        isError: false,
                        content: [{
                            type: "String",
                            data: JSON.stringify(result, null, 2)
                        }]
                    };
                }
            }
            default:
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${request.params.name}`
                );
        }
    } catch (error) {
        return {
            content: [{
                type: "String",
                data: `Error: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
        };
    }
});


async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Airxpress MCP Server running on stdio");
}
  
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});


// async function testGoogleAuthAndListFiles() {
//     try {
//         // First, try to authorize using a saved token.
//         await googleAuth.authorize();
//         console.log("Successfully authorized from saved token.");
//         const files = await listDrive.listDriveFiles();
//         console.log("Files in Google Drive:", JSON.stringify(files, null, 2));
//     } catch (e) {
//         // If authorization fails, start the manual authentication flow.
//         console.log("Could not authorize from saved token. Starting manual authentication.");
//         const authUrl = googleAuth.getAuthUrl();
//         console.log(`Please visit the following URL to authenticate: ${authUrl}`);
//         const readline = require('readline').createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//         readline.question('Code: ', async (code: string) => {
//             try {
//                 await googleAuth.getNewToken({ code });
//                 console.log("Authentication successful. You can now list files.");
//                 const files = await listDrive.listDriveFiles();
//                 console.log("Files in Google Drive:", JSON.stringify(files, null, 2));
//             } catch (error) {
//                 console.error("Error during authentication or listing files:", error);
//             } finally {
//                 readline.close();
//             }
//         });
//     }
// }


// testGoogleAuthAndListFiles();