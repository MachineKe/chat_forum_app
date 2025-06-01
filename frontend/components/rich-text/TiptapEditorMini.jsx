import React from "react";
import TiptapEditorMiniBox from "./TiptapEditorMiniBox";

/**
 * TiptapEditorMini - chat-specific mini rich text editor, fully isolated.
 * Props are the same as TiptapEditor.
 */
export default function TiptapEditorMini(props) {
  return <TiptapEditorMiniBox {...props} />;
}
