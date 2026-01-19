/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        CodeMirror formatting bar hook
 * CVM-Role:        CodeMirror 6 plugin
 * License:         GNU GPL v3
 *
 * Description:     Provides a pop-up menu that allows users to quickly
 *                  execute commands with a mouse or touchscreen.
 *
 * END HEADER
 */

// Helpful documentation:
// - https://codemirror.net/examples/tooltip/

import { requireCodeMirrorState, requireCodeMirrorView } from '../../../../utils/cm-dynamic-require';
import type { EditorState, SelectionRange } from '@codemirror/state';
import type { Tooltip } from '@codemirror/view';
import { ContentScriptContext } from 'api/types';
import { ContextMsgType } from '../../../../common';
import { stat } from 'fs';
import { isDragging } from './dragDetection';

interface CommandInfo {
    name: string;
    alt: string;

    /** Space-separated list of class names to give to the icon. */
    icon: string;

    // Secondary sub-command list, optional
    subCommands?: {
        name: string;
        alt: string;
        icon: string;
    }[];
}

const commandInfos: CommandInfo[] = [
    {
        name: "markdownBold",
        icon: "fas fa-bold in-button",
        alt: "Bold",
    },
    {
        name: "markdownItalic",
        icon: "fas fa-italic in-button",
        alt: "Italic",
    },
    {
        name: "markdownStrikeThrough",
        icon: "fas fa-strikethrough in-button",
        alt: "Strike Through",
    },
    {
        name: "markdownLink",
        icon: "fas fa-link in-button",
        alt: "Link",
    },
    {
        name: "markdownCode",
        icon: "fas fa-code in-button",
        alt: "Inline Code",
    },
    {
        name: "markdownInlineMath",
        icon: "fas fa-square-root-alt in-button",
        alt: "Inline Math",
    },
    {
        name: "markdownHightlight",
        icon: "fas fa-fill-drip in-button",
        alt: "Text Background",
        subCommands: [1, 2, 3, 4, 5, 6, 7].map(
            (i): CommandInfo => ({
                name: `markdownHL${i}`,
                icon: `fas fa-circle color${i} in-button`,
                alt: `Color ${i}`,
            })
        ),
    },
];

function isMultiLineSelection(state: EditorState, range: SelectionRange) {
    const startLine = state.doc.lineAt(range.from);
    const endLine = state.doc.lineAt(range.to);
    return startLine.number !== endLine.number;
}

// Global variable: Record the currently expanded secondary menu (used to close other menus)
let activeSubMenu: HTMLElement | null = null;
// Global event handler (avoid repeated creation)
let clickOutsideHandler: ((e: MouseEvent) => void) | null = null;

