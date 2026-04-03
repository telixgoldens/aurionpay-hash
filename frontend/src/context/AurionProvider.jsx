import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AurionContext = createContext({});

export function AurionProvider({ children }) {

  // ── Mode ───────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState(
    () => localStorage.getItem("aurion-mode") || "merchant"
  );

  function switchMode(newMode) {
    localStorage.setItem("aurion-mode", newMode);
    setMode(newMode);
  }

  // ── Notes ──────────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("aurion-notes") || "[]");
    } catch {
      return [];
    }
  });

  // ✅ Kept your original API exactly — no renames
  function saveNote(noteString) {
    const updated = [...notes, noteString];
    setNotes(updated);
    localStorage.setItem("aurion-notes", JSON.stringify(updated));
  }

  function removeNote(index) {
    const updated = notes.filter((_, i) => i !== index);
    setNotes(updated);
    localStorage.setItem("aurion-notes", JSON.stringify(updated));
  }

  // ── Intents ────────────────────────────────────────────────────────────────
  const [intents, setIntents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("aurion-intents") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("aurion-intents", JSON.stringify(intents));
  }, [intents]);

  const addIntent = useCallback((intent) => {
    setIntents((prev) => {
      const exists = prev.some((it) => String(it.id) === String(intent.id));
      if (exists) return prev;
      return [intent, ...prev]; // newest first
    });
  }, []);

  const updateIntentStatus = useCallback((intentId, status) => {
    setIntents((prev) =>
      prev.map((it) =>
        String(it.id) === String(intentId) ? { ...it, status } : it
      )
    );
  }, []);

  const getIntent = useCallback(
    (intentId) =>
      intents.find((it) => String(it.id) === String(intentId)) ?? null,
    [intents]
  );

  // Auto-expire OPEN intents when their expiresAt passes
  const clearExpiredIntents = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    setIntents((prev) =>
      prev.map((it) =>
        it.status === "OPEN" && it.expiresAt && it.expiresAt < now
          ? { ...it, status: "EXPIRED" }
          : it
      )
    );
  }, []);

  useEffect(() => {
    clearExpiredIntents();
    const id = setInterval(clearExpiredIntents, 30_000);
    return () => clearInterval(id);
  }, [clearExpiredIntents]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    // original — untouched
    mode,
    switchMode,
    notes,
    saveNote,
    removeNote,
    // new
    intents,
    addIntent,
    updateIntentStatus,
    getIntent,
  };

  return (
    <AurionContext.Provider value={value}>
      {children}
    </AurionContext.Provider>
  );
}

export function useAurion() {
  return useContext(AurionContext);
}