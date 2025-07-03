"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushText = exports.pushJson = exports.setResponse = exports.initializeResponse = void 0;
const initializeResponse = () => {
    const response = { isError: false, content: [] };
    return response;
};
exports.initializeResponse = initializeResponse;
const setResponse = (response, isError, referenceUrl) => {
    response.isError = isError;
    response.referenceUrl = referenceUrl;
};
exports.setResponse = setResponse;
const pushText = (response, text) => {
    if (!response.content) {
        response.content = [];
    }
    const content = {
        type: "text",
        text: text,
        referenceUrl: response.referenceUrl || ""
    };
    response.content.push(content);
};
exports.pushText = pushText;
const pushJson = (response, json) => {
    if (!response.content) {
        response.content = [];
    }
    const content = {
        type: "text",
        text: JSON.stringify({
            content: json
        }, null, 2),
        referenceUrl: response.referenceUrl || ""
    };
    response.content.push(content);
};
exports.pushJson = pushJson;
