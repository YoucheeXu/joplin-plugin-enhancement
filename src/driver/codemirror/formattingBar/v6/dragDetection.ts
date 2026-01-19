import { EditorView } from "@codemirror/view";
import { ContentScriptContext } from "api/types";

export let isDragging = false;
let dragStopTimer: NodeJS.Timeout | null = null;
const DRAG_STOP_THRESHOLD = 500;

const getTimestamp = () => new Date().toISOString().slice(11, 23); // HH:MM:SS:mmm

const dragDetection = (_context: ContentScriptContext) => EditorView.domEventHandlers({
    // Mouse down: initialize drag state (prevent misjudgment of single clicks)
    pointerdown() {
        isDragging = false;
        console.debug(`[pointerdown] isDragging = ${isDragging}`);
        // Clear residual timer on mouse down
        if (dragStopTimer) {
            clearTimeout(dragStopTimer);
            dragStopTimer = null;
        }
    },
    // Mouse move + button pressed: mark as dragging state
    pointermove(e, view) {
        console.debug(
            `[PointerMove] e.buttons = ${e.buttons}`,
        );
        if (e.buttons === 1) {
            // Only trigger for left-button dragging
            isDragging = true;
            console.debug(`[PointerMove] isDragging = ${isDragging}`);

            if (dragStopTimer) clearTimeout(dragStopTimer);
            dragStopTimer = setTimeout(() => {
                // Exceed threshold without movement → mark drag end
                isDragging = false;
                console.debug(`[Timer] isDragging = ${isDragging}`);
                dragStopTimer = null;
                // Empty transaction triggers StateField.update
                view.dispatch({});
            }, DRAG_STOP_THRESHOLD);
        } else {
            // Left button not pressed → end drag immediately
            isDragging = false;
            console.debug(`[No Left Button] isDragging = ${isDragging}`);
            if (dragStopTimer) {
                clearTimeout(dragStopTimer);
                dragStopTimer = null;
            }
        }
    },
    // Mouse up/leave: exit dragging state
    pointerup(_e, view) {
        if(isDragging){
            isDragging = false;
            console.debug(`[PointerUp] isDragging = ${isDragging}`);
            view.dispatch({});
        }
        if (dragStopTimer) {
            clearTimeout(dragStopTimer);
            dragStopTimer = null;
        }
    },
    pointerleave(_e, view) {
        if(isDragging){
            isDragging = false;
            console.debug(`[PointerLeave] isDragging = ${isDragging}`);
            view.dispatch({});
        }
        if (dragStopTimer) {
            clearTimeout(dragStopTimer);
            dragStopTimer = null;
        }
    },
});

export default dragDetection;
