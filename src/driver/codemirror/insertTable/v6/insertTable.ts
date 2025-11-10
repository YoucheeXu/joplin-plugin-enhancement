import { EditorView } from '@codemirror/view';
import {buildPipeMarkdownTable} from "../../../../utils/build-pipe-markdown-table";
import {replaceSelection} from "../../../../utils/cm-utils";


export default function insertTable(cm: EditorView, rows: number, cols: number) {
    console.log(`inset table ${rows} * ${cols}`);

    console.log("cm instanceof EditorView: ", cm instanceof EditorView);

    if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
        console.error(`rows is ${typeof(rows)}, cols is ${typeof(cols)}`)
        return;
    }
    if (rows < 0 || cols < 0) {
        console.error(`table dimension must great then 0: ${rows} * ${cols}`)
        return;
    }

    const spec = {
        rows: rows,
        cols: cols,
    };
    const align: Array<"center" | "left" | "right" | null> = Array(
        spec.cols
    ).fill(null);
    const row = (): string[] => Array(spec.cols).fill("");
    const ast: string[][] = Array.from({ length: spec.rows }, row);
    const tableData = buildPipeMarkdownTable(ast, align);

    console.log(tableData);

    replaceSelection(cm, tableData);
};