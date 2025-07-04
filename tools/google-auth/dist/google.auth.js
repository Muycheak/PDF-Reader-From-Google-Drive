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
exports.GET_NEW_TOKEN_TOOL_NAME = exports.GET_NEW_TOKEN_TOOL = exports.GET_AUTH_URL_TOOL_NAME = exports.GET_AUTH_URL_TOOL = exports.LIST_FILES_TOOL_NAME = exports.LIST_FILES_TOOL = exports.CHECK_LOGGED_IN_TOOL_NAME = exports.CHECK_LOGGED_IN_TOOL = void 0;
exports.authorize = authorize;
exports.getAuthUrl = getAuthUrl;
exports.getNewToken = getNewToken;
exports.listDriveFiles = listDriveFiles;
const googleapis_1 = require("googleapis");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const Response = __importStar(require("./response.util.js"));
const CLIENT_ID = "1052983976035-rv3n4504uat6tn3vvrvi9av43tc6sik9.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
// Using 'oob' (out-of-band) for a CLI app is simpler.
// Google will display the auth code on a page for you to copy.
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";
const CHECK_LOGGED_IN_TOOL_NAME = "check_logged_in";
exports.CHECK_LOGGED_IN_TOOL_NAME = CHECK_LOGGED_IN_TOOL_NAME;
const CHECK_LOGGED_IN_TOOL = {
    name: CHECK_LOGGED_IN_TOOL_NAME,
    description: "Check if the user is logged in",
    inputSchema: {
        type: "object",
        properties: {}
    }
};
exports.CHECK_LOGGED_IN_TOOL = CHECK_LOGGED_IN_TOOL;
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
const LIST_FILES_TOOL_NAME = "list_google_drive_files";
exports.LIST_FILES_TOOL_NAME = LIST_FILES_TOOL_NAME;
const LIST_FILES_TOOL = {
    name: LIST_FILES_TOOL_NAME,
    description: "List files in the user's Google Drive. This tool requires authentication with Google Drive and returns a list of files in the user's Google Drive account. It can be used after successful authentication.",
    inputSchema: {
        type: "object",
    }
};
exports.LIST_FILES_TOOL = LIST_FILES_TOOL;
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
    let returnRes = Response.initializeResponse();
    // If the client has credentials in memory, we can assume it's authorized.
    if (oAuth2Client.credentials && oAuth2Client.credentials.access_token) {
        Response.pushText(returnRes, "Already authenticated with Google. You can now use other tools.");
    }
    try {
        const token = await fs_1.promises.readFile(TOKEN_PATH, 'utf-8');
        const credentials = JSON.parse(token);
        oAuth2Client.setCredentials(credentials);
        Response.pushText(returnRes, "Already authenticated with Google. You can now use other tools.");
    }
    catch (err) {
        Response.pushText(returnRes, "Not authenticated. Please run the 'google_auth' tool to authenticate.");
    }
    Response.setResponse(returnRes, false, "");
    return returnRes;
}
async function getAuthUrl() {
    let returnRes = Response.initializeResponse();
    await authorize();
    if (oAuth2Client.credentials.access_token) {
        Response.pushText(returnRes, "Already authenticated with Google. You can now use other tools.");
    }
    else {
        try {
            const url = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            if (url) {
                Response.pushText(returnRes, `Please visit the following URL to authenticate with Google: ${url}`);
            }
            else {
                Response.pushText(returnRes, "Failed to generate authentication URL.");
            }
        }
        catch (error) {
            Response.pushText(returnRes, "Failed to generate authentication URL.");
        }
    }
    Response.setResponse(returnRes, false, "");
    return returnRes;
}
async function getNewToken(params) {
    const { code } = params;
    let returnRes = Response.initializeResponse();
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        if (oAuth2Client.credentials.access_token) {
            Response.pushText(returnRes, "Successfully authenticated with Google. You can now use other tools.");
        }
        else {
            Response.pushText(returnRes, "Failed to retrieve access token. Please ensure you have authenticated successfully.");
        }
    }
    catch (error) {
        Response.pushText(returnRes, "Failed to retrieve access token. Please ensure you have authenticated successfully.");
    }
    Response.setResponse(returnRes, false, "");
    return returnRes;
}
async function listDriveFiles() {
    let returnRes = Response.initializeResponse();
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
            Response.pushJson(returnRes, files);
        }
        else {
            Response.pushText(returnRes, "No files found.");
        }
    }
    catch (error) {
        Response.pushText(returnRes, "Failed to list files.");
    }
    Response.setResponse(returnRes, false, "");
    return returnRes;
}
