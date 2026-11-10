import {
  ContentAnalysisResult,
  AnalysisHistoryItem,
  ScriptTableRow,
} from "../types/analysis";
import {
  DEMO_ANALYSIS_RESULT,
  DEMO_PRESET_REELS,
  INITIAL_ANALYSIS_HISTORY,
} from "../data/demoAnalysis";

const STORAGE_KEY_HISTORY = "virulmuse_analysis_history";
const STORAGE_KEY_CURRENT = "virulmuse_current_analysis";

export const PROCESSING_STAGES = [
  { id: 1, label: "Uploading video container", detail: "Validating bitstream and audio codecs" },
  { id: 2, label: "Extracting audio tracks", detail: "Separating voiceover, musical bed, and SFX" },
  { id: 3, label: "Transcribing speech & phonemes", detail: "Running high-accuracy neural speech recognition" },
  { id: 4, label: "Analyzing visual scenes & framing", detail: "Detecting shot boundaries, camera angles, and lighting" },
  { id: 5, label: "Extracting on-screen text (OCR)", detail: "Scanning bounding boxes, kinetic typography, and safe zones" },
  { id: 6, label: "Synchronizing multimodal timestamps", detail: "Aligning speech phonemes with visual scene cuts" },
  { id: 7, label: "Generating production breakdown", detail: "Evaluating pacing, jump cuts, and narrative arc stages" },
  { id: 8, label: "Preparing evidence-backed accuracy report", detail: "Isolating direct evidence from analytical inferences" },
];

class ContentAnalysisService {
  private history: AnalysisHistoryItem[] = [];

  constructor() {
    this.initHistory();
  }

  private initHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (stored) {
        this.history = JSON.parse(stored);
      } else {
        this.history = [...INITIAL_ANALYSIS_HISTORY];
        this.saveHistory();
      }
    } catch {
      this.history = [...INITIAL_ANALYSIS_HISTORY];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.history));
    } catch {
      // In-memory fallback
    }
  }

  public getHistory(): AnalysisHistoryItem[] {
    return [...this.history];
  }

  public deleteHistoryItem(id: string): void {
    this.history = this.history.filter((item) => item.id !== id);
    this.saveHistory();
  }

  public getPresetReels() {
    return DEMO_PRESET_REELS;
  }

  public getLatestOrDemoAnalysis(): ContentAnalysisResult {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEMO_ANALYSIS_RESULT;
  }

  public saveCurrentAnalysis(analysis: ContentAnalysisResult): void {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(analysis));
      // Also upsert into history
      const existsIndex = this.history.findIndex((h) => h.id === analysis.id);
      const historyEntry: AnalysisHistoryItem = {
        id: analysis.id,
        videoTitle: analysis.videoTitle,
        videoFileName: analysis.videoFileName,
        thumbnailUrl: analysis.thumbnailUrl,
        uploadedAt: "Just now",
        durationFormatted: analysis.formattedDuration,
        status: analysis.status,
        sceneCount: analysis.visualAnalysis.totalScenes,
        accuracyScore: analysis.accuracyReport.overallScore,
        isDemo: Boolean(analysis.isDemoData),
      };

      if (existsIndex >= 0) {
        this.history[existsIndex] = historyEntry;
      } else {
        this.history.unshift(historyEntry);
      }
      this.saveHistory();
    } catch {
      // Fallback
    }
  }

  /**
   * Generates a result for a custom uploaded video or preset.
   * If custom video file is provided, adopts its metadata (file name, size, duration).
   * Note: In frontend demo mode, clearly tags isDemoData: true while simulating realistic backend analysis.
   */
  public createAnalysisResultForFile(
    file: File | null,
    videoDurationSeconds: number,
    presetId?: string
  ): ContentAnalysisResult {
    if (presetId) {
      const found = DEMO_PRESET_REELS.find((p) => p.id === presetId);
      if (found) {
        return {
          ...found.result,
          id: `analysis-${Date.now()}`,
          analyzedAt: new Date().toISOString(),
        };
      }
    }

    if (!file) {
      return DEMO_ANALYSIS_RESULT;
    }

    // Adapt demo structure to match the user's specific uploaded file metadata
    const formattedDuration = this.formatDuration(videoDurationSeconds || 28.5);
    const titleWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const capitalizedTitle =
      titleWithoutExt.charAt(0).toUpperCase() + titleWithoutExt.slice(1);

    const adaptedResult: ContentAnalysisResult = {
      ...DEMO_ANALYSIS_RESULT,
      id: `analysis-${Date.now()}`,
      videoTitle: capitalizedTitle,
      videoFileName: file.name,
      analyzedAt: new Date().toISOString(),
      durationSeconds: videoDurationSeconds || 28.5,
      formattedDuration,
      status: "completed",
      isDemoData: true, // Transparent indicator that analysis is simulated in frontend preview
      overviewSummary: `Multimodal analysis generated for ${file.name}. Pacing is optimized for Instagram Reels with dynamic vocal cadence and rapid on-screen text synchronization.`,
      editingBreakdown: {
        ...DEMO_ANALYSIS_RESULT.editingBreakdown,
        technical: {
          ...DEMO_ANALYSIS_RESULT.editingBreakdown.technical,
          durationSeconds: videoDurationSeconds || 28.5,
          formattedDuration,
          fileSizeBytes: file.size,
          format: file.type || "video/mp4",
        },
      },
    };

    return adaptedResult;
  }

  public formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  }

  public exportScriptTableToCSV(scriptTable: ScriptTableRow[], videoTitle: string): void {
    const headers = [
      "Time",
      "Original Voiceover / Audio",
      "Exact On-Screen Text",
      "Detailed Visual Direction",
      "Scene #",
      "Confidence %",
    ];

    const rows = scriptTable.map((row) => [
      `"${row.timestamp}"`,
      `"${row.originalVoiceover.replace(/"/g, '""')}"`,
      `"${row.exactOnScreenText.replace(/"/g, '""')}"`,
      `"${row.detailedVisualDirection.replace(/"/g, '""')}"`,
      `"${row.sceneNumber}"`,
      `"${row.confidenceScore}%"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizedTitle = videoTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `${sanitizedTitle}_reel_script_table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public exportFullAnalysisJSON(analysis: ContentAnalysisResult): void {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const sanitizedTitle = analysis.videoTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    downloadAnchor.setAttribute("download", `${sanitizedTitle}_virulmuse_analysis.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  public formatTableAsMarkdown(scriptTable: ScriptTableRow[]): string {
    let md = "| Time | Original Voiceover / Audio | Exact On-Screen Text | Detailed Visual Direction |\n";
    md += "| --- | --- | --- | --- |\n";
    scriptTable.forEach((row) => {
      md += `| ${row.timestamp} | ${row.originalVoiceover} | ${row.exactOnScreenText} | ${row.detailedVisualDirection} |\n`;
    });
    return md;
  }
}

export const contentAnalysisService = new ContentAnalysisService();
