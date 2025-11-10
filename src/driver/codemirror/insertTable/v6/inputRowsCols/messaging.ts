// copy from https://github.com/personalizedrefrigerator/joplin-plugin-diff-tool/blob/main/src/pickNote/
export enum WebViewMessageType {
    // SearchNotes = "SearchNotes",
    // GetDefaultSuggestions = "GetDefaultSuggestions",
    // GetMoreResults = "GetMoreResults",
    // OnNoteSelected = "OnNoteSelected",
    OnInputRowsCols = "OnInputRowsCols",
}

// interface SearchNotesMessage {
//   type: WebViewMessageType.SearchNotes;
//   query: string;
//   cursor?: number;
// }

// interface GetDefaultSuggestionsMessage {
//   type: WebViewMessageType.GetDefaultSuggestions;
// }

// interface OnNoteSelected {
//   type: WebViewMessageType.OnNoteSelected;
//   noteId: string;
// }

interface OnInputRowsCols {
    type: WebViewMessageType.OnInputRowsCols;
    result: [number, number];
}

export type WebViewMessage =
//   | SearchNotesMessage
//   | GetDefaultSuggestionsMessage
//   | OnNoteSelected
  | OnInputRowsCols;

export enum WebViewResponseType {
  NoteList = "noteList",
}

// export interface NoteSearchResult {
//   id: string;
//   title: string;
//   description: string;
// }

export type WebViewResponse = {
  type: WebViewResponseType.NoteList;
//   results: NoteSearchResult[];
//   hasMore: boolean;
//   cursor?: number;
} | null;
