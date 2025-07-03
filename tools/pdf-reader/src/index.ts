import fetch from 'node-fetch';
import pdf from 'pdf-parse';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

const CHECK_IN_GUIDE_FROM_URL_TOOL_NAME = "check_in_guide_from_url";
const CHECK_IN_GUIDE_FROM_URL_TOOL: Tool = {
    name: CHECK_IN_GUIDE_FROM_URL_TOOL_NAME,
    description: "Get text text of PDF document from a given URL (including Google Drive links, Dropbox links, and other common PDF hosting services) and return it as a string. The URL must be publicly accessible.",
    inputSchema: {
        type: "object",
        properties: {
            url: {
                type: "string",
                description: "The URL of the PDF document to fetch. It can be a direct link to a PDF file or a link to a Google Drive file (e.g., https://drive.google.com/file/d/FILE_ID/view). The file must be publicly accessible."
            }
        },
        required: ["url"]
    },
};

function convertGoogleDriveLinkToDirectDownload(driveUrl: string): string {
    const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(view|edit|preview)/;
    const match = driveUrl.match(regex);

    if (match && match[1]) {
        const fileId = match[1];
        return `https://docs.google.com/uc?export=download&id=${fileId}`;
    }
    return driveUrl;
}


async function getTextPdfFromUrl(params: any): Promise<String> {
    try {
        const { pdfUrl } = params;
        let finalPdfUrl = pdfUrl;
        if (pdfUrl.includes('drive.google.com')) {
            finalPdfUrl = convertGoogleDriveLinkToDirectDownload(pdfUrl);
            if (finalPdfUrl === pdfUrl) {
                console.warn("Warning: Could not convert Google Drive sharing link to direct download. Make sure the file is publicly accessible and the link format is correct (e.g., .../file/d/FILE_ID/view). Attempting to fetch the original URL.");
            }
        }

        const response = await fetch(finalPdfUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch PDF from ${finalPdfUrl}: ${response.statusText} (Status: ${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();

        const dataBuffer = Buffer.from(arrayBuffer);

        const data = await pdf(dataBuffer);

        return data.text;

    } catch (error: any) {
        console.error(`Error fetching text of PDF from URL: ${error.message}`);
        throw error;
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
    tools: [CHECK_IN_GUIDE_FROM_URL_TOOL]
}
));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name !== CHECK_IN_GUIDE_FROM_URL_TOOL_NAME) {
            throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${request.params.name}`
            );
        } else {
            const text = await getTextPdfFromUrl(request.params.arguments);
            return { text };
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