const buildTooltips = (state: EditorState, context: ContentScriptContext): Tooltip[] => {
    return state.selection.ranges
        // Only show for non-empty selection ranges
        .filter(range => {
            // console.log(`Dragging: ${isDragging}`);
            return !range.empty && !isMultiLineSelection(state, range);
        })
        .map((range): Tooltip => {
            console.debug(`build tooltip`);
            return {
                pos: range.from,
                above: true,
                arrow: false,
                create: (_view) => {
                    // Main container: formattingBar
                    const container = document.createElement("div");
                    container.classList.add("cm-editor-formatting-bar");

                    // Traverse main commands to generate buttons (handle with/without subcommands)
                    for (const commandInfo of commandInfos) {
                        // 1. Create main button
                        const mainButton = document.createElement("button");
                        // mainButton.classList.add("main-command-btn");
                        mainButton.setAttribute("title", commandInfo.alt);
                        mainButton.setAttribute("aria-label", commandInfo.alt);

                        // Main button icon
                        const mainIcon = document.createElement("i");
                        mainIcon.classList.add(...commandInfo.icon.split(" "));
                        mainButton.appendChild(mainIcon);

                        // 2. Only create submenu if subCommands exist (avoid empty DOM)
                        let subMenu: HTMLElement | null = null;
                        if (
                            commandInfo.subCommands &&
                            commandInfo.subCommands.length > 0
                        ) {
                            subMenu = document.createElement("div");
                            subMenu.classList.add("sub-command-menu");
                            subMenu.style.display = "none"; // Hidden by default

                            // Generate secondary sub-buttons
                            commandInfo.subCommands!.forEach((subCmd) => {
                                const subButton =
                                    document.createElement("button");
                                // subButton.classList.add("sub-command-btn");
                                subButton.setAttribute(
                                    "aria-label",
                                    subCmd.alt
                                );
                                subButton.setAttribute("title", subCmd.alt);

                                // Sub-button icon (optional)
                                if (subCmd.icon) {
                                    const subIcon = document.createElement("i");
                                    subIcon.classList.add(
                                        ...subCmd.icon.split(" ")
                                    );
                                    subButton.appendChild(subIcon);
                                }
                                // Sub-button text (optional, can use icon only)
                                // const subText = document.createTextNode(
                                //     subCmd.alt
                                // );
                                // subButton.appendChild(subText);

                                // Sub-button click event: Send message + close secondary menu
                                subButton.addEventListener("click", (e) => {
                                    e.stopPropagation(); // Prevent bubbling to main button
                                    // Send sub-command message
                                    context.postMessage({
                                        type: ContextMsgType.SHORTCUT,
                                        content: subCmd.name,
                                    });

                                    if (subMenu) {
                                        // Close current secondary menu
                                        subMenu.style.display = "none";
                                    }
                                    activeSubMenu = null;
                                });

                                subMenu.appendChild(subButton);
                            });
                        }

                        // 3. Main button click event
                        // commandButton.onclick = () => {
                        mainButton.addEventListener("click", (e) => {
                            e.stopPropagation(); // Prevent bubbling to outside

                            // console.debug(`mainButton clicked!`);

                            // Case 1: Command has subcommands → toggle submenu (original behavior)
                            if (
                                commandInfo.subCommands &&
                                commandInfo.subCommands.length > 0
                            ) {

                                // console.debug(`mainButton has subCommands.`);

                                // Close other expanded menus
                                if (
                                    activeSubMenu &&
                                    activeSubMenu !== subMenu
                                ) {
                                    activeSubMenu.style.display = "none";
                                }

                                // console.debug(
                                //     `subMenu = ${subMenu}`
                                // );
                                // console.debug(
                                //     `subMenu.style.display = ${subMenu.style.display}`
                                // );
                                // Toggle current menu display state
                                const isVisible =
                                    subMenu.style.display === "flex";
                                subMenu.style.display = isVisible
                                    ? "none"
                                    : "flex";
                                activeSubMenu = isVisible ? null : subMenu;

                                // console.debug(`subCommands visible = ${isVisible}`);

                                // Optimization: Automatically adjust menu direction (avoid viewport overflow)
                                if (!isVisible) {
                                    const rect =
                                        subMenu.getBoundingClientRect();
                                    // If menu bottom overflows viewport, display upward instead
                                    if (rect.bottom > window.innerHeight) {
                                        subMenu.style.top = "auto";
                                        subMenu.style.bottom = "100%";
                                        subMenu.style.marginTop = "0";
                                        subMenu.style.marginBottom = "4px";
                                    }
                                }
                            }
                            // Case 2: Command has NO subcommands → trigger main command directly
                            else {
                                // Close any open submenu first (consistent UX)
                                if (activeSubMenu) {
                                    activeSubMenu.style.display = "none";
                                    activeSubMenu = null;
                                }
                                // Send main command message (customize logic as needed)
                                context.postMessage({
                                    type: ContextMsgType.SHORTCUT,
                                    content: commandInfo.name, // Use main command name
                                });
                            }
                        });

                        // 4. Assemble DOM: Only add submenu if it exists
                        const buttonWrapper = document.createElement("div");
                        buttonWrapper.classList.add("command-btn-wrapper");
                        buttonWrapper.appendChild(mainButton);
                        // Avoid empty submenu DOM for commands without subcommands
                        if (subMenu) {
                            buttonWrapper.appendChild(subMenu);
                        }

                        // container.appendChild(mainButton);
                        container.appendChild(buttonWrapper);
                    }

                    // Global click event is bound only once and supports cleanup
                    if (!clickOutsideHandler) {
                        clickOutsideHandler = (e: MouseEvent) => {
                            const target = e.target as HTMLElement;
                            // Exclude internal elements of the toolbar
                            if (!container.contains(target) && activeSubMenu) {
                                activeSubMenu.style.display = "none";
                                activeSubMenu = null;
                            }
                        };
                        document.addEventListener("click", clickOutsideHandler);
                    }

                    return {
                        dom: container,
                        destroy: () => {
                            // Remove global click event
                            if (clickOutsideHandler) {
                                document.removeEventListener(
                                    "click",
                                    clickOutsideHandler
                                );
                                clickOutsideHandler = null;
                            }
                            // Clear activeSubMenu
                            activeSubMenu = null;
                        },
                    };
                }
            };
        });
};

