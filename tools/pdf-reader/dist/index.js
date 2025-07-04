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
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var pdfUrl = require("./pdf.url.js");
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
                tools: [pdfUrl.GET_TEXT_FROM_URL_TOOL]
            })];
    });
}); });
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = request.params.name;
                switch (_a) {
                    case pdfUrl.GET_TEXT_FROM_URL_TOOL_NAME: return [3 /*break*/, 1];
                }
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, pdfUrl.getTextPdfFromUrl(request.params.arguments)];
            case 2: return [2 /*return*/, _b.sent()];
            case 3:
                {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, "Unknown tool: ".concat(request.params.name));
                }
                _b.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: error_1 instanceof Error ? error_1.message : "An unknown error occurred."
                            }],
                        isError: false
                    }];
            case 6: return [2 /*return*/];
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
    var url = "https://drive.google.com/file/d/1fbvJORDR-x0aJqKWakfFIC5hhQCYQhxT/view?usp=sharing";
    try {
        var result = pdfUrl.readPdfContentFromUrl(url);
        console.log(result);
    }
    catch (error) {
        console.log(error);
    }
}
readPdfContentFromUrl();
