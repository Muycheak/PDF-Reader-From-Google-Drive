import * as googleAuth from './google.auth.js';
import { google, drive_v3 } from 'googleapis';
import { Tool } from "@modelcontextprotocol/sdk/types.js";

const LIST_FILES_TOOL_NAME = "list_google_drive_files";
const LIST_FILES_TOOL: Tool = {
    name: LIST_FILES_TOOL_NAME,
    description: "List files in the user's Google Drive. This tool requires authentication with Google Drive and returns a list of files in the user's Google Drive account. It can be used after successful authentication.",
    inputSchema: {
        type: "object",
    }
};


async function listDriveFiles(): Promise<drive_v3.Schema$File[]> {
    try {
        await googleAuth.authorize();
        const drive = google.drive({ version: 'v3', auth: googleAuth.oAuth2Client });
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
        throw error;
    }
}


export {
    listDriveFiles,
    LIST_FILES_TOOL,
    LIST_FILES_TOOL_NAME,
}