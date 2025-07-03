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
exports.GET_NEW_TOKEN_TOOL_NAME = exports.GET_NEW_TOKEN_TOOL = exports.GET_AUTH_URL_TOOL_NAME = exports.GET_AUTH_URL_TOOL = exports.oAuth2Client = void 0;
exports.authorize = authorize;
exports.getAuthUrl = getAuthUrl;
exports.getNewToken = getNewToken;
const googleapis_1 = require("googleapis");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const CLIENT_ID = "1052983976035-rv3n4504uat6tn3vvrvi9av43tc6sik9.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
// Using 'oob' (out-of-band) for a CLI app is simpler.
// Google will display the auth code on a page for you to copy.
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";
const GET_AUTH_URL_TOOL_NAME = "get_google_auth_url";
exports.GET_AUTH_URL_TOOL_NAME = GET_AUTH_URL_TOOL_NAME;
const GET_AUTH_URL_TOOL = {
    name: GET_AUTH_URL_TOOL_NAME,
    description: "Get the Google authentication URL. This tool does not require any input and this tool will returns the URL for the user to authenticate with Google.",
    inputSchema: {
        type: "object",
        properties: {}
    }
};
exports.GET_AUTH_URL_TOOL = GET_AUTH_URL_TOOL;
const GET_NEW_TOKEN_TOOL_NAME = "get_new_google_token";
exports.GET_NEW_TOKEN_TOOL_NAME = GET_NEW_TOKEN_TOOL_NAME;
const GET_NEW_TOKEN_TOOL = {
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
exports.GET_NEW_TOKEN_TOOL = GET_NEW_TOKEN_TOOL;
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const oAuth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
exports.oAuth2Client = oAuth2Client;
oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
        console.log('New refresh token received, saving to token.json');
    }
    const currentCredentials = oAuth2Client.credentials;
    const newCredentials = { ...currentCredentials, ...tokens };
    fs_1.promises.writeFile(TOKEN_PATH, JSON.stringify(newCredentials)).catch(err => console.error('Error writing new token:', err));
});
async function authorize() {
    // If the client has credentials in memory, we can assume it's authorized.
    if (oAuth2Client.credentials && oAuth2Client.credentials.access_token) {
        return oAuth2Client;
    }
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
function getAuthUrl() {
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
}
async function getNewToken(params) {
    const { code } = params;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    // The 'tokens' event listener will handle saving the token.
    console.log('Token stored to', TOKEN_PATH);
    return oAuth2Client;
}
