// modify from https://github.com/personalizedrefrigerator/joplin-plugin-diff-tool/blob/main/src/pickNote/
import joplin from 'api';
import {
	WebViewMessage,
	WebViewMessageType,
} from './messaging';
import { ViewHandle } from 'api/types';


let dialogHandle: ViewHandle | null = null;
const inputRowsCols = async () => {
	console.log("inputRowsCols, ", joplin.views.dialogs);
	const dialog =
        dialogHandle ??
        (await joplin.views.dialogs.create("input-rows-cols-dialog"));
	dialogHandle = dialog;

	await joplin.views.dialogs.addScript(dialog, "driver/codemirror/insertTable/v6/inputRowsCols/webview/webview.js");
	await joplin.views.dialogs.addScript(dialog, "driver/codemirror/insertTable/v6/inputRowsCols/webview/style.css");
	await joplin.views.dialogs.setHtml(
		dialog,
		`
			<h2>Input Rows and Cols</h2>
	`,
	);

	let result: [number, number] | null = null;
	await joplin.views.panels.onMessage(
		dialog,
		async (message: WebViewMessage) => {
            console.log(message.type);
            if (message.type == WebViewMessageType.OnInputRowsCols) {
                result = message.result;
            }
		},
	);

    await joplin.views.dialogs.setButtons(dialog, [
        { title: "OK", id: "ok" },
        { title: "Cancel", id: "cancel" },
    ]);
	const dialogOpenResult = await joplin.views.dialogs.open(dialog);

	console.log("input rows and cols: ", result);
	return dialogOpenResult.id === 'cancel' ? null : result;

};

export default inputRowsCols;
