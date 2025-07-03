
const initializeResponse = () => {
    const response = { isError: false, content: [] };
    return response;
};

const setResponse = (response: any, isError: boolean, referenceUrl: string) => {
    response.isError = isError;
    response.referenceUrl = referenceUrl;
}

const pushText = (response: any, text: string) => {
    if (!response.content) {
        response.content = [];
    }
    const content = {
            type: "text",
            text: text,
            referenceUrl: response.referenceUrl || ""
        };
    response.content.push(content);
}

const pushJson = (response: any, json: any) => {
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
}

export {
    initializeResponse,
    setResponse,
    pushJson,
    pushText
};
