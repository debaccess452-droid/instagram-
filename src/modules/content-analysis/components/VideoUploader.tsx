import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  UploadCloud,
  FileVideo,
  X,
  Play,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive,
  Layers,
  ArrowRight,
  Loader2,
  Lock,
  Database,
  ShieldCheck,
  RotateCcw,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/buttons";
import { VideoPreviewPlayer } from "./VideoPreviewPlayer";
import { DEMO_PRESET_REELS } from "../data/demoAnalysis";
import {
  contentAnalysisService,
  ALLOWED_VIDEO_EXTENSIONS,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_FILE_SIZE_BYTES,
  STORAGE_BUCKET,
} from "../services/contentAnalysisService";
import { ContentAnalysisRecord } from "../types/analysis";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export type UploadUiStatus = "idle" | "ready" | "uploading" | "success" | "error";

interface VideoUploaderProps {
  onStartAnalysis?: (file: File | null, duration: number, presetId?: string) => void;
  onUploadSuccess?: (record: ContentAnalysisRecord) => void;
  onAnalyzeAudio?: (record: ContentAnalysisRecord) => void;
  onOpenHistory?: () => void;
  isAnalyzing?: boolean;
  isAnalyzingAudio?: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onStartAnalysis,
  onUploadSuccess,
  onAnalyzeAudio,
  onOpenHistory,
  isAnalyzing = false,
  isAnalyzingAudio = false,
}) => {
  const { isAuthenticated, supabaseUser } = useAuth();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(28.5);
  const [uploadStatus, setUploadStatus] = useState<UploadUiStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [uploadedRecord, setUploadedRecord] = useState<ContentAnalysisRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);
    setSelectedPresetId(null);
    setUploadedRecord(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
      setUploadStatus("error");
      setErrorMessage("Unsupported video format. Please upload an MP4, MOV, or WEBM video file.");
      return;
    }

    if (file.type && !ALLOWED_VIDEO_MIME_TYPES.includes(file.type)) {
      setUploadStatus("error");
      setErrorMessage(
        `Unsupported video MIME type (${file.type}). Supported types are video/mp4, video/quicktime, and video/webm.`
      );
      return;
    }

    if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadStatus("error");
      setErrorMessage(
        `File size (${sizeMb} MB) exceeds maximum allowed limit of 100 MB.`
      );
      return;
    }

    setSelectedFile(file);
    setUploadStatus("ready");

    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);

    // Read video metadata duration
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration && !isNaN(tempVideo.duration) && tempVideo.duration !== Infinity) {
        setVideoDuration(tempVideo.duration);
      }
    };
    tempVideo.src = objectUrl;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = DEMO_PRESET_REELS.find((p) => p.id === presetId);
    if (!preset) return;
    setErrorMessage(null);
    setSelectedPresetId(presetId);
    setSelectedFile(null);
    setUploadedRecord(null);
    setUploadStatus("ready");
    setVideoUrl(preset.result.videoUrl || null);
    setVideoDuration(preset.result.durationSeconds);
  };

  const handleRemoveVideo = () => {
    setSelectedFile(null);
    if (videoUrl && !selectedPresetId) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setSelectedPresetId(null);
    setUploadedRecord(null);
    setUploadStatus("idle");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Upload Reel to Supabase Storage and create database record
   */
  const handleUploadReel = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a video file to upload.");
      return;
    }

    if (!isAuthenticated) {
      setUploadStatus("error");
      setErrorMessage(
        "You must be logged in to upload Reels to private storage. Please sign in to your account."
      );
      return;
    }

    try {
      setUploadStatus("uploading");
      setErrorMessage(null);

      const { record } = await contentAnalysisService.uploadReel(
        selectedFile,
        videoDuration
      );

      setUploadedRecord(record);
      setUploadStatus("success");
      onUploadSuccess?.(record);
    } catch (err: any) {
      console.error("[VideoUploader] Upload error:", err);
      setUploadStatus("error");
      setErrorMessage(
        err.message || "An unexpected error occurred while uploading your Reel. Please try again."
      );
    }
  };

  /**
   * Starts sample preset demo walkthrough if preset selected
   */
  const handleStartPresetDemo = () => {
    if (selectedPresetId && onStartAnalysis) {
      onStartAnalysis(null, videoDuration, selectedPresetId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  const activePreset = DEMO_PRESET_REELS.find((p) => p.id === selectedPresetId);

  return (
    <div className="space-y-6">
      {/* Main Upload Card */}
      <div className="relative rounded-2xl border border-card-border bg-gradient-to-b from-card to-background-elevated p-6 sm:p-8 shadow-card overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-primary">
              <FileVideo className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Reel Storage & Analysis Backend
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Upload your Reel for Deep Analysis
          </h2>
          <p className="mt-1 text-sm text-text-secondary leading-relaxed">
            Upload an Instagram Reel to your private storage bucket to register and
            prepare it for AI multimodal intelligence.
          </p>
        </div>

        {/* Authentication Warning Banner if not logged in */}
        {!isAuthenticated && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-primary/10 border border-primary/25 p-3.5 text-xs text-text-primary">
            <div className="flex items-center gap-2.5">
              <Lock className="h-4 w-4 text-primary shrink-0" />
              <span>
                <strong>Sign-in required for Reel uploads:</strong> You must be authenticated
                to store Reels in your private Supabase storage bucket.
              </span>
            </div>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-hover shrink-0 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Link>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-error/10 border border-error/25 p-3.5 text-sm text-error">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-xs uppercase tracking-wider">Upload Error</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
            {uploadStatus === "error" && selectedFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadReel}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                className="shrink-0"
              >
                Retry
              </Button>
            )}
          </div>
        )}

        {/* Upload State / Preview State */}
        {!selectedFile && !selectedPresetId ? (
          <div className="mt-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer group",
                dragActive
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-card-border hover:border-primary/50 hover:bg-white/[0.02]"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
                onChange={handleFileInputChange}
                className="hidden"
                aria-label="Upload video file"
              />

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-card-border/80 text-primary shadow-soft group-hover:scale-105 group-hover:border-primary/40 transition-transform">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-text-primary">
                Drag and drop your Reel here, or{" "}
                <span className="text-primary hover:underline">browse files</span>
              </h3>
              <p className="mt-1.5 text-xs text-text-muted">
                Supports MP4, MOV, and WEBM • Up to 100MB limit • Stored in private bucket
              </p>

              <div className="mt-5 flex items-center gap-4 text-[11px] text-text-secondary flex-wrap justify-center">
                <span className="flex items-center gap-1.5 bg-background/60 px-2.5 py-1 rounded-md border border-card-border">
                  <Lock className="h-3 w-3 text-trust" />
                  Private Supabase Storage
                </span>
                <span className="flex items-center gap-1.5 bg-background/60 px-2.5 py-1 rounded-md border border-card-border">
                  <Database className="h-3 w-3 text-primary" />
                  public.content_analyses Sync
                </span>
                <span className="flex items-center gap-1.5 bg-background/60 px-2.5 py-1 rounded-md border border-card-border">
                  <ShieldCheck className="h-3 w-3 text-success" />
                  Authenticated User Ownership
                </span>
              </div>
            </div>

            {/* Pre-loaded sample presets */}
            <div className="mt-6 pt-6 border-t border-card-border/80">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Or test immediately with a sample Reel:
                </span>
                <span className="text-xs text-text-muted">Demo data preview</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {DEMO_PRESET_REELS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className="flex flex-col text-left p-3.5 rounded-xl border border-card-border bg-card/60 hover:bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {preset.category}
                      </span>
                      <span className="text-[11px] font-mono text-text-muted">
                        {preset.duration}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {preset.title}
                    </h4>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {preset.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-text-muted pt-2 border-t border-card-border/50">
                      <Layers className="h-3 w-3" />
                      <span>{preset.sceneCount} Detected Scenes</span>
                      <ArrowRight className="h-3 w-3 ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Video Selected / Uploaded State with Player Preview */
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Player Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm">
                  <VideoPreviewPlayer
                    src={videoUrl || undefined}
                    poster={
                      activePreset?.previewThumbnail ||
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
                    }
                    durationSeconds={videoDuration}
                    aspectRatio="9:16"
                  />
                </div>
              </div>

              {/* Right Column: Video Specs & Actions */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                <div className="rounded-xl border border-card-border bg-card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {/* Accurate Upload Status Badges */}
                      {selectedPresetId ? (
                        <span className="inline-flex items-center gap-1 rounded bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning border border-warning/30">
                          <Sparkles className="h-3 w-3" />
                          Sample Demo Preset
                        </span>
                      ) : uploadStatus === "ready" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/30">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Ready to upload
                        </span>
                      ) : uploadStatus === "uploading" ? (
                        <span className="inline-flex items-center gap-1.5 rounded bg-warning/15 px-2.5 py-0.5 text-[11px] font-semibold text-warning border border-warning/30 animate-pulse">
                          <Loader2 className="h-3 w-3 animate-spin text-warning" />
                          Uploading
                        </span>
                      ) : uploadStatus === "success" ? (
                        <span className="inline-flex items-center gap-1.5 rounded bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold text-success border border-success/30">
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          Upload successful
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-error/15 px-2.5 py-0.5 text-[11px] font-semibold text-error border border-error/30">
                          <AlertTriangle className="h-3 w-3 text-error" />
                          Upload failed
                        </span>
                      )}

                      <h3 className="text-lg font-bold text-text-primary mt-1.5 break-words">
                        {selectedFile ? selectedFile.name : activePreset?.title}
                      </h3>
                      {activePreset ? (
                        <p className="text-xs text-text-secondary mt-0.5">
                          Sample preset: {activePreset.category}
                        </p>
                      ) : (
                        <p className="text-xs text-text-muted mt-0.5 font-mono">
                          {uploadStatus === "success" && uploadedRecord
                            ? `Status: ${uploadedRecord.status} • Storage Bucket: ${STORAGE_BUCKET}`
                            : `Format: ${selectedFile?.type || "video/mp4"}`}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      disabled={uploadStatus === "uploading"}
                      className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50"
                      title="Remove or replace video"
                      aria-label="Remove video"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    <div className="rounded-lg bg-background-elevated p-3 border border-card-border">
                      <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>Duration</span>
                      </div>
                      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">
                        {formatDuration(videoDuration)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-background-elevated p-3 border border-card-border">
                      <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                        <HardDrive className="h-3.5 w-3.5 text-primary" />
                        <span>File Size</span>
                      </div>
                      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">
                        {selectedFile ? formatFileSize(selectedFile.size) : "24.6 MB"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-background-elevated p-3 border border-card-border col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <span>MIME Type</span>
                      </div>
                      <p className="mt-1 font-mono text-sm font-semibold text-text-primary truncate">
                        {selectedFile?.type || "video/mp4"}
                      </p>
                    </div>
                  </div>

                  {/* Uploading State Live Progress Banner */}
                  {uploadStatus === "uploading" && (
                    <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-text-primary">
                            Uploading Reel to Supabase...
                          </p>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            Transferring video file to private bucket{" "}
                            <code className="text-primary font-mono">{STORAGE_BUCKET}</code>{" "}
                            and registering record in{" "}
                            <code className="text-primary font-mono">public.content_analyses</code>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Successful Detailed Information Card */}
                  {uploadStatus === "success" && uploadedRecord && (
                    <div className="rounded-xl border border-success/30 bg-success/10 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-success font-semibold text-xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Reel Upload Confirmed in Backend</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-text-secondary font-mono bg-background/80 p-3 rounded-lg border border-card-border">
                        <div className="flex justify-between gap-2">
                          <span className="text-text-muted">Record ID:</span>
                          <span className="text-text-primary truncate max-w-xs">{uploadedRecord.id}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-text-muted">Status:</span>
                          <span className="text-success font-semibold uppercase">{uploadedRecord.status}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-text-muted">Storage Path:</span>
                          <span className="text-text-primary truncate max-w-xs">{uploadedRecord.file_path}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-text-muted">File Name:</span>
                          <span className="text-text-primary truncate max-w-xs">{uploadedRecord.file_name}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-text-muted">
                        Your Reel is safely stored in private Supabase Storage and registered in the database.
                        Gemini AI multimodal analysis will process this record in the next step.
                      </p>
                    </div>
                  )}

                  {/* Pipeline checklist for ready state */}
                  {uploadStatus === "ready" && !selectedPresetId && (
                    <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border text-xs text-text-secondary space-y-2">
                      <p className="font-semibold text-text-primary">
                        Upload pipeline verification:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-success" />
                          <span>MIME format verified ({selectedFile?.type || "video/mp4"})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-success" />
                          <span>Within 100 MB limit ({selectedFile ? formatFileSize(selectedFile.size) : ""})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>Folder: user UUID partition</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>Database: public.content_analyses</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {selectedPresetId ? (
                    /* Sample preset test action */
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleStartPresetDemo}
                        disabled={isAnalyzing}
                        leftIcon={<Sparkles className="h-5 w-5" />}
                        className="shadow-glow-primary text-base py-3.5"
                      >
                        Preview Sample Reel Analysis
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleRemoveVideo}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : uploadStatus === "success" ? (
                    /* Success state actions */
                    <>
                      {onAnalyzeAudio && uploadedRecord && (
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          onClick={() => onAnalyzeAudio(uploadedRecord)}
                          disabled={isAnalyzingAudio}
                          leftIcon={
                            isAnalyzingAudio ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Sparkles className="h-5 w-5" />
                            )
                          }
                          className="shadow-glow-primary text-base py-3.5"
                        >
                          {isAnalyzingAudio ? "Analyzing Audio..." : "Analyze Audio"}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleRemoveVideo}
                        disabled={isAnalyzingAudio}
                        className="w-full sm:w-auto"
                      >
                        Upload Another Reel
                      </Button>
                      {onOpenHistory && (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={onOpenHistory}
                          disabled={isAnalyzingAudio}
                          className="w-full sm:w-auto"
                        >
                          View In History
                        </Button>
                      )}
                    </>
                  ) : (
                    /* Ready or Error state upload button */
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleUploadReel}
                        disabled={uploadStatus === "uploading" || !isAuthenticated}
                        leftIcon={
                          uploadStatus === "uploading" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <UploadCloud className="h-5 w-5" />
                          )
                        }
                        className="shadow-glow-primary text-base py-3.5"
                      >
                        {uploadStatus === "uploading"
                          ? "Uploading to Backend..."
                          : "Upload Reel"}
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleRemoveVideo}
                        disabled={uploadStatus === "uploading"}
                        className="w-full sm:w-auto"
                      >
                        Change Video
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
