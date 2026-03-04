"use client";

import { useState, useCallback, useRef } from "react";
import {
  Link2,
  FileAudio,
  Upload,
  StopCircle,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useTranscriptionStore,
  type Transcription,
} from "@/stores/transcriptionStore";
import { useTranslations } from "next-intl";

type InputMode = "url" | "file";
type TranscriptionStatus =
  | "idle"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export default function MainTranscription() {
  const {
    transcriptions,
    addTranscription,
    updateTranscription,
    deleteTranscription,
  } = useTranscriptionStore();

  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [urlValue, setUrlValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [resultText, setResultText] = useState("");
  const [currentTranscriptionId, setCurrentTranscriptionId] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = useTranslations("MainTranscription");

  // ── Drag & Drop ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleTranscribe = () => {
    setStatus("pending");
    setProgress(0);
    setResultText("");
  };

  const handleStop = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setStatus("idle");
    setProgress(0);
  };

  const handleRetry = () => {
    setStatus("idle");
    setProgress(0);
    setResultText("");
  };

  const handleDelete = (id: string) => {
    deleteTranscription(id);
  };

  const isProcessing = status === "pending" || status === "processing";
  const canTranscribe =
    !isProcessing &&
    status !== "completed" &&
    (inputMode === "url" ? urlValue.trim().length > 0 : selectedFile !== null);

  return (
    <>
      <Card className="bg-white/3 border border-white/10 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="pt-2 px-6 text-center">
          <CardTitle className="text-white/80 text-md font-medium uppercase tracking-widest">
            {t("title")}{" "}
            <span className="text-violet-400 font-semibold">
              {t("title_span")}
            </span>{" "}
            {t("title2")}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 left-0 w-fit">
            <button
              onClick={() => {
                setInputMode("url");
                setSelectedFile(null);
              }}
              disabled={isProcessing}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                inputMode === "url"
                  ? "bg-violet-600/80 text-white shadow-md shadow-violet-500/20"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              <Link2 className="w-3.5 h-3.5" />
              {t("inputType.link")}
            </button>
            <button
              onClick={() => setInputMode("file")}
              disabled={isProcessing}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                inputMode === "file"
                  ? "bg-violet-600/80 text-white shadow-md shadow-violet-500/20"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              <FileAudio className="w-3.5 h-3.5" />
              {t("inputType.file")}
            </button>
          </div>

          {inputMode === "url" ? (
            /* URL input */
            <div className="relative">
              <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                id="url-input"
                disabled={isProcessing}
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/60 focus:ring-violet-500/20 h-12 rounded-xl transition-all"
              />
            </div>
          ) : (
            /* File upload */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-10 px-6 cursor-pointer transition-all duration-200",
                dragOver
                  ? "border-violet-500/80 bg-violet-500/10"
                  : selectedFile
                    ? "border-cyan-500/50 bg-cyan-500/5"
                    : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/4",
                isProcessing && "pointer-events-none opacity-60",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/mp4,.mp3,.mp4,.wav,.m4a,.ogg,.webm"
                className="hidden"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              {selectedFile ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                    <FileAudio className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/90 font-medium text-sm">
                      {selectedFile.name}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <p className="text-white/30 text-xs">{t("changeFile")}</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white/40" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/70 font-medium text-sm">
                      {t("textDrag1")}
                    </p>
                    <p className="text-white/35 text-xs mt-1">
                      {t("textDrag2")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {["MP3", "MP4"].map((ext) => (
                      <span
                        key={ext}
                        className="text-xs bg-white/5 border border-white/10 text-white/40 rounded-md px-2 py-0.5"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Status / Progress Zone ── */}
          {isProcessing && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                  <span>
                    {status === "pending"
                      ? "Iniciando transcripción…"
                      : "Procesando…"}
                  </span>
                </div>
                <span className="text-violet-400 font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress
                value={progress}
                className="h-1.5 bg-white/5 [&>div]:bg-linear-to-r [&>div]:from-violet-500 [&>div]:to-cyan-400"
              />
            </div>
          )}

          {status === "failed" && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm flex-1">
                {t("failedMessage")}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRetry}
                  className="text-red-300 hover:text-red-200 hover:bg-red-500/10 h-7 px-2 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  {t("retry")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStatus("idle")}
                  className="text-white/40 hover:text-white/60 hover:bg-white/5 h-7 px-2 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {status === "completed" && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-emerald-300 text-sm flex-1">
                {t("completedMessage")}
              </p>
              <Button
                size="sm"
                onClick={() => setResultText(resultText)}
                className="h-7 px-3 text-xs bg-emerald-600/80 hover:bg-emerald-600 text-white border-0"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                {t("viewText")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRetry}
                className="text-white/40 hover:text-white/60 hover:bg-white/5 h-7 px-2 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* ── Result textarea ── */}
          {status === "completed" && resultText && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <FileText className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
                  {t("transcriptionResult")}
                </span>
              </div>
              <Textarea
                readOnly
                value={resultText}
                className="min-h-35 bg-white/3 border-white/10 text-white/80 text-sm resize-none rounded-xl focus:border-violet-500/40 focus:ring-violet-500/10 leading-relaxed"
              />
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="flex gap-3 pt-1">
            {isProcessing ? (
              <Button
                onClick={handleStop}
                className="flex-1 h-12 rounded-xl bg-red-600/80 hover:bg-red-600 text-white border-0 font-medium text-sm gap-2 transition-all"
              >
                <StopCircle className="w-4 h-4" />
                {t("stopTranscription")}
              </Button>
            ) : (
              <Button
                onClick={handleTranscribe}
                disabled={!canTranscribe}
                className={cn(
                  "flex-1 h-12 rounded-xl text-white border-0 font-semibold text-sm gap-2 transition-all duration-200 shadow-lg",
                  canTranscribe
                    ? "bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01]"
                    : "bg-white/5 text-white/25 shadow-none cursor-not-allowed",
                )}
              >
                {t("transcribe")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
