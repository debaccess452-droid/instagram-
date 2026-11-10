import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/buttons";
import { VideoPreviewPlayer } from "./VideoPreviewPlayer";
import { DEMO_PRESET_REELS } from "../data/demoAnalysis";
import { cn } from "@/utils/cn";

interface VideoUploaderProps {
  onStartAnalysis: (file: File | null, duration: number, presetId?: string) => void;
  isAnalyzing: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onStartAnalysis,
  isAnalyzing,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(28.5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ALLOWED_EXTENSIONS = ["mp4", "mov", "webm"];
  const MAX_FILE_SIZE_MB = 100;

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);
    setSelectedPresetId(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage("Please upload an MP4, MOV, or WEBM video file.");
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      setErrorMessage(
        `File size (${sizeMb.toFixed(1)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB.`
      );
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);

    // Read metadata duration
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
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile && !selectedPresetId) {
      setErrorMessage("Please upload a video or select a sample Reel to analyze.");
      return;
    }
    onStartAnalysis(selectedFile, videoDuration, selectedPresetId || undefined);
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
      {/* Main Upload Box */}
      <div className="relative rounded-2xl border border-card-border bg-gradient-to-b from-card to-background-elevated p-6 sm:p-8 shadow-card overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute top-0 right-1/4 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-primary">
              <FileVideo className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Multimodal Video Pipeline
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Upload your Reel for Deep Analysis
          </h2>
          <p className="mt-1 text-sm text-text-secondary leading-relaxed">
            Upload an Instagram Reel or short-form video to extract its complete audio,
            visuals, text, script, and editing structure.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-5 flex items-center gap-3 rounded-md bg-error/10 border border-error/25 p-3.5 text-sm text-error">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
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
                Supports MP4, MOV, and WEBM • Up to 100MB • Vertical 9:16 recommended
              </p>

              <div className="mt-5 flex items-center gap-4 text-[11px] text-text-secondary flex-wrap justify-center">
                <span className="flex items-center gap-1.5 bg-background/60 px-2.5 py-1 rounded-md border border-card-border">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Full Audio Transcription
                </span>
                <span className="flex items-center gap-1.5 bg-background/60 px-2.5 py-1 rounded-md border border-card-border">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Scene Visual Storyboarding
                </span>
                <span className="flex items-center gap-1.5 bg-background/60 px-2.5 py-1 rounded-md border border-card-border">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Frame-by-Frame OCR
                </span>
              </div>
            </div>

            {/* Pre-loaded sample presets */}
            <div className="mt-6 pt-6 border-t border-card-border/80">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Or test immediately with a sample Reel:
                </span>
                <span className="text-xs text-text-muted">No upload needed</span>
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
          /* Video Selected State with Player Preview */
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
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="rounded-xl border border-card-border bg-card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success border border-success/30">
                        <CheckCircle2 className="h-3 w-3" />
                        Ready for Analysis
                      </span>
                      <h3 className="text-lg font-bold text-text-primary mt-1.5 break-words">
                        {selectedFile ? selectedFile.name : activePreset?.title}
                      </h3>
                      {activePreset && (
                        <p className="text-xs text-text-secondary mt-0.5">
                          Sample preset: {activePreset.category}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                      title="Remove or replace video"
                      aria-label="Remove video"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
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
                        <span>Container</span>
                      </div>
                      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">
                        {selectedFile?.type || "video/mp4"}
                      </p>
                    </div>
                  </div>

                  {/* Pipeline checklist */}
                  <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border text-xs text-text-secondary space-y-2">
                    <p className="font-semibold text-text-primary">
                      Analysis engines ready to trigger:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Audio speech-to-text & tone</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Scene & camera motion analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Kinetic text OCR extraction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Original Reel script table sync</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzing}
                    leftIcon={<Sparkles className="h-5 w-5" />}
                    className="shadow-glow-primary text-base py-3.5"
                  >
                    Analyze My Reel
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleRemoveVideo}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto"
                  >
                    Change Video
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