const formattingBarStateField = (context: ContentScriptContext) => {
    const { StateField } = requireCodeMirrorState();
    const { showTooltip, EditorView } = requireCodeMirrorView();

    return StateField.define<readonly Tooltip[]>({
        // Initial state
        create: state => buildTooltips(state, context),

        update: (tooltips, tr) => {
            if (isDragging) {
                console.debug(`dragging: hide tooltip`);
                return [];
            }

            if (tr.state.selection.ranges.length > 1) {
                console.debug(`multichoice: hide tooltip`);
                return [];
            }

            if (!tr.docChanged && !tr.selection && tooltips.length >= 1) {
                console.debug(`statefild isDragging = ${isDragging}`);
                console.debug(`show tooltip`);
                return tooltips;
            }

            return buildTooltips(tr.state, context);
        },

        provide: (field) => {
            const deps = [ field ];
            return showTooltip.computeN(
                deps,
                state => state.field(field),
            );
        },
    });
};

const formattingBar = (context: ContentScriptContext) => {
    const { EditorView } = requireCodeMirrorView();

    return [
        formattingBarStateField(context),
        EditorView.baseTheme({
            "& .cm-tooltip.cm-editor-formatting-bar": {
                display: "flex",
                "flex-direction": "row",
                "border-radius": "5px",

                border: "none",
                "background-color": "rgba(51, 51,51, 0.85)",

                "& button": {
                    "background-color": "transparent",
                    border: "none",
                    "flex-grow": 1,
                    padding: "4px 8px",
                    width: "35px",
                    height: "35px",
                    color: "white",
                    transition: "0.3s all ease",

                    "&:hover, &:focus-visible": {
                        "background-color": "rgb(120, 120, 120)",
                    },
                    "&:first-child": {
                        "border-top-left-radius": "4px",
                        "border-bottom-left-radius": "4px",
                    },
                    "&:last-child": {
                        "border-top-right-radius": "4px",
                        "border-bottom-right-radius": "4px",
                    },
                    "&.main-command-btn-no-sub:hover": {
                        "background-color": "rgb(100, 100, 100)",
                    },
                },
                "& i.fas": {
                    "font-family": "'Font Awesome 5 Free' !important",
                    "&.color1": {
                        color: "#ffd400",
                    },
                    "&.color2": {
                        color: "#ff6666",
                    },
                    "&.color3": {
                        color: "#5fb236",
                    },
                    "&.color4": {
                        color: "#2ea8e5",
                    },
                    "&.color5": {
                        color: "#a28ae5",
                    },
                    "&.color6": {
                        color: "#e56eee",
                    },
                    "&.color7": {
                        color: "#f19837",
                    },
                },
                "& > .command-btn-wrapper": {
                    position: "relative", // This makes the submenu position relative to the wrapper
                    zIndex: 100000, // Higher than toolbar, lower than submenu
                    display: "flex", // Match toolbar's flex layout for buttons
                },
                "& .sub-command-menu": {
                    // Absolute positioning: breaks out of toolbar's flex layout
                    position: "absolute",
                    top: "100%", // Position directly below the wrapper/button
                    left: 0,
                    marginTop: "4px", // Small gap from button
                    padding: "4px", // Add padding around the horizontal row
                    backgroundColor: "rgba(51, 51, 51, 0.95)",
                    border: "none",
                    borderRadius: "4px",
                    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
                    zIndex: 100001, // Higher than wrapper (ensures it floats above everything)
                    // display: "flex !important",
                    // HORIZONTAL: Change flexDirection to row (from column)
                    "flex-direction": "row !important",
                    // Prevent inheriting flex from toolbar
                    flex: "none",
                    // Ensure it's not part of the toolbar's layout flow
                    boxSizing: "border-box",
                },
            },
        }),
    ];
};

export default formattingBar;