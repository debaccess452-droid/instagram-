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
} from "lucide-react";
import {
  ContentAnalysisResult,
  AnalysisTabType,
  AnalysisHistoryItem,
} from "../types/analysis";
import { contentAnalysisService } from "../services/contentAnalysisService";
import { AnalysisHeader } from "../components/AnalysisHeader";
import { VideoUploader } from "../components/VideoUploader";
import { VideoPreviewPlayerRef } from "../components/VideoPreviewPlayer";
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
import { cn } from "@/utils/cn";

export const ContentAnalysisPage: React.FC = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<ContentAnalysisResult | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<AnalysisTabType>("overview");
  const [isUploadMode, setIsUploadMode] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Stored pending file info for processing
  const pendingJobRef = useRef<{
    file: File | null;
    duration: number;
    presetId?: string;
  }>({ file: null, duration: 28.5 });

  const playerRef = useRef<VideoPreviewPlayerRef>(null);

  // Load initial analysis and history on mount
  useEffect(() => {
    const latest = contentAnalysisService.getLatestOrDemoAnalysis();
    setCurrentAnalysis(latest);
    setHistoryItems(contentAnalysisService.getHistory());
  }, []);

  const handleStartAnalysis = (
    file: File | null,
    duration: number,
    presetId?: string
  ) => {
    pendingJobRef.current = { file, duration, presetId };
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    const { file, duration, presetId } = pendingJobRef.current;
    const newResult = contentAnalysisService.createAnalysisResultForFile(
      file,
      duration,
      presetId
    );
    contentAnalysisService.saveCurrentAnalysis(newResult);
    setCurrentAnalysis(newResult);
    setHistoryItems(contentAnalysisService.getHistory());
    setIsProcessing(false);
    setIsUploadMode(false);
    setActiveTab("overview");
  };

  const handleSeekVideo = (seconds: number) => {
    playerRef.current?.seekTo(seconds);
  };

  const handleSelectHistoryItem = (id: string) => {
    // If selecting a preset or saved item
    const presets = contentAnalysisService.getPresetReels();
    const foundPreset = presets.find((p) => p.result.id === id || p.id === id);
    if (foundPreset) {
      setCurrentAnalysis(foundPreset.result);
      setIsUploadMode(false);
      return;
    }
    // Fallback to latest
    const latest = contentAnalysisService.getLatestOrDemoAnalysis();
    setCurrentAnalysis(latest);
    setIsUploadMode(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    contentAnalysisService.deleteHistoryItem(id);
    setHistoryItems(contentAnalysisService.getHistory());
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
      count: currentAnalysis?.audioAnalysis.segments.length,
    },
    {
      id: "visual",
      label: "Visual Analysis",
      icon: Camera,
      count: currentAnalysis?.visualAnalysis.totalScenes,
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
      count: `${currentAnalysis?.accuracyReport.overallScore}%`,
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <AnalysisHeader
        hasResult={Boolean(currentAnalysis && !isUploadMode)}
        isDemoData={Boolean(currentAnalysis?.isDemoData)}
        historyCount={historyItems.length}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onUploadNew={() => setIsUploadMode(true)}
      />

      {/* Upload Mode or Empty State */}
      {isUploadMode || !currentAnalysis ? (
        <div className="space-y-4">
          {currentAnalysis && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsUploadMode(false)}
                className="text-xs text-primary hover:underline font-medium"
              >
                ← Return to current analysis ({currentAnalysis.videoTitle})
              </button>
            </div>
          )}
          <VideoUploader
            onStartAnalysis={handleStartAnalysis}
            isAnalyzing={isProcessing}
          />
        </div>
      ) : (
        /* Results Workspace */
        <div className="space-y-6">
          {/* Top Results Video Summary Banner */}
          <div className="rounded-2xl border border-card-border bg-gradient-to-r from-card via-background-elevated to-card p-4 sm:p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={currentAnalysis.thumbnailUrl}
                alt={currentAnalysis.videoTitle}
                className="h-16 w-12 rounded-xl object-cover border border-card-border shrink-0 shadow-md"
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success border border-success/30 font-mono">
                    <CheckCircle2 className="h-3 w-3" />
                    Analysis Completed
                  </span>
                  <span className="text-xs text-text-muted font-mono">
                    {currentAnalysis.aspectRatio} · {currentAnalysis.detectedLanguage}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-text-primary line-clamp-1">
                  {currentAnalysis.videoTitle}
                </h2>
                <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-primary" />
                    {currentAnalysis.formattedDuration}
                  </span>
                  <span>•</span>
                  <span>{currentAnalysis.visualAnalysis.totalScenes} Scenes</span>
                  <span>•</span>
                  <span>{currentAnalysis.audioAnalysis.segments.length} Transcript Segments</span>
                  <span>•</span>
                  <span>{currentAnalysis.textExtraction.totalTextElements} Text OCR Layers</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
              <button
                type="button"
                onClick={() => setIsUploadMode(true)}
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
          </div>
        </div>
      )}

      {/* 8-Stage Processing Modal */}
      <AnalysisProgressModal
        isOpen={isProcessing}
        videoTitle={
          pendingJobRef.current.file
            ? pendingJobRef.current.file.name
            : "Sample Viral Reel"
        }
        onComplete={handleProcessingComplete}
        onCancel={() => setIsProcessing(false)}
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
