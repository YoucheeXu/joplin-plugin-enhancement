// modify from https://github.com/personalizedrefrigerator/joplin-plugin-diff-tool/blob/main/src/pickNote/
import debounce from "../../../utils/debounce";
import makeLabeledInput from "./makeLabeledInput";

type OnConfirm = (rows: number, cols: number) => void;

export const makeRowsColsInput = (onConfirm: OnConfirm, defaultRows = 2, defaultCols = 3) => {
    const container = document.createElement("div");
    container.classList.add("table-dimensions-input");

    const { container: rowsInputContainer, input: rowsInput } =
        makeLabeledInput("Rows:", "number");
    rowsInputContainer.classList.add("dimension-input");
    rowsInput.min = "1";
    rowsInput.value = defaultRows.toString();

    const { container: colsInputContainer, input: colsInput } =
        makeLabeledInput("Cols:", "number");
    colsInputContainer.classList.add("dimension-input");
    colsInput.min = "1";
    // colsInput.value = defaultCols.toString();    // it will cause "Uncaught (in promise) TypeError: (intermediate value) is not iterable" by Joplin

    const isPositiveInteger = (value: string): boolean => {
        const num = Number(value);
        return !isNaN(num) && Number.isInteger(num) && num >= 1;
    };

    colsInput.oninput = debounce(async () => {
        if (!rowsInput.value) {
            return;
        }

        if (!colsInput.value) {
            return;
        }

        const rowsValue = rowsInput.value.trim();
        const colsValue = colsInput.value.trim();

        if (!isPositiveInteger(rowsValue)) {
            alert("请输入有效的行数（正整数）");
            rowsInput.focus();
            return;
        }
        if (!isPositiveInteger(colsValue)) {
            alert("请输入有效的列数（正整数）");
            colsInput.focus();
            return;
        }

        console.log(`rows: ${rowsValue}, cols: ${colsValue}`);

        onConfirm(Number(rowsValue), Number(colsValue));
    }, 300);

    container.replaceChildren(rowsInputContainer, colsInputContainer);
    return container;
};
