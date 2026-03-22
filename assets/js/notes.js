import { deleteNote, getNotes, saveNote } from "./storage.js";

export function bindNotesEditor({ lessonId, textarea, statusNode, onSaved }) {
  let timeoutId;

  function setStatus(message) {
    if (statusNode) {
      statusNode.textContent = message;
    }
  }

  textarea.addEventListener("input", () => {
    setStatus("Saving...");
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      saveNote(lessonId, textarea.value.trim());
      setStatus("Saved");
      if (typeof onSaved === "function") {
        onSaved();
      }
    }, 450);
  });
}

export function getAllNotesEntries() {
  return Object.entries(getNotes())
    .map(([lessonId, note]) => ({
      lessonId,
      ...note,
    }))
    .filter((note) => note.text);
}

export function updateNote(lessonId, text) {
  if (!text.trim()) {
    return deleteNote(lessonId);
  }
  return saveNote(lessonId, text.trim());
}
