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
var node_fetch_1 = require("node-fetch");
var pdf = require("pdf-parse");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var CHECK_IN_GUIDE_FROM_URL_TOOL_NAME = "check_in_guide_from_url";
var CHECK_IN_GUIDE_FROM_URL_TOOL = {
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
function convertGoogleDriveLinkToDirectDownload(driveUrl) {
    var regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(view|edit|preview)/;
    var match = driveUrl.match(regex);
    if (match && match[1]) {
        var fileId = match[1];
        return "https://docs.google.com/uc?export=download&id=".concat(fileId);
    }
    return driveUrl;
}
function getTextPdfFromUrl(params) {
    return __awaiter(this, void 0, void 0, function () {
        var pdfUrl, finalPdfUrl, response, arrayBuffer, dataBuffer, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    pdfUrl = params.pdfUrl;
                    finalPdfUrl = pdfUrl;
                    if (pdfUrl.includes('drive.google.com')) {
                        finalPdfUrl = convertGoogleDriveLinkToDirectDownload(pdfUrl);
                        if (finalPdfUrl === pdfUrl) {
                            console.warn("Warning: Could not convert Google Drive sharing link to direct download. Make sure the file is publicly accessible and the link format is correct (e.g., .../file/d/FILE_ID/view). Attempting to fetch the original URL.");
                        }
                    }
                    return [4 /*yield*/, (0, node_fetch_1.default)(finalPdfUrl)];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch PDF from ".concat(finalPdfUrl, ": ").concat(response.statusText, " (Status: ").concat(response.status, ")"));
                    }
                    return [4 /*yield*/, response.arrayBuffer()];
                case 2:
                    arrayBuffer = _a.sent();
                    dataBuffer = Buffer.from(arrayBuffer);
                    return [4 /*yield*/, pdf(dataBuffer)];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, data.text];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error fetching text of PDF from URL: ".concat(error_1.message));
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
var server = new index_js_1.Server({
    name: "pdf_url_mcp_server",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, ({
                tools: [CHECK_IN_GUIDE_FROM_URL_TOOL]
            })];
    });
}); });
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var text, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                if (!(request.params.name !== CHECK_IN_GUIDE_FROM_URL_TOOL_NAME)) return [3 /*break*/, 1];
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, "Unknown tool: ".concat(request.params.name));
            case 1: return [4 /*yield*/, getTextPdfFromUrl(request.params.arguments)];
            case 2:
                text = _a.sent();
                return [2 /*return*/, { text: text }];
            case 3: return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: "Error: ".concat(error_2 instanceof Error ? error_2.message : String(error_2))
                            }],
                        isError: true
                    }];
            case 5: return [2 /*return*/];
        }
    });
}); });
function runServer() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("Airxpress MCP Server running on stdio");
                    return [2 /*return*/];
            }
        });
    });
}
runServer().catch(function (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
