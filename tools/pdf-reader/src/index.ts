import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as pdfUrl from './pdf.url.js';


const server = new Server({
    name: "pdf_url_mcp_server",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});


server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [pdfUrl.GET_TEXT_FROM_URL_TOOL]
}
));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case pdfUrl.GET_TEXT_FROM_URL_TOOL_NAME: {
                return await pdfUrl.getTextPdfFromUrl(request.params.arguments);
            }
            default: {
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${request.params.name}`
                );
            }
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


// function convertGoogleDriveLinkToDirectDownload() {
//     const url = "https://drive.google.com/file/d/1fbvJORDR-x0aJqKWakfFIC5hhQCYQhxT/view?usp=sharing";

//     try {
//         const result = pdfUrl.convertGoogleDriveLinkToDirectDownload(url);
//         console.log(result);
//     } catch (error) {
//         console.log(error);
//     }

// }

function readPdfContentFromUrl() {
  const url = "https://drive.google.com/file/d/1fbvJORDR-x0aJqKWakfFIC5hhQCYQhxT/view?usp=sharing";
    
  try {
    const result = pdfUrl.readPdfContentFromUrl(url);
    console.log(result);
  }catch (error) {
    console.log(error);
  }
  
}


readPdfContentFromUrl();