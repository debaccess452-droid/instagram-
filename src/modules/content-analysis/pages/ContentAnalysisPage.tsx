import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  LayoutDashboard,
  Volume2,
  Camera,
  Type,
  FileSpreadsheet,
  Scissors,
  ShieldCheck,
  UploadCloud,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  ContentAnalysisResult,
  AnalysisTabType,
  AnalysisHistoryItem,
  ContentAnalysisRecord,
  AudioBackendResult,
} from "../types/analysis";
import { contentAnalysisService } from "../services/contentAnalysisService";
import { useAuth } from "@/hooks/useAuth";
import { AnalysisHeader } from "../components/AnalysisHeader";
import { VideoUploader } from "../components/VideoUploader";
import { VideoPreviewPlayer, VideoPreviewPlayerRef } from "../components/VideoPreviewPlayer";
import { AnalysisProgressModal } from "../components/AnalysisProgressModal";
import { AnalysisOverview } from "../components/AnalysisOverview";
import { AudioAnalysis } from "../components/AudioAnalysis";
import { VisualAnalysis } from "../components/VisualAnalysis";
import { TextExtraction } from "../components/TextExtraction";
import { OriginalScriptTable } from "../components/OriginalScriptTable";
import { EditingBreakdown } from "../components/EditingBreakdown";
import { AccuracyReport } from "../components/AccuracyReport";
import { AnalysisHistoryModal } from "../components/AnalysisHistoryModal";
import { ExportModal } from "../components/ExportModal";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

const ACTIVE_ANALYSIS_STORAGE_KEY = "virulmuse_active_analysis_id";

