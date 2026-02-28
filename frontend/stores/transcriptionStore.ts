import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transcription {
  id: string;
  video_url: string;
  status: string;
  text?: string | null;
  backup_url: string;
  created_at: string;
}

interface TranscriptionStore {
  transcriptions: Transcription[];
  addTranscription: (transcription: Transcription) => void;
  updateTranscription: (id: string, updates: Partial<Transcription>) => void;
  deleteTranscription: (id: string) => void;
  getTranscription: (id: string) => Transcription | undefined;
  clearAll: () => void;
}

export const useTranscriptionStore = create<TranscriptionStore>()(
  persist(
    (set, get) => ({
      transcriptions: [],

      addTranscription: (transcription) =>
        set((state) => ({
          transcriptions: [transcription, ...state.transcriptions],
        })),

      updateTranscription: (id, updates) =>
        set((state) => ({
          transcriptions: state.transcriptions.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        })),

      deleteTranscription: (id) =>
        set((state) => ({
          transcriptions: state.transcriptions.filter((t) => t.id !== id),
        })),

      getTranscription: (id) => {
        return get().transcriptions.find((t) => t.id === id);
      },

      clearAll: () => set({ transcriptions: [] }),
    }),
    {
      name: "vidwhisper-transcriptions",
    },
  ),
);
