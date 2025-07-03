import { google, drive_v3 } from 'googleapis';
import { promises as fs } from 'fs';
import * as path from 'path';
import { OAuth2Client } from 'google-auth-library';
import {
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import * as Response from "./response.util.js";

const CLIENT_ID = "1052983976035-rv3n4504uat6tn3vvrvi9av43tc6sik9.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
// Using 'oob' (out-of-band) for a CLI app is simpler.
// Google will display the auth code on a page for you to copy.
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";


const GET_AUTH_URL_TOOL_NAME = "get_google_auth_url";
const GET_AUTH_URL_TOOL: Tool = {
    name: GET_AUTH_URL_TOOL_NAME,
    description: "Get the Google authentication URL. This tool does not require any input and this tool will returns the URL for the user to authenticate with Google.",
    inputSchema: {
        type: "object",
        properties: {}
    }
};


const GET_NEW_TOKEN_TOOL_NAME = "get_new_google_token";
const GET_NEW_TOKEN_TOOL: Tool = {
    name: GET_NEW_TOKEN_TOOL_NAME,
    description: "Get a new Google authentication token. This tool requires the user to provide the authentication code received after visiting the Google authentication URL.",
    inputSchema: {
        type: "object",
        properties: {
            code: { type: "string" }
        },
        required: ["code"]
    }
};



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
    // If the client has credentials in memory, we can assume it's authorized.
    if (oAuth2Client.credentials && oAuth2Client.credentials.access_token) {
        return oAuth2Client;
    }

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

function getAuthUrl(): string {
 
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
}

async function getNewToken(params: any): Promise<OAuth2Client> {
    const { code } = params;

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    // The 'tokens' event listener will handle saving the token.
    console.log('Token stored to', TOKEN_PATH);
    return oAuth2Client;
}

export {
    authorize,
    oAuth2Client,
    getAuthUrl,
    getNewToken,
    GET_AUTH_URL_TOOL,
    GET_AUTH_URL_TOOL_NAME,
    GET_NEW_TOKEN_TOOL,
    GET_NEW_TOKEN_TOOL_NAME,
}