export const ContentAnalysisPage: React.FC = () => {
  const { supabaseUser } = useAuth();

  // Demo benchmark state (for pre-loaded sample reels)
  const [currentAnalysis, setCurrentAnalysis] = useState<ContentAnalysisResult | null>(null);

  // Real uploaded Reel state from Supabase
  const [realAudioRecord, setRealAudioRecord] = useState<ContentAnalysisRecord | null>(null);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState<boolean>(false);
  const [audioAnalysisError, setAudioAnalysisError] = useState<string | null>(null);
  const [isAnalyzingVisual, setIsAnalyzingVisual] = useState<boolean>(false);
  const [visualAnalysisError, setVisualAnalysisError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AnalysisTabType>("audio");
  const [isUploadMode, setIsUploadMode] = useState<boolean>(true);
  const [isDemoProcessing, setIsDemoProcessing] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Pending job ref for demo preset testing only
  const pendingDemoJobRef = useRef<{
    file: File | null;
    duration: number;
    presetId?: string;
  }>({ file: null, duration: 28.5 });

  const playerRef = useRef<VideoPreviewPlayerRef>(null);

  // 1. Load user records from Supabase on mount and restore active record if page reloaded
  useEffect(() => {
    let isCurrent = true;

    async function loadUserAnalysesAndRestore() {
      if (supabaseUser?.id) {
        const records = await contentAnalysisService.fetchUserAnalyses();
        if (!isCurrent) return;

        const items = records.map((r) =>
          contentAnalysisService.mapRecordToHistoryItem(r)
        );
        setHistoryItems(items);

        // Check if there was an active analysis stored before page reload
        const savedActiveId = localStorage.getItem(ACTIVE_ANALYSIS_STORAGE_KEY);
        if (savedActiveId) {
          const matching = records.find((r) => r.id === savedActiveId);
          if (matching) {
            setRealAudioRecord(matching);
            const url = await contentAnalysisService.getSignedPlaybackUrl(matching.file_path);
            if (isCurrent && url) {
              setSignedVideoUrl(url);
            }
            if (matching.audio_analysis_status === "failed") {
              setAudioAnalysisError(matching.audio_analysis_error || "Previous audio analysis failed.");
            }
            if (matching.visual_analysis_status === "failed") {
              setVisualAnalysisError(matching.visual_analysis_error || "Previous visual analysis failed.");
            }
            setIsUploadMode(false);
          }
        }
      } else {
        setHistoryItems([]);
      }
    }

    loadUserAnalysesAndRestore();

    return () => {
      isCurrent = false;
    };
  }, [supabaseUser?.id]);

  // 2. Upload success callback from VideoUploader
  const handleUploadSuccess = (record: ContentAnalysisRecord) => {
    setRealAudioRecord(record);
    setAudioAnalysisError(null);
    setVisualAnalysisError(null);
    localStorage.setItem(ACTIVE_ANALYSIS_STORAGE_KEY, record.id);

    const newItem = contentAnalysisService.mapRecordToHistoryItem(record);
    setHistoryItems((prev) => [newItem, ...prev.filter((p) => p.id !== record.id)]);
  };

  // 3. Real Audio Analysis invocation via Supabase Edge Function 'analyze-audio'
  const handleAnalyzeAudio = async (recordToAnalyze?: ContentAnalysisRecord | null) => {
    const targetRecord = recordToAnalyze || realAudioRecord;
    if (!targetRecord) return;

    if (isAnalyzingAudio) return; // Prevent duplicate clicks while running

    setIsAnalyzingAudio(true);
    setAudioAnalysisError(null);
    localStorage.setItem(ACTIVE_ANALYSIS_STORAGE_KEY, targetRecord.id);

    try {
      const result = await contentAnalysisService.analyzeAudio(targetRecord.id);

      if (result.success && result.audio_analysis) {
        // Fetch fresh record from database
        const freshRecord = await contentAnalysisService.fetchAnalysisById(targetRecord.id);
        const resolvedRecord: ContentAnalysisRecord = freshRecord || {
          ...targetRecord,
          audio_analysis: result.audio_analysis,
          audio_analysis_status: "completed",
        };

        setRealAudioRecord(resolvedRecord);

        // Get signed playback URL for the Reel player preview
        const playbackUrl = await contentAnalysisService.getSignedPlaybackUrl(resolvedRecord.file_path);
        setSignedVideoUrl(playbackUrl);

        // Update history items list
        const updatedHistoryItem = contentAnalysisService.mapRecordToHistoryItem(resolvedRecord);
        setHistoryItems((prev) => [
          updatedHistoryItem,
          ...prev.filter((p) => p.id !== resolvedRecord.id),
        ]);

        // Transition to results view on Audio tab
        setCurrentAnalysis(null);
        setIsUploadMode(false);
        setActiveTab("audio");
      } else {
        const errorMsg = result.error || "Audio analysis was unable to complete.";
        setAudioAnalysisError(errorMsg);

        setRealAudioRecord((prev) =>
          prev
            ? {
                ...prev,
                audio_analysis_status: "failed",
                audio_analysis_error: errorMsg,
              }
            : null
        );

        // Update history item status
        setHistoryItems((prev) =>
          prev.map((item) =>
            item.id === targetRecord.id
              ? { ...item, audioAnalysisStatus: "failed", audioAnalysisError: errorMsg }
              : item
          )
        );
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred during audio analysis.";
      setAudioAnalysisError(msg);
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  // 4. Retry Audio Analysis without re-uploading
  const handleRetryAudio = () => {
    if (realAudioRecord) {
      handleAnalyzeAudio(realAudioRecord);
    }
  };

  // 5. Real Visual Analysis invocation via Supabase Edge Function 'analyze-visual'
  const handleAnalyzeVisual = async (recordToAnalyze?: ContentAnalysisRecord | null) => {
    const targetRecord = recordToAnalyze || realAudioRecord;
    if (!targetRecord) return;

    if (isAnalyzingVisual) return; // Prevent duplicate clicks while running

    setIsAnalyzingVisual(true);
    setVisualAnalysisError(null);
    localStorage.setItem(ACTIVE_ANALYSIS_STORAGE_KEY, targetRecord.id);

    try {
      const result = await contentAnalysisService.analyzeVisual(targetRecord.id);

      if (result.success && result.visual_analysis) {
        // Fetch fresh record from database
        const freshRecord = await contentAnalysisService.fetchAnalysisById(targetRecord.id);
        const resolvedRecord: ContentAnalysisRecord = freshRecord || {
          ...targetRecord,
          visual_analysis: result.visual_analysis,
          visual_analysis_status: "completed",
        };

        setRealAudioRecord(resolvedRecord);

        // Ensure signed playback URL is loaded
        if (!signedVideoUrl) {
          const playbackUrl = await contentAnalysisService.getSignedPlaybackUrl(resolvedRecord.file_path);
          if (playbackUrl) {
            setSignedVideoUrl(playbackUrl);
          }
        }

        // Update history items list
        const updatedHistoryItem = contentAnalysisService.mapRecordToHistoryItem(resolvedRecord);
        setHistoryItems((prev) => [
          updatedHistoryItem,
          ...prev.filter((p) => p.id !== resolvedRecord.id),
        ]);

        // Transition to results view on Visual tab
        setCurrentAnalysis(null);
        setIsUploadMode(false);
        setActiveTab("visual");
      } else {
        const errorMsg = result.error || "Visual analysis was unable to complete.";
        setVisualAnalysisError(errorMsg);

        setRealAudioRecord((prev) =>
          prev
            ? {
                ...prev,
                visual_analysis_status: "failed",
                visual_analysis_error: errorMsg,
              }
            : null
        );

        // Update history item status
        setHistoryItems((prev) =>
          prev.map((item) =>
            item.id === targetRecord.id
              ? { ...item, visualAnalysisStatus: "failed", visualAnalysisError: errorMsg }
              : item
          )
        );
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred during visual analysis.";
      setVisualAnalysisError(msg);
    } finally {
      setIsAnalyzingVisual(false);
    }
  };

  // 6. Retry Visual Analysis without re-uploading
  const handleRetryVisual = () => {
    if (realAudioRecord) {
      handleAnalyzeVisual(realAudioRecord);
    }
  };

  // Auto-start visual analysis when user selects visual tab if pending/unstarted
  useEffect(() => {
    if (
      activeTab === "visual" &&
      realAudioRecord &&
      !isAnalyzingVisual &&
      !realAudioRecord.visual_analysis &&
      (realAudioRecord.visual_analysis_status === "pending" || !realAudioRecord.visual_analysis_status)
    ) {
      handleAnalyzeVisual(realAudioRecord);
    }
  }, [activeTab, realAudioRecord?.id, realAudioRecord?.visual_analysis_status]);

  // 5. Sample Preset Demo handlers (preserved independently)
  const handleStartDemoAnalysis = (
    file: File | null,
    duration: number,
    presetId?: string
  ) => {
    pendingDemoJobRef.current = { file, duration, presetId };
    setIsDemoProcessing(true);
  };

  const handleDemoProcessingComplete = () => {
    const { file, duration, presetId } = pendingDemoJobRef.current;
    const newResult = contentAnalysisService.createAnalysisResultForFile(
      file,
      duration,
      presetId
    );
    contentAnalysisService.saveCurrentAnalysis(newResult);
    setCurrentAnalysis(newResult);
    setRealAudioRecord(null);
    setIsDemoProcessing(false);
    setIsUploadMode(false);
    setActiveTab("overview");
  };

  const handleSeekVideo = (seconds: number) => {
    playerRef.current?.seekTo(seconds);
  };

  // 6. History Selection handler
  const handleSelectHistoryItem = async (id: string) => {
    // A. Check if selecting a demo preset
    const presets = contentAnalysisService.getPresetReels();
    const foundPreset = presets.find((p) => p.result.id === id || p.id === id);
    if (foundPreset) {
      setCurrentAnalysis(foundPreset.result);
      setRealAudioRecord(null);
      setSignedVideoUrl(null);
      setIsUploadMode(false);
      setActiveTab("overview");
      return;
    }

    // B. Real uploaded Reel from Supabase
    const record = await contentAnalysisService.fetchAnalysisById(id);
    if (record) {
      setRealAudioRecord(record);
      setCurrentAnalysis(null);
      localStorage.setItem(ACTIVE_ANALYSIS_STORAGE_KEY, record.id);

      // Fetch signed URL for video preview
      const signedUrl = await contentAnalysisService.getSignedPlaybackUrl(record.file_path);
      setSignedVideoUrl(signedUrl);

      setAudioAnalysisError(record.audio_analysis_error || null);
      setVisualAnalysisError(record.visual_analysis_error || null);
      setIsUploadMode(false);

      if (activeTab !== "visual" && activeTab !== "audio") {
        setActiveTab(record.audio_analysis_status === "completed" ? "audio" : "visual");
      }
    }
  };

  // 7. Delete record from Supabase
  const handleDeleteHistoryItem = async (id: string, filePath?: string) => {
    await contentAnalysisService.deleteUserAnalysis(id, filePath);
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    if (realAudioRecord?.id === id) {
      setRealAudioRecord(null);
      setSignedVideoUrl(null);
      localStorage.removeItem(ACTIVE_ANALYSIS_STORAGE_KEY);
      setIsUploadMode(true);
    }
  };

  const tabs: Array<{
    id: AnalysisTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number | string;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "audio",
      label: "Audio Analysis",
      icon: Volume2,
      count: realAudioRecord?.audio_analysis?.timestamped_transcript?.length
        ? `${realAudioRecord.audio_analysis.timestamped_transcript.length}`
        : currentAnalysis?.audioAnalysis.segments.length,
    },
    {
      id: "visual",
      label: "Visual Analysis",
      icon: Camera,
      count: realAudioRecord?.visual_analysis?.scenes?.length
        ? `${realAudioRecord.visual_analysis.scenes.length}`
        : currentAnalysis?.visualAnalysis.scenes?.length,
    },
    {
      id: "text",
      label: "Text Extraction",
      icon: Type,
      count: currentAnalysis?.textExtraction.totalTextElements,
    },
    {
      id: "script",
      label: "Original Reel Script",
      icon: FileSpreadsheet,
      count: currentAnalysis?.scriptTable.length,
    },
    { id: "editing", label: "Editing Breakdown", icon: Scissors },
    {
      id: "accuracy",
      label: "Accuracy Report",
      icon: ShieldCheck,
      count: currentAnalysis?.accuracyReport.overallScore
        ? `${currentAnalysis.accuracyReport.overallScore}%`
        : undefined,
    },
  ];

  const hasActiveResults = Boolean((currentAnalysis || realAudioRecord) && !isUploadMode);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <AnalysisHeader
        hasResult={hasActiveResults}
        isDemoData={Boolean(currentAnalysis?.isDemoData && !realAudioRecord)}
        historyCount={historyItems.length}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onUploadNew={() => {
          setIsUploadMode(true);
          setAudioAnalysisError(null);
        }}
      />

      {/* Upload View */}
      {isUploadMode || (!currentAnalysis && !realAudioRecord) ? (
        <div className="space-y-4">
          {(currentAnalysis || realAudioRecord) && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsUploadMode(false)}
                className="text-xs text-primary hover:underline font-medium"
              >
                ← Return to current analysis ({realAudioRecord?.file_name || currentAnalysis?.videoTitle})
              </button>
            </div>
          )}
          <VideoUploader
            onStartAnalysis={handleStartDemoAnalysis}
            onUploadSuccess={handleUploadSuccess}
            onAnalyzeAudio={handleAnalyzeAudio}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            isAnalyzing={isDemoProcessing}
            isAnalyzingAudio={isAnalyzingAudio}
          />
        </div>
      ) : (
        /* Results Workspace */
        <div className="space-y-6">
          {/* Top Results Video Summary Banner */}
          <div className="rounded-2xl border border-card-border bg-gradient-to-r from-card via-background-elevated to-card p-4 sm:p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-12 rounded-xl bg-background-elevated border border-card-border shrink-0 flex items-center justify-center overflow-hidden shadow-md">
                {currentAnalysis?.thumbnailUrl ? (
                  <img
                    src={currentAnalysis.thumbnailUrl}
                    alt={currentAnalysis.videoTitle}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Volume2 className="h-6 w-6 text-primary" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {realAudioRecord ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold border font-mono",
                        realAudioRecord.audio_analysis_status === "completed"
                          ? "bg-success/15 text-success border-success/30"
                          : realAudioRecord.audio_analysis_status === "failed"
                          ? "bg-error/15 text-error border-error/30"
                          : realAudioRecord.audio_analysis_status === "processing"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                          : "bg-primary/15 text-primary border-primary/30"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {realAudioRecord.audio_analysis_status === "completed"
                        ? "Audio Analysis Completed"
                        : realAudioRecord.audio_analysis_status === "failed"
                        ? "Audio Analysis Failed"
                        : realAudioRecord.audio_analysis_status === "processing"
                        ? "Analyzing Audio..."
                        : "Uploaded to Supabase"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success border border-success/30 font-mono">
                      <CheckCircle2 className="h-3 w-3" />
                      Analysis Completed
                    </span>
                  )}

                  <span className="text-xs text-text-muted font-mono">
                    {realAudioRecord
                      ? `${realAudioRecord.mime_type} • Private Storage`
                      : `${currentAnalysis?.aspectRatio} · ${currentAnalysis?.detectedLanguage}`}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-text-primary line-clamp-1">
                  {realAudioRecord ? realAudioRecord.file_name : currentAnalysis?.videoTitle}
                </h2>

                <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-primary" />
                    {realAudioRecord?.duration_seconds
                      ? contentAnalysisService.formatDuration(realAudioRecord.duration_seconds)
                      : currentAnalysis?.formattedDuration || "--:--"}
                  </span>
                  {realAudioRecord?.audio_analysis ? (
                    <>
                      <span>•</span>
                      <span>
                        {realAudioRecord.audio_analysis.timestamped_transcript?.length || 0} Transcript Segments
                      </span>
                      <span>•</span>
                      <span>
                        Primary Language: {realAudioRecord.audio_analysis.language_detection?.primary_language || "Detected"}
                      </span>
                      <span>•</span>
                      <span>
                        {realAudioRecord.audio_analysis.background_music?.detected
                          ? "Music Detected"
                          : "No Background Music"}
                      </span>
                    </>
                  ) : currentAnalysis ? (
                    <>
                      <span>•</span>
                      <span>{currentAnalysis.visualAnalysis.totalScenes} Scenes</span>
                      <span>•</span>
                      <span>{currentAnalysis.audioAnalysis.segments.length} Transcript Segments</span>
                      <span>•</span>
                      <span>{currentAnalysis.textExtraction.totalTextElements} Text OCR Layers</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsUploadMode(true);
                  setAudioAnalysisError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-card-border bg-background px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-primary/40 transition-colors"
              >
                <UploadCloud className="h-3.5 w-3.5 text-primary" />
                <span>Upload New Reel</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-card-border overflow-x-auto scrollbar-none">
            <nav className="flex space-x-1 sm:space-x-2 min-w-max pb-0.5" aria-label="Analysis Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap",
                      isActive
                        ? "border-primary text-text-primary bg-primary/10 rounded-t-lg"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:border-card-border"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary" : "text-text-muted"
                      )}
                    />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={cn(
                          "ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-background text-text-muted border border-card-border"
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active Tab Workspace */}
          <div className="transition-all">
            {/* REAL AUDIO RECORD ACTIVE */}
            {realAudioRecord ? (
              activeTab === "audio" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Player Preview if video URL is available */}
                  <div className="lg:col-span-4 sticky top-6">
                    <div className="w-full max-w-sm mx-auto space-y-3">
                      <VideoPreviewPlayer
                        ref={playerRef}
                        src={signedVideoUrl || undefined}
                        durationSeconds={realAudioRecord.duration_seconds || 30}
                        aspectRatio="9:16"
                      />
                      <div className="rounded-xl border border-card-border bg-card p-3 text-xs text-text-secondary space-y-1">
                        <p className="font-semibold text-text-primary line-clamp-1">
                          {realAudioRecord.file_name}
                        </p>
                        <p className="text-[11px] text-text-muted font-mono">
                          Click any timestamp in the Spoken Dialogue timeline or Sound Effects to jump to that moment in the video.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Audio Analysis Results */}
                  <div className="lg:col-span-8">
                    <AudioAnalysis
                      realData={realAudioRecord.audio_analysis}
                      status={realAudioRecord.audio_analysis_status}
                      errorMessage={audioAnalysisError || realAudioRecord.audio_analysis_error}
                      onRetry={handleRetryAudio}
                      onAnalyzeAudio={() => handleAnalyzeAudio(realAudioRecord)}
                      isProcessing={isAnalyzingAudio}
                      onSeek={handleSeekVideo}
                    />
                  </div>
                </div>
              ) : activeTab === "visual" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Player Preview if video URL is available */}
                  <div className="lg:col-span-4 sticky top-6">
                    <div className="w-full max-w-sm mx-auto space-y-3">
                      <VideoPreviewPlayer
                        ref={playerRef}
                        src={signedVideoUrl || undefined}
                        durationSeconds={realAudioRecord.duration_seconds || 30}
                        aspectRatio="9:16"
                      />
                      <div className="rounded-xl border border-card-border bg-card p-3 text-xs text-text-secondary space-y-1">
                        <p className="font-semibold text-text-primary line-clamp-1">
                          {realAudioRecord.file_name}
                        </p>
                        <p className="text-[11px] text-text-muted font-mono">
                          Click any scene or transition timestamp to jump to that moment in the video.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Visual Analysis Results */}
                  <div className="lg:col-span-8">
                    <VisualAnalysis
                      realData={realAudioRecord.visual_analysis}
                      status={realAudioRecord.visual_analysis_status}
                      errorMessage={visualAnalysisError || realAudioRecord.visual_analysis_error}
                      onRetry={handleRetryVisual}
                      onAnalyzeVisual={() => handleAnalyzeVisual(realAudioRecord)}
                      isProcessing={isAnalyzingVisual}
                      onSeek={handleSeekVideo}
                    />
                  </div>
                </div>
              ) : (
                /* Non-Audio & Non-Visual Tabs for real uploaded Reel */
                <div className="rounded-2xl border border-card-border bg-card p-8 sm:p-12 text-center space-y-4 shadow-card">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-lg font-bold text-text-primary">
                      {tabs.find((t) => t.id === activeTab)?.label} Pipeline Integration
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      This analysis module will be connected in subsequent steps.
                      Real Audio and Visual Analysis are currently connected and active for this uploaded Reel.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveTab("audio")}
                      leftIcon={<Volume2 className="h-4 w-4" />}
                    >
                      View Real Audio Analysis
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("visual")}
                      leftIcon={<Camera className="h-4 w-4" />}
                    >
                      View Real Visual Analysis
                    </Button>
                  </div>
                </div>
              )
            ) : currentAnalysis ? (
              /* DEMO PRESET ACTIVE */
              <>
                {activeTab === "overview" && (
                  <AnalysisOverview
                    result={currentAnalysis}
                    playerRef={playerRef}
                    onSeek={handleSeekVideo}
                    onSelectTab={setActiveTab}
                  />
                )}

                {activeTab === "audio" && (
                  <AudioAnalysis
                    data={currentAnalysis.audioAnalysis}
                    onSeek={handleSeekVideo}
                    isDemoData={Boolean(currentAnalysis.isDemoData)}
                  />
                )}

                {activeTab === "visual" && (
                  <VisualAnalysis
                    data={currentAnalysis.visualAnalysis}
                    onSeek={handleSeekVideo}
                    isDemoData={Boolean(currentAnalysis.isDemoData)}
                  />
                )}

                {activeTab === "text" && (
                  <TextExtraction
                    data={currentAnalysis.textExtraction}
                    onSeek={handleSeekVideo}
                    isDemoData={Boolean(currentAnalysis.isDemoData)}
                  />
                )}

                {activeTab === "script" && (
                  <OriginalScriptTable
                    scriptTable={currentAnalysis.scriptTable}
                    videoTitle={currentAnalysis.videoTitle}
                    onSeek={handleSeekVideo}
                    onOpenExport={() => setIsExportModalOpen(true)}
                    isDemoData={Boolean(currentAnalysis.isDemoData)}
                  />
                )}

                {activeTab === "editing" && (
                  <EditingBreakdown
                    data={currentAnalysis.editingBreakdown}
                    videoTitle={currentAnalysis.videoTitle}
                    onSeek={handleSeekVideo}
                    isDemoData={Boolean(currentAnalysis.isDemoData)}
                  />
                )}

                {activeTab === "accuracy" && (
                  <AccuracyReport
                    data={currentAnalysis.accuracyReport}
                    onSeek={handleSeekVideo}
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Demo Preset 8-Stage Processing Modal (only used when testing sample presets) */}
      <AnalysisProgressModal
        isOpen={isDemoProcessing}
        videoTitle={
          pendingDemoJobRef.current.file
            ? pendingDemoJobRef.current.file.name
            : "Sample Viral Reel"
        }
        onComplete={handleDemoProcessingComplete}
        onCancel={() => setIsDemoProcessing(false)}
      />

      {/* History Modal */}
      <AnalysisHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        historyItems={historyItems}
        onSelectAnalysis={handleSelectHistoryItem}
        onDeleteAnalysis={handleDeleteHistoryItem}
      />

      {/* Export Modal */}
      {currentAnalysis && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          result={currentAnalysis}
        />
      )}
    </div>
  );
};

export default ContentAnalysisPage;
