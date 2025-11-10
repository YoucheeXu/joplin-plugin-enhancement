// modify from https://github.com/personalizedrefrigerator/joplin-plugin-diff-tool/blob/main/src/pickNote/
import {
    WebViewMessage,
    WebViewMessageType,
    WebViewResponse,
} from "../messaging";
import { makeRowsColsInput } from "./components/makeTableDimensionsInput";
// import {makeTableDimensionsInput} from "./components/makeTableDimensionsInput";

type WebViewAPI = {
    postMessage(message: WebViewMessage): Promise<WebViewResponse>;
};
declare const webviewApi: WebViewAPI;

(() => {
    const container = document.createElement("div");
    container.classList.add("main-content");

    const tableInput = makeRowsColsInput((rows, cols) => {
        console.log(`webview result: ${rows} * ${cols}`);
        webviewApi.postMessage({
            type: WebViewMessageType.OnInputRowsCols,
            result: [rows, cols],
        });
    });

    (
        document.querySelector("#joplin-plugin-content") ?? document.body
    ).appendChild(tableInput);
})();
