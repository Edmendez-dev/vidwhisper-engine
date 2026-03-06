import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transcription {
  id: string; // ID simple (1, 2, 3, etc.)
  backendId: string; // ObjectId del backend
  video_url: string;
  status: string;
  progress: number;
  text?: string | null;
  backup_url: string;
  created_at: string;
}

// Helper para determinar el tipo de fuente
export const getSourceType = (videoUrl: string): "youtube" | "file" => {
  const lowerUrl = videoUrl.toLowerCase();
  return lowerUrl.includes("youtube") ||
    lowerUrl.includes("youtu.be") ||
    lowerUrl.includes("youtube.com")
    ? "youtube"
    : "file";
};

interface TranscriptionStore {
  transcriptions: Transcription[];
  nextId: number; // Contador para IDs simples
  addTranscription: (transcription: Transcription) => Transcription;
  updateTranscription: (id: string, updates: Partial<Transcription>) => void;
  deleteTranscription: (id: string) => void;
  getTranscription: (id: string) => Transcription | undefined;
  clearAll: () => void;
  loadTranscriptions: (apiUrl?: string) => Promise<void>;
  setTranscriptions: (transcriptions: Transcription[]) => void;
  submitTranscription: (
    input: { mode: "url"; url: string } | { mode: "file"; file: File },
  ) => Promise<Transcription>;
  pollTranscriptionStatus: (
    backendId: string,
    onUpdate: (transcription: Transcription) => void,
  ) => () => void;
}

export const useTranscriptionStore = create<TranscriptionStore>()(
  persist(
    (set, get) => ({
      transcriptions: [],
      nextId: 1,

      addTranscription: (transcription) => {
        const state = get();
        const newId = state.nextId;
        const newTranscription = { ...transcription, id: newId.toString() };
        set({
          transcriptions: [newTranscription, ...state.transcriptions],
          nextId: newId + 1,
        });
        return newTranscription;
      },

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

      clearAll: () => set({ transcriptions: [], nextId: 1 }),

      setTranscriptions: (transcriptions) =>
        set({ transcriptions, nextId: transcriptions.length + 1 }),

      loadTranscriptions: async (
        apiUrl = "http://localhost:8000/api/v1/transcriptions/",
      ) => {
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error("Error al cargar transcripciones");

          const data = await response.json();

          // Mapear las transcripciones del backend a nuestro formato con IDs simples
          const mappedTranscriptions: Transcription[] = data.map(
            (item: any, index: number) => ({
              id: (index + 1).toString(), // ID simple
              backendId: item.id, // ObjectId original
              video_url: item.video_url,
              status: item.status,
              progress: item.progress,
              text: item.text,
              backup_url: item.backup_url,
              created_at: item.created_at,
            }),
          );

          set({
            transcriptions: mappedTranscriptions,
            nextId: mappedTranscriptions.length + 1,
          });
        } catch (error) {
          console.error("Error loading transcriptions:", error);
        }
      },

      submitTranscription: async (input) => {
        try {
          let response;

          if (input.mode === "url") {
            response = await fetch(
              "http://localhost:8000/api/v1/transcriptions/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  video_url: input.url,
                }),
              },
            );
          } else {
            const formData = new FormData();
            formData.append("file", input.file);

            response = await fetch(
              "http://localhost:8000/api/v1/transcriptions/file",
              {
                method: "POST",
                body: formData,
              },
            );
          }

          if (!response.ok) {
            throw new Error("Error al enviar la transcripción");
          }

          const data = await response.json();

          // Add to store
          const state = get();
          const newTranscription = state.addTranscription({
            id: "",
            backendId: data.id,
            video_url: data.video_url,
            status: data.status,
            progress: data.progress,
            text: data.text,
            backup_url: data.backup_url,
            created_at: data.created_at,
          });

          return newTranscription;
        } catch (error) {
          console.error("Error submitting transcription:", error);
          throw error;
        }
      },

      pollTranscriptionStatus: (backendId, onUpdate) => {
        const intervalId = setInterval(async () => {
          try {
            const response = await fetch(
              `http://localhost:8000/api/v1/transcriptions/${backendId}`,
            );

            if (!response.ok) {
              throw new Error("Error al obtener estado de transcripción");
            }

            const data = await response.json();

            // Search for the transcription in the store using backendId
            const state = get();
            const transcription = state.transcriptions.find(
              (t) => t.backendId === backendId,
            );

            if (transcription) {
              // Update the transcription in the store
              state.updateTranscription(transcription.id, {
                status: data.status,
                progress: data.progress,
                text: data.text,
                video_url: data.video_url,
                backup_url: data.backup_url,
              });

              // Call the onUpdate callback with the updated transcription
              onUpdate({
                ...transcription,
                status: data.status,
                progress: data.progress,
                text: data.text,
                video_url: data.video_url,
                backup_url: data.backup_url,
              });

              // if the transcription is completed or failed, stop polling
              if (data.status === "completed" || data.status === "failed") {
                clearInterval(intervalId);
              }
            }
          } catch (error) {
            console.error("Error polling transcription status:", error);
          }
        }, 2000); // Poll every 2 seconds

        // Return a function to clear the interval when the component unmounts or when polling should stop
        return () => clearInterval(intervalId);
      },
    }),
    {
      name: "vidwhisper-transcriptions",
    },
  ),
);
