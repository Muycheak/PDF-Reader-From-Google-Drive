import * as googleAuth from './google.auth.js';

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
    googleAuth.LIST_FILES_TOOL,
    googleAuth.CHECK_LOGGED_IN_TOOL
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
                return await googleAuth.getNewToken(request.params.arguments);
            }
            case googleAuth.GET_AUTH_URL_TOOL_NAME: {
                return googleAuth.getAuthUrl();
            }
            case googleAuth.LIST_FILES_TOOL_NAME: {
                return await googleAuth.listDriveFiles();

            }
            case googleAuth.CHECK_LOGGED_IN_TOOL_NAME: {
                return await googleAuth.authorize();
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
                type: "text",
                text: error instanceof Error ? error.message : "An unknown error occurred."
            }],
            isError: false
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