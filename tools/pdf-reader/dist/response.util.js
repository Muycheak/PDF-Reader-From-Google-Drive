"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushText = exports.pushJson = exports.setResponse = exports.initializeResponse = void 0;
var initializeResponse = function () {
    var response = { isError: false, content: [] };
    return response;
};
exports.initializeResponse = initializeResponse;
var setResponse = function (response, isError, referenceUrl) {
    response.isError = isError;
    response.referenceUrl = referenceUrl;
};
exports.setResponse = setResponse;
var pushText = function (response, text) {
    if (!response.content) {
        response.content = [];
    }
    var content = {
        type: "text",
        text: text,
        referenceUrl: response.referenceUrl || ""
    };
    response.content.push(content);
};
exports.pushText = pushText;
var pushJson = function (response, json) {
    if (!response.content) {
        response.content = [];
    }
    var content = {
        type: "text",
        text: JSON.stringify({
            content: json
        }, null, 2),
        referenceUrl: response.referenceUrl || ""
    };
    response.content.push(content);
};
exports.pushJson = pushJson;
