import {
  ContentAnalysisResult,
  AnalysisHistoryItem,
  ContentAnalysisRecord,
  ScriptTableRow,
  EditingTimelineEvent,
} from "../types/analysis";
import {
  DEMO_ANALYSIS_RESULT,
  DEMO_PRESET_REELS,
} from "../data/demoAnalysis";
import { supabase } from "@/lib/supabase";

export const STORAGE_BUCKET = "reel-uploads";
export const TABLE_CONTENT_ANALYSES = "content_analyses";

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

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

export const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "mov", "webm"];
export const MAX_VIDEO_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB limit

class ContentAnalysisService {
  /**
   * Uploads an Instagram Reel video to private Supabase Storage ("reel-uploads")
   * and creates a record in `public.content_analyses` associated with the authenticated user.
   */
  public async uploadReel(
    file: File,
    durationSeconds?: number
  ): Promise<{ record: ContentAnalysisRecord }> {
    // 1. Authenticate user from Supabase session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      throw new Error(
        "Authentication required: You must be signed in to upload Reels. Please log in to your account."
      );
    }

    const userId = session.user.id;

    // 2. Validate file type and extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isExtensionValid = ALLOWED_VIDEO_EXTENSIONS.includes(ext);
    const isMimeValid = !file.type || ALLOWED_VIDEO_MIME_TYPES.includes(file.type);

    if (!isExtensionValid || (!isMimeValid && file.type)) {
      throw new Error(
        `Unsupported video format. Only MP4, MOV, and WEBM video files are supported. Received "${file.type || ext}".`
      );
    }

    // 3. Validate maximum file size (100 MB)
    if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `File size (${sizeMb} MB) exceeds maximum allowed size of 100 MB.`
      );
    }

    // Determine normalized MIME type
    let mimeType = file.type;
    if (!mimeType || !ALLOWED_VIDEO_MIME_TYPES.includes(mimeType)) {
      if (ext === "mov") {
        mimeType = "video/quicktime";
      } else if (ext === "webm") {
        mimeType = "video/webm";
      } else {
        mimeType = "video/mp4";
      }
    }

    // 4. Generate unique file name to prevent accidental overwrites
    const timestamp = Date.now();
    const uniqueSuffix =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).substring(2, 10);
    const sanitizedBaseName =
      file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 40) || "reel";
    const uniqueFileName = `${timestamp}_${uniqueSuffix}_${sanitizedBaseName}.${ext}`;

    // 5. Build storage folder path: {authenticated-user-id}/{unique-file-name}
    const filePath = `${userId}/${uniqueFileName}`;

    // 6. Upload file to private storage bucket
    let uploadData;
    try {
      const uploadRes = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadRes.error) {
        throw new Error(
          `Storage upload failed: ${uploadRes.error.message || "Failed to upload file to storage."}`
        );
      }
      uploadData = uploadRes.data;
    } catch (uploadErr: any) {
      if (uploadErr.message?.includes("Failed to fetch") || uploadErr.name === "TypeError") {
        throw new Error(
          "Network connection failed during file upload. Please check your internet connection and try again."
        );
      }
      throw uploadErr;
    }

    // 7. Insert record into public.content_analyses table
    const safeDuration =
      typeof durationSeconds === "number" &&
      !isNaN(durationSeconds) &&
      durationSeconds > 0
        ? Math.round(durationSeconds * 10) / 10
        : null;

    const { data: record, error: insertError } = await supabase
      .from(TABLE_CONTENT_ANALYSES)
      .insert({
        user_id: userId,
        file_path: filePath,
        file_name: file.name,
        mime_type: mimeType,
        file_size_bytes: file.size,
        duration_seconds: safeDuration,
        status: "uploaded",
      })
      .select()
      .single();

    // 8. Error handling & rollback cleanup if database insert fails
    if (insertError || !record) {
      let cleanupFailed = false;
      let cleanupDetail = "";
      try {
        const { error: removeError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([filePath]);
        if (removeError) {
          cleanupFailed = true;
          cleanupDetail = ` (Cleanup notice: unable to delete orphaned storage file: ${removeError.message})`;
        } else {
          cleanupDetail = " (Orphaned storage file was removed successfully)";
        }
      } catch (cleanupEx: any) {
        cleanupFailed = true;
        cleanupDetail = ` (Cleanup notice: storage cleanup failed: ${cleanupEx?.message || cleanupEx})`;
      }

      const originalError = insertError?.message || "Failed to create database record.";
      throw new Error(
        `Database record creation failed: ${originalError}${cleanupDetail}`
      );
    }

    return { record: record as ContentAnalysisRecord };
  }

  /**
   * Fetches real records from public.content_analyses for the authenticated user,
   * ordered newest first.
   */
  public async fetchUserAnalyses(): Promise<ContentAnalysisRecord[]> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "[ContentAnalysisService] Error fetching user content analyses:",
          error
        );
        return [];
      }

      return (data as ContentAnalysisRecord[]) || [];
    } catch (err) {
      console.error(
        "[ContentAnalysisService] Exception fetching user content analyses:",
        err
      );
      return [];
    }
  }

  /**
   * Deletes a record from public.content_analyses and removes the file from private Storage.
   */
  public async deleteUserAnalysis(
    id: string,
    filePath?: string
  ): Promise<{ error: Error | null }> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error("You must be logged in to delete an analysis.");
      }

      // 1. Delete database record
      const { error: dbError } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .delete()
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (dbError) {
        throw new Error(`Failed to delete database record: ${dbError.message}`);
      }

      // 2. If storage filePath is available, delete from private bucket
      if (filePath) {
        try {
          await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
        } catch (storageErr) {
          console.warn(
            "[ContentAnalysisService] Storage deletion note:",
            storageErr
          );
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }

  /**
   * Generates a short-lived signed URL for private video playback/preview.
   * Does NOT make the bucket public.
   */
  public async getSignedPlaybackUrl(
    filePath: string,
    expiresInSeconds: number = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error || !data?.signedUrl) {
        return null;
      }
      return data.signedUrl;
    } catch {
      return null;
    }
  }

  /**
   * Maps a ContentAnalysisRecord database row into the UI's AnalysisHistoryItem format.
   */
  public mapRecordToHistoryItem(record: ContentAnalysisRecord): AnalysisHistoryItem {
    const result = record.analysis_result as ContentAnalysisResult | null;
    const rawTitle = record.file_name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const formattedTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
    const durationFormatted = record.duration_seconds
      ? this.formatDuration(record.duration_seconds)
      : "--:--";

    const dateObj = new Date(record.created_at);
    const dateFormatted = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Recently";

    return {
      id: record.id,
      videoTitle: result?.videoTitle || formattedTitle,
      videoFileName: record.file_name,
      thumbnailUrl:
        result?.thumbnailUrl ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      uploadedAt: dateFormatted,
      durationFormatted,
      status: record.status,
      sceneCount: result?.visualAnalysis?.totalScenes || 0,
      accuracyScore: result?.accuracyReport?.overallScore || 0,
      isDemo: false,
      filePath: record.file_path,
      fileSizeBytes: record.file_size_bytes,
      mimeType: record.mime_type,
      createdAt: record.created_at,
    };
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
      "Visual Direction",
    ];

    const rows = scriptTable.map((row) => [
      `"${row.timestamp}"`,
      `"${row.originalVoiceover.replace(/"/g, '""')}"`,
      `"${(row.exactOnScreenText || "No on-screen text detected.").replace(/"/g, '""')}"`,
      `"${(row.detailedVisualDirection || "No significant visual change detected").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizedTitle = videoTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `${sanitizedTitle}_reel_script_master.csv`);
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
    let md = "| Time | Original Voiceover / Audio | Exact On-Screen Text | Visual Direction |\n";
    md += "|---|---|---|---|\n";
    scriptTable.forEach((row) => {
      const vo = row.originalVoiceover.replace(/\|/g, "\\|");
      const text = (row.exactOnScreenText || "No on-screen text detected.").replace(/\|/g, "\\|");
      const visual = (row.detailedVisualDirection || "No significant visual change detected").replace(/\|/g, "\\|");
      md += `| ${row.timestamp} | ${vo} | ${text} | ${visual} |\n`;
    });
    return md;
  }

  public formatEditingTimelineAsMarkdown(timeline: EditingTimelineEvent[]): string {
    let md = "| Time | Editing Action | Observable Result |\n";
    md += "|---|---|---|\n";
    timeline.forEach((row) => {
      const action = row.editingAction.replace(/\|/g, "\\|");
      const result = row.observableResult.replace(/\|/g, "\\|");
      md += `| ${row.timestamp} | ${action} | ${result} |\n`;
    });
    return md;
  }

  public exportEditingTimelineToCSV(timeline: EditingTimelineEvent[], videoTitle: string): void {
    const headers = ["Time", "Editing Action", "Observable Result"];
    const rows = timeline.map((row) => [
      `"${row.timestamp}"`,
      `"${row.editingAction.replace(/"/g, '""')}"`,
      `"${row.observableResult.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizedTitle = videoTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `${sanitizedTitle}_editing_timeline.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const contentAnalysisService = new ContentAnalysisService();
