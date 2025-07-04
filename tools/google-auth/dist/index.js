"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const googleAuth = __importStar(require("./google.auth.js"));
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const ALL_TOOLS = [
    googleAuth.GET_AUTH_URL_TOOL,
    googleAuth.GET_NEW_TOKEN_TOOL,
    googleAuth.LIST_FILES_TOOL,
    googleAuth.CHECK_LOGGED_IN_TOOL
];
const server = new index_js_1.Server({
    name: "pdf_url_mcp_server",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
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
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
    }
    catch (error) {
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
    const transport = new stdio_js_1.StdioServerTransport();
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
