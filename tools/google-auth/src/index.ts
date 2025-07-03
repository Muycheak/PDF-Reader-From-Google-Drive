import { google, drive_v3 } from 'googleapis';
import { promises as fs } from 'fs';
import * as path from 'path';
import { OAuth2Client } from 'google-auth-library';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

const GOOGLE_AUTH_TOOL_NAME = "google_auth";
const GOOGLE_AUTH_TOOL: Tool = {
    name: GOOGLE_AUTH_TOOL_NAME,
    description: "Authenticate with Google Drive",
    inputSchema: {
        type: "object",
    }
};

const LIST_FILES_TOOL_NAME = "list_google_drive_files";
const LIST_FILES_TOOL: Tool = {
    name: LIST_FILES_TOOL_NAME,
    description: "List files in the user's Google Drive. This tool requires authentication with Google Drive and returns a list of files in the user's Google Drive account. It can be used after successful authentication.",
    inputSchema: {
        type: "object",
    }
};



const CLIENT_ID = "1052983976035-rv3n4504uat6tn3vvrvi9av43tc6sik9.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
// Using 'oob' (out-of-band) for a CLI app is simpler.
// Google will display the auth code on a page for you to copy.
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
        console.log('New refresh token received, saving to token.json');
    }
    const currentCredentials = oAuth2Client.credentials;
    const newCredentials = { ...currentCredentials, ...tokens };
    fs.writeFile(TOKEN_PATH, JSON.stringify(newCredentials)).catch(err => console.error('Error writing new token:', err));
});

async function authorize(): Promise<OAuth2Client> {
    try {
        const token = await fs.readFile(TOKEN_PATH, 'utf-8');
        const credentials = JSON.parse(token);
        oAuth2Client.setCredentials(credentials);
        return oAuth2Client;
    } catch (err) {
        // If no token, or token is invalid, throw an error that the agent can handle.
        throw new McpError(
            ErrorCode.InternalError,
            "Not authenticated. Please run the 'google_auth' tool to authenticate."
        );
    }
}

export async function loginAndListGoogleDriveFilesNode(): Promise<drive_v3.Schema$File[]> {
    try {
        await authorize();
        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
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
        } else {
            console.log('No files found.');
            return [];
        }
    } catch (error) {
        console.error('An error occurred during Google Drive operation:', error);
        return [];
    }
}

const server = new Server({
    name: "pdf_url_mcp_server",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});


server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [LIST_FILES_TOOL, GOOGLE_AUTH_TOOL]
}
));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
        }else if(request.params.name == LIST_FILES_TOOL_NAME) {
            const files = await loginAndListGoogleDriveFilesNode();
            return {
                content: [{
                    type: "text",
                    text: `Files in Google Drive:\n${files.map(file => `${file.name} (${file.id})`).join('\n')}`
                }],
                isError: false
            };

        }else {
             throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${request.params.name}`
            );
           
        }
    } catch (error) {
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
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Airxpress MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});