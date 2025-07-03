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
exports.loginAndListGoogleDriveFilesNode = loginAndListGoogleDriveFilesNode;
const googleapis_1 = require("googleapis");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const GOOGLE_AUTH_TOOL_NAME = "google_auth";
const GOOGLE_AUTH_TOOL = {
    name: GOOGLE_AUTH_TOOL_NAME,
    description: "Authenticate with Google Drive",
    inputSchema: {
        type: "object",
    }
};
const LIST_FILES_TOOL_NAME = "list_google_drive_files";
const LIST_FILES_TOOL = {
    name: LIST_FILES_TOOL_NAME,
    description: "List files in the user's Google Drive. This tool requires authentication with Google Drive and returns a list of files in the user's Google Drive account. It can be used after successful authentication.",
    inputSchema: {
        type: "object",
    }
};
// These should be loaded from environment variables in a real application
const CLIENT_ID = "1052983976035-rv3n4504uat6tn3vvrvi9av43tc6sik9.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
// Using 'oob' (out-of-band) for a CLI app is simpler.
// Google will display the auth code on a page for you to copy.
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const oAuth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
        console.log('New refresh token received, saving to token.json');
    }
    const currentCredentials = oAuth2Client.credentials;
    const newCredentials = { ...currentCredentials, ...tokens };
    fs_1.promises.writeFile(TOKEN_PATH, JSON.stringify(newCredentials)).catch(err => console.error('Error writing new token:', err));
});
async function authorize() {
    try {
        const token = await fs_1.promises.readFile(TOKEN_PATH, 'utf-8');
        const credentials = JSON.parse(token);
        oAuth2Client.setCredentials(credentials);
        return oAuth2Client;
    }
    catch (err) {
        // If no token, or token is invalid, throw an error that the agent can handle.
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, "Not authenticated. Please run the 'google_auth' tool to authenticate.");
    }
}
async function loginAndListGoogleDriveFilesNode() {
    try {
        await authorize();
        const drive = googleapis_1.google.drive({ version: 'v3', auth: oAuth2Client });
        console.log('Successfully authenticated with Google Drive. Fetching files...');
        const res = await drive.files.list({
            pageSize: 20,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
            orderBy: 'modifiedTime desc',
        });
        const files = res.data.files;
        if (files && files.length > 0) {
            console.log('Files:');
            files.forEach((file) => {
                const modifiedDate = file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'N/A';
                console.log(`- ${file.name} (${file.id}) | ${file.mimeType} | Last Modified: ${modifiedDate}`);
            });
            return files;
        }
        else {
            console.log('No files found.');
            return [];
        }
    }
    catch (error) {
        console.error('An error occurred during Google Drive operation:', error);
        return [];
    }
}
const server = new index_js_1.Server({
    name: "pdf_url_mcp_server",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: [LIST_FILES_TOOL, GOOGLE_AUTH_TOOL]
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name == GOOGLE_AUTH_TOOL_NAME) {
            const authClient = await authorize();
            return {
                content: [{
                        type: "text",
                        text: "Successfully authenticated with Google Drive. You can now use the 'list_google_drive_files' tool to list files."
                    }],
                isError: false,
                toolOutput: {
                    authClient: authClient
                }
            };
        }
        else if (request.params.name == LIST_FILES_TOOL_NAME) {
            const files = await loginAndListGoogleDriveFilesNode();
            return {
                content: [{
                        type: "text",
                        text: `Files in Google Drive:\n${files.map(file => `${file.name} (${file.id})`).join('\n')}`
                    }],
                isError: false
            };
        }
        else {
            throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`
                }],
            isError: true
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
