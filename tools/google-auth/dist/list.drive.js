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
exports.LIST_FILES_TOOL_NAME = exports.LIST_FILES_TOOL = void 0;
exports.listDriveFiles = listDriveFiles;
const googleAuth = __importStar(require("./google.auth.js"));
const googleapis_1 = require("googleapis");
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
async function listDriveFiles() {
    try {
        await googleAuth.authorize();
        const drive = googleapis_1.google.drive({ version: 'v3', auth: googleAuth.oAuth2Client });
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
        throw error;
    }
}
