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
  VisualAnalysisStatus,
} from "../types/analysis";
import { contentAnalysisService } from "../services/contentAnalysisService";
import { supabase } from "@/lib/supabase";
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
const ACTIVE_TAB_STORAGE_KEY = "virulmuse_active_analysis_tab";

function normalizeVisualStatus(status?: VisualAnalysisStatus | string | null): string {
  return String(status || "").trim().toLowerCase();
}

function isVisualActiveBackendStatus(status?: VisualAnalysisStatus | string | null): boolean {
  const normalized = normalizeVisualStatus(status);
  if (!normalized || normalized === "completed" || normalized === "failed" || normalized === "pending") {
    return false;
  }
  return (
    normalized === "queued" ||
    normalized === "processing" ||
    normalized.includes("groq") ||
    normalized.includes("fallback")
  );
}

function getInitialActiveTab(): AnalysisTabType {
  try {
    const saved = sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (
      saved === "overview" ||
      saved === "audio" ||
      saved === "visual" ||
      saved === "text" ||
      saved === "script" ||
      saved === "editing" ||
      saved === "accuracy"
    ) {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return "audio";
}

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
  const [isPreparingVisualFrames, setIsPreparingVisualFrames] = useState<boolean>(false);
  const [visualAnalysisError, setVisualAnalysisError] = useState<string | null>(null);
  const [visualProgressMessage, setVisualProgressMessage] = useState<string | null>(null);

  const [activeTab, setActiveTabState] = useState<AnalysisTabType>(getInitialActiveTab);
  const setActiveTab = (tab: AnalysisTabType) => {
    setActiveTabState(tab);
    try {
      sessionStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
    } catch {
      // Ignore storage errors
    }
  };
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
  const visualPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeVisualRunIdRef = useRef<string | null>(null);
  const isPreparingVisualFramesRef = useRef<boolean>(false);
  const selectionRequestIdRef = useRef<number>(0);

  const setPreparingVisualFramesState = (value: boolean) => {
    isPreparingVisualFramesRef.current = value;
    setIsPreparingVisualFrames(value);
  };

  const stopVisualPolling = () => {
    if (visualPollingRef.current) {
      clearInterval(visualPollingRef.current);
      visualPollingRef.current = null;
    }
  };

  const hydrateRealRecordState = (record: ContentAnalysisRecord) => {
    setRealAudioRecord(record);

    if (record.audio_analysis_status === "failed") {
      setAudioAnalysisError(record.audio_analysis_error || "Previous audio analysis failed.");
    } else {
      setAudioAnalysisError(null);
    }

    const vStatus = normalizeVisualStatus(record.visual_analysis_status);
    const hasSavedVisualResult = Boolean(record.visual_analysis);

    if (vStatus === "completed" || (hasSavedVisualResult && vStatus !== "failed")) {
      stopVisualPolling();
      activeVisualRunIdRef.current = null;
      setPreparingVisualFramesState(false);
      setIsAnalyzingVisual(false);
      setVisualProgressMessage(null);
      setVisualAnalysisError(null);
    } else if (isVisualActiveBackendStatus(vStatus)) {
      setPreparingVisualFramesState(false);
      setIsAnalyzingVisual(true);
      setVisualProgressMessage(null);
      setVisualAnalysisError(null);
    } else if (vStatus === "failed") {
      stopVisualPolling();
      activeVisualRunIdRef.current = null;
      setPreparingVisualFramesState(false);
      setIsAnalyzingVisual(false);
      setVisualProgressMessage(null);
      setVisualAnalysisError(record.visual_analysis_error || "Previous visual analysis failed.");
    } else {
      stopVisualPolling();
      activeVisualRunIdRef.current = null;
      setPreparingVisualFramesState(false);
      setIsAnalyzingVisual(false);
      setVisualProgressMessage(null);
      setVisualAnalysisError(null);
    }
  };

  useEffect(() => {
    return () => {
      stopVisualPolling();
      activeVisualRunIdRef.current = null;
      isPreparingVisualFramesRef.current = false;
    };
  }, []);

  // 1. Load user records from Supabase on mount and restore active record from DB without triggering analysis
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
        if (savedActiveId && !isPreparingVisualFramesRef.current) {
          // Fetch fresh row directly from public.content_analyses for savedActiveId
          const freshRecord = await contentAnalysisService.fetchAnalysisById(savedActiveId);
          if (!isCurrent) return;

          const resolvedRecord = freshRecord || records.find((r) => r.id === savedActiveId) || null;
          if (resolvedRecord) {
            hydrateRealRecordState(resolvedRecord);
            setCurrentAnalysis(null);
            setIsUploadMode(false);

            const url = await contentAnalysisService.getSignedPlaybackUrl(resolvedRecord.file_path);
            if (isCurrent && url) {
              setSignedVideoUrl(url);
            }
          } else {
            localStorage.removeItem(ACTIVE_ANALYSIS_STORAGE_KEY);
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
    stopVisualPolling();
    activeVisualRunIdRef.current = null;
    setPreparingVisualFramesState(false);
    setIsAnalyzingVisual(false);
    setVisualProgressMessage(null);
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

  // 5. Real Visual Analysis invocation via Supabase Edge Function 'analyze-visual' (explicit action only)
  const handleAnalyzeVisual = async (recordToAnalyze?: ContentAnalysisRecord | null) => {
    const targetRecord = recordToAnalyze || realAudioRecord;
    if (!targetRecord?.id) return;

    // Never restart an already-completed visual analysis that has a saved result
    const initialStatus = normalizeVisualStatus(targetRecord.visual_analysis_status);
    if (initialStatus === "completed" && targetRecord.visual_analysis) {
      hydrateRealRecordState(targetRecord);
      setCurrentAnalysis(null);
      setIsUploadMode(false);
      setActiveTab("visual");
      return;
    }

    // Synchronous ref lock prevents duplicate runs across React re-renders / Strict Mode
    if (
      activeVisualRunIdRef.current === targetRecord.id ||
      isPreparingVisualFramesRef.current ||
      isAnalyzingVisual
    ) {
      return;
    }

    activeVisualRunIdRef.current = targetRecord.id;
    stopVisualPolling();
    setIsAnalyzingVisual(true);
    setPreparingVisualFramesState(true);
    setVisualAnalysisError(null);
    setVisualProgressMessage("Preparing your Reel...");
    localStorage.setItem(ACTIVE_ANALYSIS_STORAGE_KEY, targetRecord.id);

    // Ensure Visual tab is visible while preparation runs
    setCurrentAnalysis(null);
    setIsUploadMode(false);
    setActiveTab("visual");

    try {
      // 1. Get authenticated user ID
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (sessionError || !userId) {
        throw new Error("Authentication required: Please sign in to run Visual Analysis.");
      }

      // 2. Fetch latest record from content_analyses using existing analysisId before doing anything
      const freshDbRecord = await contentAnalysisService.fetchAnalysisById(targetRecord.id);
      const dbStatus = normalizeVisualStatus(freshDbRecord?.visual_analysis_status);

      // Guard: if DB already shows completed + saved result, display it immediately without restarting
      if (freshDbRecord && dbStatus === "completed" && freshDbRecord.visual_analysis) {
        hydrateRealRecordState(freshDbRecord);
        const updatedItem = contentAnalysisService.mapRecordToHistoryItem(freshDbRecord);
        setHistoryItems((prev) => [updatedItem, ...prev.filter((p) => p.id !== freshDbRecord.id)]);
        return;
      }

      // Guard: if DB already has an active queued/processing/groq job, monitor it instead of restarting
      if (freshDbRecord && isVisualActiveBackendStatus(dbStatus)) {
        hydrateRealRecordState(freshDbRecord);
        const updatedItem = contentAnalysisService.mapRecordToHistoryItem(freshDbRecord);
        setHistoryItems((prev) => [updatedItem, ...prev.filter((p) => p.id !== freshDbRecord.id)]);
        return;
      }

      const authoritativeFilePath = freshDbRecord?.file_path || targetRecord.file_path;
      const authoritativeDuration =
        freshDbRecord?.duration_seconds ?? targetRecord.duration_seconds;

      if (!authoritativeFilePath) {
        throw new Error("Uploaded Reel storage path could not be found for this analysis record.");
      }

      // 3. Download original uploaded Reel from private reel-uploads bucket
      const videoBlob = await contentAnalysisService.downloadReelVideo(authoritativeFilePath);

      // Abort safely if user switched to a different Reel while downloading
      if (activeVisualRunIdRef.current !== targetRecord.id) return;

      // 4. Extract up to 3 representative JPEG frames (at ~10%, ~50%, ~90% of duration)
      setVisualProgressMessage("Extracting representative frames...");
      const extractedFrames = await contentAnalysisService.extractRepresentativeFrames(
        videoBlob,
        authoritativeDuration
      );

      if (!extractedFrames || extractedFrames.length === 0) {
        throw new Error(
          "No representative frames could be extracted from your Reel. Visual analysis was not started."
        );
      }

      if (activeVisualRunIdRef.current !== targetRecord.id) return;

      // 5. Upload frames to private visual-analysis-frames bucket ({userId}/{analysisId}/frame-{i}.jpg)
      setVisualProgressMessage("Uploading visual frames...");
      const framePaths = await contentAnalysisService.uploadAnalysisFrames(
        userId,
        targetRecord.id,
        extractedFrames
      );

      if (!framePaths || framePaths.length !== extractedFrames.length || framePaths.length === 0) {
        throw new Error(
          "Visual frame upload verification failed. Visual analysis was not started."
        );
      }

      if (activeVisualRunIdRef.current !== targetRecord.id) return;

      // 6. Invoke analyze-visual reusing existing analysisId and validated framePaths manifest
      setVisualProgressMessage("Starting visual analysis...");
      const result = await contentAnalysisService.analyzeVisual(targetRecord.id, framePaths);

      if (activeVisualRunIdRef.current !== targetRecord.id) return;

      if (result.success) {
        // Frame preparation & upload succeeded and job is queued
        setPreparingVisualFramesState(false);
        setVisualProgressMessage(null);
        const newStatus: VisualAnalysisStatus = result.status || "queued";

        setRealAudioRecord((prev) =>
          prev && prev.id === targetRecord.id
            ? {
                ...prev,
                file_path: authoritativeFilePath,
                visual_analysis_status: newStatus,
                visual_analysis_error: null,
              }
            : prev
        );

        // Ensure signed playback URL is loaded
        if (!signedVideoUrl) {
          const playbackUrl = await contentAnalysisService.getSignedPlaybackUrl(
            authoritativeFilePath
          );
          if (playbackUrl) {
            setSignedVideoUrl(playbackUrl);
          }
        }

        // Update history item status to queued
        setHistoryItems((prev) =>
          prev.map((item) =>
            item.id === targetRecord.id
              ? { ...item, visualAnalysisStatus: newStatus, visualAnalysisError: null }
              : item
          )
        );

        // If backend returned completed analysis directly (backward compatibility)
        if (result.visual_analysis) {
          const completedRecord = await contentAnalysisService.fetchAnalysisById(targetRecord.id);
          const resolvedRecord: ContentAnalysisRecord = completedRecord || {
            ...targetRecord,
            file_path: authoritativeFilePath,
            visual_analysis: result.visual_analysis,
            visual_analysis_status: "completed",
            visual_analysis_error: null,
          };

          hydrateRealRecordState(resolvedRecord);

          const updatedHistoryItem = contentAnalysisService.mapRecordToHistoryItem(resolvedRecord);
          setHistoryItems((prev) => [
            updatedHistoryItem,
            ...prev.filter((p) => p.id !== resolvedRecord.id),
          ]);
        }
      } else {
        const errorMsg = result.error || "Visual analysis was unable to complete.";
        activeVisualRunIdRef.current = null;
        setPreparingVisualFramesState(false);
        setVisualAnalysisError(errorMsg);
        setVisualProgressMessage(null);
        setIsAnalyzingVisual(false);

        setRealAudioRecord((prev) =>
          prev && prev.id === targetRecord.id
            ? {
                ...prev,
                visual_analysis_status: "failed",
                visual_analysis_error: errorMsg,
              }
            : prev
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
      if (activeVisualRunIdRef.current !== targetRecord.id) return;
      const msg = err.message || "An unexpected error occurred during visual analysis.";
      activeVisualRunIdRef.current = null;
      setPreparingVisualFramesState(false);
      setVisualAnalysisError(msg);
      setVisualProgressMessage(null);
      setIsAnalyzingVisual(false);

      setRealAudioRecord((prev) =>
        prev && prev.id === targetRecord.id
          ? {
              ...prev,
              visual_analysis_status: "failed",
              visual_analysis_error: msg,
            }
          : prev
      );

      setHistoryItems((prev) =>
        prev.map((item) =>
          item.id === targetRecord.id
            ? { ...item, visualAnalysisStatus: "failed", visualAnalysisError: msg }
            : item
        )
      );
    }
  };

  // 6. Retry Visual Analysis without re-uploading (reuses existing analysisId)
  const handleRetryVisual = () => {
    if (realAudioRecord) {
      handleAnalyzeVisual(realAudioRecord);
    }
  };

  // 7. Poll existing content_analyses record every 5 seconds ONLY when queued/processing/groq
  useEffect(() => {
    const currentRecordId = realAudioRecord?.id;
    const currentStatus = realAudioRecord?.visual_analysis_status;

    // Never poll while local browser frame extraction/upload is in progress
    if (isPreparingVisualFrames) {
      stopVisualPolling();
      return;
    }

    const normalizedStatus = normalizeVisualStatus(currentStatus);

    // Stop polling immediately if no record, completed, failed, or pending
    if (
      !currentRecordId ||
      normalizedStatus === "completed" ||
      normalizedStatus === "failed" ||
      !isVisualActiveBackendStatus(normalizedStatus)
    ) {
      stopVisualPolling();
      return;
    }

    let isCancelled = false;
    stopVisualPolling();

    const poll = async () => {
      try {
        const statusData = await contentAnalysisService.pollVisualStatus(currentRecordId);
        if (isCancelled || !statusData) return;

        const polledStatus = normalizeVisualStatus(statusData.visual_analysis_status);

        if (polledStatus === "completed") {
          stopVisualPolling();
          activeVisualRunIdRef.current = null;
          setPreparingVisualFramesState(false);
          setIsAnalyzingVisual(false);
          setVisualProgressMessage(null);
          setVisualAnalysisError(null);

          const freshRecord = await contentAnalysisService.fetchAnalysisById(currentRecordId);
          if (isCancelled) return;

          if (freshRecord) {
            hydrateRealRecordState(freshRecord);
            const updatedHistoryItem = contentAnalysisService.mapRecordToHistoryItem(freshRecord);
            setHistoryItems((prev) => [
              updatedHistoryItem,
              ...prev.filter((p) => p.id !== freshRecord.id),
            ]);
          } else if (statusData.visual_analysis) {
            setRealAudioRecord((prev) =>
              prev && prev.id === currentRecordId
                ? {
                    ...prev,
                    visual_analysis: statusData.visual_analysis,
                    visual_analysis_status: "completed",
                    visual_analysis_error: null,
                  }
                : prev
            );
          }
        } else if (polledStatus === "failed") {
          stopVisualPolling();
          activeVisualRunIdRef.current = null;
          setPreparingVisualFramesState(false);
          setIsAnalyzingVisual(false);
          setVisualProgressMessage(null);
          const errorMsg =
            statusData.visual_analysis_error || "Visual analysis was unable to complete.";
          setVisualAnalysisError(errorMsg);

          setRealAudioRecord((prev) =>
            prev && prev.id === currentRecordId
              ? {
                  ...prev,
                  visual_analysis_status: "failed",
                  visual_analysis_error: errorMsg,
                }
              : prev
          );

          setHistoryItems((prev) =>
            prev.map((item) =>
              item.id === currentRecordId
                ? { ...item, visualAnalysisStatus: "failed", visualAnalysisError: errorMsg }
                : item
            )
          );
        } else if (statusData.visual_analysis_status) {
          setVisualProgressMessage(null);
          setRealAudioRecord((prev) =>
            prev &&
            prev.id === currentRecordId &&
            prev.visual_analysis_status !== statusData.visual_analysis_status
              ? {
                  ...prev,
                  visual_analysis_status: statusData.visual_analysis_status,
                }
              : prev
          );
        }
      } catch (err) {
        console.warn("[ContentAnalysisPage] Visual polling tick error:", err);
      }
    };

    // Poll every 5 seconds
    visualPollingRef.current = setInterval(poll, 5000);

    return () => {
      isCancelled = true;
      stopVisualPolling();
    };
  }, [
    realAudioRecord?.id,
    realAudioRecord?.visual_analysis_status,
    isPreparingVisualFrames,
  ]);

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

  // 6. History Selection handler — always loads existing DB values without restarting analysis
  const handleSelectHistoryItem = async (id: string) => {
    const requestId = ++selectionRequestIdRef.current;
    stopVisualPolling();
    activeVisualRunIdRef.current = null;
    setPreparingVisualFramesState(false);
    setIsAnalyzingVisual(false);
    setVisualProgressMessage(null);
    setVisualAnalysisError(null);

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

    // B. Real uploaded Reel from Supabase: fetch fresh row before deciding UI state
    const record = await contentAnalysisService.fetchAnalysisById(id);
    if (requestId !== selectionRequestIdRef.current) return;

    if (record) {
      hydrateRealRecordState(record);
      setCurrentAnalysis(null);
      localStorage.setItem(ACTIVE_ANALYSIS_STORAGE_KEY, record.id);

      const updatedItem = contentAnalysisService.mapRecordToHistoryItem(record);
      setHistoryItems((prev) => [
        updatedItem,
        ...prev.filter((p) => p.id !== record.id),
      ]);

      // Fetch signed URL for video preview
      const signedUrl = await contentAnalysisService.getSignedPlaybackUrl(record.file_path);
      if (requestId !== selectionRequestIdRef.current) return;
      setSignedVideoUrl(signedUrl);

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
      stopVisualPolling();
      activeVisualRunIdRef.current = null;
      setPreparingVisualFramesState(false);
      setIsAnalyzingVisual(false);
      setVisualProgressMessage(null);
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
                      errorMessage={
                        normalizeVisualStatus(realAudioRecord.visual_analysis_status) === "completed"
                          ? null
                          : visualAnalysisError || realAudioRecord.visual_analysis_error
                      }
                      onRetry={handleRetryVisual}
                      onAnalyzeVisual={() => handleAnalyzeVisual(realAudioRecord)}
                      isProcessing={isAnalyzingVisual}
                      progressStepMessage={visualProgressMessage}
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
