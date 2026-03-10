"use client";

import { useState, useEffect } from "react";
import {
  FileAudio,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Youtube,
  Play,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useTranscriptionStore,
  type Transcription,
  getSourceType,
} from "@/stores/transcriptionStore";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "./audioPlayerOverrides.scss";
import { useTranslations, useLocale } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

export default function TranscriptionHistory() {
  const { transcriptions, deleteTranscription, loadTranscriptions } =
    useTranscriptionStore();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [audioId, setAudioId] = useState<string | null>(null);
  const t = useTranslations("TranscriptionHistory");
  const locale = useLocale();

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteTranscription(id);
      if (viewingId === id) setViewingId(null);
      if (audioId === id) setAudioId(null);
      toast.success(t("dialog.deleteSuccess"), { position: "bottom-center" });
    } catch (error) {
      console.error("Error deleting transcription:", error);
      toast.error("Error deleting transcription", {
        position: "bottom-center",
      });
    }
  };

  const formatDate = (dateString: string, locale: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const DeleteButton = ({ id }: { id: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="w-7 h-7 text-white/30 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("dialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("dialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white/30 hover:text-cyan-400 hover:bg-cyan-500/10">
            {t("dialog.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="text-white bg-red-500 hover:bg-red-700"
            onClick={() => handleDelete(id)}
          >
            {t("dialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const StatusBadge = ({ transcription }: { transcription: Transcription }) => {
    const isCompleted = transcription.status === "completed";
    const isFailed = transcription.status === "failed";
    if (isCompleted)
      return (
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t("status.completed")}
        </div>
      );
    if (isFailed)
      return (
        <div className="flex items-center gap-1.5 text-red-400 text-xs">
          <XCircle className="w-3.5 h-3.5" />
          {t("status.failed")}
        </div>
      );
    return (
      <div className="flex items-center gap-1.5 text-yellow-400 text-xs">
        <Clock className="w-3.5 h-3.5" />
        {t(`status.${transcription.status}`)}
      </div>
    );
  };

  const ActionButtons = ({
    transcription,
  }: {
    transcription: Transcription;
  }) => {
    const isCompleted = transcription.status === "completed";
    const isFailed = transcription.status === "failed";
    return (
      <div className="flex items-center justify-end gap-1">
        {isCompleted && transcription.text && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setViewingId(
                viewingId === transcription.id ? null : transcription.id,
              )
            }
            className="w-7 h-7 text-white/30 hover:text-violet-400 hover:bg-violet-500/10"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
        )}
        {isCompleted && transcription.backup_url && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setAudioId(audioId === transcription.id ? null : transcription.id)
            }
            className="w-7 h-7 text-white/30 hover:text-cyan-400 hover:bg-cyan-500/10"
          >
            <Play className="w-3.5 h-3.5" />
          </Button>
        )}
        {isFailed && (
          <Button
            size="icon"
            variant="ghost"
            className="w-7 h-7 text-white/30 hover:text-amber-400 hover:bg-amber-500/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        )}
        <DeleteButton id={transcription.id} />
      </div>
    );
  };

  const PreviewSection = ({
    transcription,
  }: {
    transcription: Transcription;
  }) => (
    <>
      {viewingId === transcription.id && transcription.text && (
        <div className="border-t border-white/5 px-4 sm:px-5 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <span className="text-xs text-white/35 uppercase tracking-wider font-medium truncate">
              {t("transcription")} #{transcription.id} —{" "}
              {truncate(transcription.video_url, 40)}
            </span>
          </div>
          <Textarea
            readOnly
            value={transcription.text}
            className="min-h-25 bg-white/2 border-white/8 text-white/60 text-xs resize-none rounded-xl"
          />
        </div>
      )}
      {audioId === transcription.id && transcription.backup_url && (
        <div className="border-t border-white/5 px-4 sm:px-5 py-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Play className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <span className="text-xs text-white/35 uppercase tracking-wider font-medium">
              {t("audio")} #{transcription.id}
            </span>
          </div>
          <AudioPlayer
            src={transcription.backup_url}
            autoPlay={false}
            className="rounded-xl bg-white/5 border border-white/10"
          />
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 sm:flex-row flex-col">
        <Clock className="w-4 h-4 text-white/30 shrink-0" />
        <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest whitespace-nowrap">
          {t("title")}
        </h2>
        <Separator className="w-16 h-px sm:flex-1 sm:w-auto" />
        <Badge
          variant="outline"
          className="text-white/30 border-white/10 text-xs shrink-0 ml-auto sm:ml-0"
        >
          {transcriptions.length} {t("totalRecords")}
        </Badge>
      </div>
      <Card className="bg-white/2 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-sm">
        {/* ── Mobile: card list (hidden on sm+) ── */}

        <div
          className="sm:hidden divide-y divide-white/5 overflow-y-auto max-h-105 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          style={{ scrollbarGutter: "stable" }}
        >
          {transcriptions.length === 0 ? (
            <p className="text-center text-white/25 text-sm py-12 px-4">
              {t("noRecords")}
            </p>
          ) : (
            transcriptions.map((transcription) => {
              const sourceType = getSourceType(transcription.video_url);
              return (
                <div key={transcription.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    {/* Source */}
                    <div className="flex items-center gap-2 min-w-0">
                      {sourceType === "youtube" ? (
                        <Youtube className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <FileAudio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                      <span className="text-white/60 text-xs truncate font-mono">
                        {truncate(transcription.video_url, 32)}
                      </span>
                    </div>
                    <ActionButtons transcription={transcription} />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs border",
                        sourceType === "youtube"
                          ? "text-red-400 border-red-500/20 bg-red-500/5"
                          : "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
                      )}
                    >
                      {sourceType === "youtube"
                        ? t("type.youtube")
                        : t("type.file")}
                    </Badge>
                    <StatusBadge transcription={transcription} />
                    <span className="text-white/25 text-xs ml-auto">
                      {formatDate(transcription.created_at, locale)}
                    </span>
                  </div>
                  <PreviewSection transcription={transcription} />
                </div>
              );
            })
          )}
        </div>

        {/* ── Desktop: table (hidden on mobile) ── */}
        <div className="hidden sm:block">
          <div
            className="overflow-y-auto max-h-105 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            style={{ scrollbarGutter: "stable" }}
          >
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  <TableHead className="text-white/30 text-xs font-medium uppercase tracking-wider w-8">
                    #
                  </TableHead>
                  <TableHead className="text-white/30 text-xs font-medium uppercase tracking-wider">
                    {t("TableData.fountain")}
                  </TableHead>
                  <TableHead className="text-white/30 text-xs font-medium uppercase tracking-wider">
                    {t("TableData.type")}
                  </TableHead>
                  <TableHead className="text-white/30 text-xs font-medium uppercase tracking-wider">
                    {t("TableData.state")}
                  </TableHead>
                  <TableHead className="text-white/30 text-xs font-medium uppercase tracking-wider">
                    {t("TableData.date")}
                  </TableHead>
                  <TableHead className="text-white/30 text-xs font-medium uppercase tracking-wider text-right">
                    {t("TableData.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transcriptions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-white/25 text-sm py-12"
                    >
                      {t("noRecords")}
                    </TableCell>
                  </TableRow>
                ) : (
                  transcriptions.map((transcription) => {
                    const sourceType = getSourceType(transcription.video_url);
                    return (
                      <TableRow
                        key={transcription.id}
                        className="border-white/5 hover:bg-white/3 transition-colors"
                      >
                        <TableCell className="text-white/60 text-xs font-medium">
                          {transcription.id}
                        </TableCell>
                        <TableCell className="max-w-55">
                          <div className="flex items-center gap-2">
                            {sourceType === "youtube" ? (
                              <Youtube className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            ) : (
                              <FileAudio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            )}
                            <span className="text-white/60 text-xs truncate font-mono">
                              {truncate(transcription.video_url, 40)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs border",
                              sourceType === "youtube"
                                ? "text-red-400 border-red-500/20 bg-red-500/5"
                                : "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
                            )}
                          >
                            {sourceType === "youtube"
                              ? t("type.youtube")
                              : t("type.file")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge transcription={transcription} />
                        </TableCell>
                        <TableCell className="text-white/35 text-xs">
                          {formatDate(transcription.created_at, locale)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActionButtons transcription={transcription} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Previews desktop — fuera del scroll */}
          {transcriptions.map((transcription) => (
            <PreviewSection
              key={`preview-${transcription.id}`}
              transcription={transcription}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
