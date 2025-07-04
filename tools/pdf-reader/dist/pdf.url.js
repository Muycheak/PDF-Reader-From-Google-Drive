"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_TEXT_FROM_URL_TOOL = exports.GET_TEXT_FROM_URL_TOOL_NAME = void 0;
exports.readPdfContentFromUrl = readPdfContentFromUrl;
exports.getTextPdfFromUrl = getTextPdfFromUrl;
var node_fetch_1 = require("node-fetch");
var pdf = require("pdf-parse");
var Response = require("./response.util.js");
var pdfjsLib = require("pdfjs-dist");
var GET_TEXT_FROM_URL_TOOL_NAME = "get_text_from_url";
exports.GET_TEXT_FROM_URL_TOOL_NAME = GET_TEXT_FROM_URL_TOOL_NAME;
var GET_TEXT_FROM_URL_TOOL = {
    name: GET_TEXT_FROM_URL_TOOL_NAME,
    description: "Extracts text from a PDF document from a given URL. It can handle both direct links to PDF files and Google Drive sharing URLs (e.g., https://drive.google.com/file/d/...).",
    inputSchema: {
        type: "object",
        properties: {
            url: { type: "string" }
        },
        required: ["url"]
    }
};
exports.GET_TEXT_FROM_URL_TOOL = GET_TEXT_FROM_URL_TOOL;
function getTextPdfFromUrl(params) {
    return __awaiter(this, void 0, void 0, function () {
        var url, returnRes, finalPdfUrl, regex, match, fileId, response, arrayBuffer, dataBuffer, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = params.url;
                    returnRes = Response.initializeResponse();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    finalPdfUrl = url;
                    if (url.includes('drive.google.com')) {
                        regex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]{25,})/;
                        match = url.match(regex);
                        if (match && match[1]) {
                            fileId = match[1];
                            finalPdfUrl = "https://docs.google.com/uc?export=download&id=".concat(fileId);
                        }
                        else {
                            finalPdfUrl = url;
                        }
                    }
                    return [4 /*yield*/, (0, node_fetch_1.default)(finalPdfUrl)];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    if (url.includes('drive.google.com')) {
                        Response.pushText(returnRes, "Failed to download file from Google Drive. Please ensure the file sharing permissions are set to 'Anyone with the link'. Status: ".concat(response.statusText));
                    }
                    else {
                        Response.pushText(returnRes, "Failed to fetch PDF from ".concat(finalPdfUrl, ": ").concat(response.statusText, " (Status: ").concat(response.status, ")"));
                    }
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, response.arrayBuffer()];
                case 4:
                    arrayBuffer = _a.sent();
                    dataBuffer = Buffer.from(arrayBuffer);
                    return [4 /*yield*/, pdf(dataBuffer)];
                case 5:
                    data = _a.sent();
                    Response.pushText(returnRes, data.text);
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    if (url.includes('drive.google.com')) {
                        Response.pushText(returnRes, 'Could not read the PDF from the Google Drive link. The tool could not parse the content, which can happen if the file is not publicly shared. Please ensure the sharing setting is "Anyone with the link".');
                    }
                    else {
                        Response.pushText(returnRes, "Error fetching text of PDF from URL: ".concat(error_1.message));
                    }
                    return [3 /*break*/, 8];
                case 8:
                    Response.setResponse(returnRes, false, "");
                    return [2 /*return*/, returnRes];
            }
        });
    });
}
function readPdfContentFromUrl(pdfUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var finalPdfUrl, regex, match, fileId, response, arrayBuffer, pdfDocument, numPages, allPdfContent, i, page, textContent, textItems, pageText, images, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    finalPdfUrl = pdfUrl;
                    if (pdfUrl.includes('drive.google.com')) {
                        regex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]{25,})/;
                        match = pdfUrl.match(regex);
                        if (match && match[1]) {
                            fileId = match[1];
                            finalPdfUrl = "https://docs.google.com/uc?export=download&id=".concat(fileId);
                        }
                        else {
                            finalPdfUrl = pdfUrl;
                        }
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(finalPdfUrl)];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch PDF: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.arrayBuffer()];
                case 3:
                    arrayBuffer = _a.sent();
                    return [4 /*yield*/, pdfjsLib.getDocument({ data: arrayBuffer }).promise];
                case 4:
                    pdfDocument = _a.sent();
                    numPages = pdfDocument.numPages;
                    allPdfContent = [];
                    i = 1;
                    _a.label = 5;
                case 5:
                    if (!(i <= numPages)) return [3 /*break*/, 9];
                    return [4 /*yield*/, pdfDocument.getPage(i)];
                case 6:
                    page = _a.sent();
                    return [4 /*yield*/, page.getTextContent()];
                case 7:
                    textContent = _a.sent();
                    textItems = textContent.items.map(function (item) { return item.str; });
                    pageText = textItems.join(' ');
                    images = [];
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
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 5];
                case 9: return [2 /*return*/, allPdfContent];
                case 10:
                    error_2 = _a.sent();
                    console.error('Error reading PDF:', error_2);
                    throw error_2;
                case 11: return [2 /*return*/];
            }
        });
    });
}
