import type {
  RangeSet,
  Range,
  Extension,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  gutter,
  GutterMarker,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

import {rangeInSelection} from "../../../../utils/range-in-selection";
import showPopupMenu from "./window-register/application-menu-helper";

// implemented according to  https://github.com/Zettlr/Zettlr/blob/develop/source/common/modules/markdown-editor/renderers/render-headings.ts

function hideHeadingMarks(view: EditorView): RangeSet<Decoration> {
  const ranges: Array<Range<Decoration>> = [];
  const hiddenDeco = Decoration.replace({});

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        if (rangeInSelection(view.state, node.from, node.to, true)) {
          return;
        }

        if (!node.name.startsWith("ATXHeading")) {
          return;
        }

        const mark = node.node.getChild("HeaderMark");
        if (mark === null) {
          return;
        }

        const span = view.state.sliceDoc(mark.to, node.to);
        let offset = 0;
        while (span.charAt(offset) === " ") {
          offset++;
        }
        ranges.push(hiddenDeco.range(mark.from, mark.to + offset));
        return false;
      },
    });
  }

  return Decoration.set(ranges, true);
}


const headingMarksPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = hideHeadingMarks(view);
    }

    update(update: ViewUpdate): void {
      this.decorations = hideHeadingMarks(update.view);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);


class HeadingMarkGutter extends GutterMarker {
  constructor(
    private readonly level: number,
    private readonly lineFrom: number,
    private readonly lineTo: number
  ) {
    super();
  }

  toDOM(view: EditorView): HTMLElement {
    const mark = document.createElement("div");
    mark.textContent = `h${this.level}`;

    // deal with click
    mark.addEventListener("click", (e) => {
      // Prevent bubbling because otherwise the context menu will be hidden
      // again immediately due to the event bubbling upwards to the window.
      e.stopPropagation();
      this.showLevelMenu(e, view);
    });

    return mark;
  }

  // Display a small menu to change the heading level on click
  showLevelMenu(event: MouseEvent, view: EditorView) {
    const currentLevel = this.level;
    const lineStart = this.lineFrom;
    const lineEnd = this.lineTo;

    const items = [1, 2, 3, 4, 5, 6].map((level) => ({
      id: level.toString(),
      label: "#".repeat(level),
      type: "checkbox",
      enabled: !view.state.readOnly,
      checked: level === currentLevel,
    }));
    const point = { x: event.clientX, y: event.clientY };
    showPopupMenu(point, items as any, (id) => {
      const newLevel = parseInt(id, 10);
      if (isNaN(newLevel) || newLevel === currentLevel) return;

      // find current title and update it
      // const line = view.state.selection.main.head;
      // const lineStart = view.state.doc.lineAt(line).from;
      // const lineEnd = view.state.doc.lineAt(line).to;
      const lineText = view.state.doc.sliceString(lineStart, lineEnd);
      // console.log("lineText:", lineText);

      // replace the level of the title
      const hashRE = RegExp(/^(#{1,6})/.source, "g");
      const newText = lineText.replace(hashRE, `#`.repeat(newLevel));
      // console.log("newText:", newText);

      view.dispatch({
        changes: {
          from: lineStart,
          to: lineEnd,
          insert: newText,
        },
        selection: {
          anchor: lineStart + newLevel + 1, // Move the cursor after the title
        },
      });
    });
  }
}

const headingGutter: Extension[] = [
  gutter({
    class: "cm-heading-gutter",
    renderEmptyElements: false,
    initialSpacer: () => new HeadingMarkGutter(1, 0, 0),
    lineMarker(view, line, _otherMarkers) {
      const node = syntaxTree(view.state).resolve(line.from, 1);
      if (node.name !== "HeaderMark") {
        return null;
      }

      const parent = node.parent;
      if (parent === null || !parent.name.startsWith("ATXHeading")) {
        return null;
      }

      const level = parseInt(parent.name.slice(10), 10);
      if (Number.isNaN(level)) {
        return null;
      }

      return new HeadingMarkGutter(level, line.from, line.to);
    },
  }),
  EditorView.baseTheme({
    ".cm-heading-gutter .cm-gutterElement": {
      display: "flex",
      alignItems: "center",
    },
    ".cm-heading-gutter .cm-gutterElement div": {
      fontFamily: "monospace",
      opacity: "0.3",
      fontSize: "80%",
    },
  }),
];

export const headingExtension = [headingMarksPlugin, headingGutter];
