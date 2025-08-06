import fetch from 'node-fetch';
import pdf = require('pdf-parse');
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import * as Response from "./response.util.js";
import * as pdfjsLib from 'pdfjs-dist';

interface PdfContent {
    pageNumber: number;
    text: string;
    images: string[];
}


const GET_CONTENT_FROM_URL_TOOL_NAME = "get_text_from_url";
const GET_CONTENT_FROM_URL_TOOL: Tool = {
    name: GET_CONTENT_FROM_URL_TOOL_NAME,
    description: "Extracts text from a PDF document from a given URL. It can handle both direct links to PDF files and Google Drive sharing URLs (e.g., https://drive.google.com/file/d/...).",
    inputSchema: {
        type: "object",
        properties: {
            url: { type: "string" }
        },
        required: ["url"]
    }
};


async function fetchContentFromPdfUrl(params: any) {
    const { url } = params;
    let returnRes = Response.initializeResponse();

    try {
        let finalPdfUrl = url;
        if (url.includes('drive.google.com')) {
            const regex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]{25,})/;
            const match = url.match(regex);
            if (match && match[1]) {
                const fileId = match[1];
                finalPdfUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
            } else {
                finalPdfUrl = url;
            }
        }

        const response = await fetch(finalPdfUrl);

        if (!response.ok) {
            if (url.includes('drive.google.com')) {
                Response.pushText(returnRes, `Failed to download file from Google Drive. Please ensure the file sharing permissions are set to 'Anyone with the link'. Status: ${response.statusText}`);
            } else {
                Response.pushText(returnRes, `Failed to fetch PDF from ${finalPdfUrl}: ${response.statusText} (Status: ${response.status})`);
            }
        } else {
            const arrayBuffer = await response.arrayBuffer();

            const dataBuffer = Buffer.from(arrayBuffer);

            const data = await pdf(dataBuffer);

            Response.pushText(returnRes, data.text);
        }
    } catch (error: any) {
        if (url.includes('drive.google.com')) {
            Response.pushText(returnRes, 'Could not read the PDF from the Google Drive link. The tool could not parse the content, which can happen if the file is not publicly shared. Please ensure the sharing setting is "Anyone with the link".');
        } else {
            Response.pushText(returnRes, `Error fetching text of PDF from URL: ${error.message}`);
        }
    }

    Response.setResponse(returnRes, false, "");

    return returnRes;

}


async function readPdfContentFromUrl(pdfUrl: string): Promise<PdfContent[]> {

    let finalPdfUrl = pdfUrl;
    if (pdfUrl.includes('drive.google.com')) {
        const regex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]{25,})/;
        const match = pdfUrl.match(regex);
        if (match && match[1]) {
            const fileId = match[1];
            finalPdfUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
        } else {
            finalPdfUrl = pdfUrl;
        }
    }

    try {
        const response = await fetch(finalPdfUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdfDocument.numPages;

        const allPdfContent: PdfContent[] = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map((item: any) => item.str);
            const pageText = textItems.join(' ');

            // --- Simplified Image Extraction (Highly Conceptual/Limited) ---
            // Real-world image extraction is much more involved.
            // PDF.js doesn't give you direct image files easily.
            // You might have to render the page to a canvas and then analyze the canvas pixels
            // or inspect the rendering instructions.
            // Below is just a placeholder for where you'd attempt image extraction logic.

            const images: string[] = [];
            // Example of a very basic (and often insufficient) attempt to find image objects
            // in the rendering list. This will NOT give you the actual image data directly
            // in an easily consumable format (like base64). You'd typically need to
            // render the page and then extract from the canvas, or use more advanced
            // PDF.js internals to find image streams.

            // const operatorList = await page.getOperatorList();
            // operatorList.fnArray.forEach((fn, i) => {
            //   if (fn === pdfjsLib.OPS.paintJpegXObject || fn === pdfjsLib.OPS.paintImageXObject) {
            //     // This only tells you there's an image. Getting the data is harder.
            //     // You would need to map this to actual image data, often by
            //     // looking up `operatorList.argsArray[i]` in the page's resources.
            //     images.push(`Image found on page ${i}! (Extraction needs more logic)`);
            //   }
            // });


            // A more practical approach for images often involves rendering the page to a canvas
            // and then using canvas API to get image data, but this often means you get
            // a composite image of the page, not individual image assets.
            // For individual images, you might need a more specialized library or a server-side solution.

            allPdfContent.push({
                pageNumber: i,
                text: pageText,
                images: images, // This array will likely be empty or contain placeholders with this simplified approach
            });
        }

        return allPdfContent;

    } catch (error) {
        console.error('Error reading PDF:', error);
        throw error;
    }
}

export {
    fetchContentFromPdfUrl,
    GET_CONTENT_FROM_URL_TOOL_NAME,
    GET_CONTENT_FROM_URL_TOOL,
}