import {
  ContentAnalysisResult,
  AnalysisHistoryItem,
  ContentAnalysisRecord,
  AudioBackendResult,
  AudioAnalysisStatus,
  VisualBackendResult,
  VisualAnalysisStatus,
  FramePathItem,
  ScriptTableRow,
  EditingTimelineEvent,
} from "../types/analysis";
import {
  DEMO_ANALYSIS_RESULT,
  DEMO_PRESET_REELS,
} from "../data/demoAnalysis";
import { supabase } from "@/lib/supabase";

export const STORAGE_BUCKET = "reel-uploads";
export const VISUAL_FRAMES_BUCKET = "visual-analysis-frames";
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
   * Invokes the deployed Supabase Edge Function 'analyze-audio'
   * for the given analysisId using the authenticated session.
   */
  public async analyzeAudio(analysisId: string): Promise<{
    success: boolean;
    analysisId?: string;
    audio_analysis?: AudioBackendResult;
    error?: string;
  }> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return {
          success: false,
          error: "Authentication required: Please sign in to analyze Reel audio.",
        };
      }

      const { data, error } = await supabase.functions.invoke("analyze-audio", {
        body: {
          analysisId,
        },
      });

      if (error) {
        let msg = error.message;
        if ((error as any).context && typeof (error as any).context?.json === "function") {
          try {
            const body = await (error as any).context.json();
            if (body?.error) {
              msg = body.error;
            }
          } catch {}
        }
        return {
          success: false,
          error: msg || "Audio analysis invocation failed.",
        };
      }

      if (data && data.success === false) {
        return {
          success: false,
          error: data.error || "Audio analysis returned an error.",
        };
      }

      return {
        success: true,
        analysisId: data?.analysisId || analysisId,
        audio_analysis: data?.audio_analysis,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to invoke analyze-audio function.",
      };
    }
  }

  /**
   * Downloads original uploaded Reel video Blob from private storage (reel-uploads).
   */
  public async downloadReelVideo(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (error || !data) {
      throw new Error(
        `Failed to download uploaded Reel video: ${error?.message || "File not found"}`
      );
    }

    return data;
  }

  /**
   * Extracts up to 3 representative JPEG frames from video blob
   * at approximately 10%, 50%, and 90% of duration.
   * Resizes proportionally to <= 960px max dimension.
   * Compresses to JPEG <= 2 MB.
   * Releases all temporary object URLs and video resources.
   */
  public async extractRepresentativeFrames(
    videoBlob: Blob
  ): Promise<Array<{ blob: Blob; timestamp_seconds: number }>> {
    const objectUrl = URL.createObjectURL(videoBlob);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    try {
      // 1. Wait for video metadata to load with a 20s timeout
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanupListeners();
          reject(new Error("Timeout loading video metadata for frame extraction."));
        }, 20000);

        const onLoaded = () => {
          cleanupListeners();
          clearTimeout(timer);
          resolve();
        };

        const onError = () => {
          cleanupListeners();
          clearTimeout(timer);
          reject(new Error("Unable to read video bitstream for frame extraction."));
        };

        const cleanupListeners = () => {
          video.removeEventListener("loadedmetadata", onLoaded);
          video.removeEventListener("error", onError);
        };

        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("error", onError);
        video.src = objectUrl;
      });

      const duration = video.duration;
      const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 30;

      // 2. Select up to 3 representative timestamps at approx 10%, 50%, 90%
      const candidatePercents = [0.1, 0.5, 0.9];
      const targetTimestamps: number[] = [];

      for (const pct of candidatePercents) {
        let t = Number((safeDuration * pct).toFixed(2));
        // Clamp strictly within [0.05, safeDuration - 0.05]
        t = Math.max(0.05, Math.min(t, Math.max(0.05, safeDuration - 0.05)));

        // Avoid duplicate timestamps for short videos
        const isDuplicate = targetTimestamps.some(
          (existing) => Math.abs(existing - t) < 0.15
        );
        if (!isDuplicate) {
          targetTimestamps.push(t);
        }
      }

      if (targetTimestamps.length === 0) {
        targetTimestamps.push(0.05);
      }

      const extracted: Array<{ blob: Blob; timestamp_seconds: number }> = [];

      // 3. Capture each frame
      for (const timestamp of targetTimestamps) {
        await new Promise<void>((resolve, reject) => {
          const seekTimer = setTimeout(() => {
            cleanupSeek();
            reject(
              new Error(
                `Timeout seeking video to ${timestamp}s for frame capture.`
              )
            );
          }, 10000);

          const onSeeked = () => {
            cleanupSeek();
            clearTimeout(seekTimer);
            resolve();
          };

          const onSeekError = () => {
            cleanupSeek();
            clearTimeout(seekTimer);
            reject(
              new Error(
                `Error seeking video to ${timestamp}s for frame capture.`
              )
            );
          };

          const cleanupSeek = () => {
            video.removeEventListener("seeked", onSeeked);
            video.removeEventListener("error", onSeekError);
          };

          video.addEventListener("seeked", onSeeked);
          video.addEventListener("error", onSeekError);
          video.currentTime = timestamp;
        });

        // Calculate aspect-ratio preserved dimensions (longest dim <= 960)
        const origW = video.videoWidth || 720;
        const origH = video.videoHeight || 1280;
        const maxDim = 960;

        let targetW = origW;
        let targetH = origH;

        if (origW > maxDim || origH > maxDim) {
          if (origW >= origH) {
            targetW = maxDim;
            targetH = Math.max(1, Math.round((origH * maxDim) / origW));
          } else {
            targetH = maxDim;
            targetW = Math.max(1, Math.round((origW * maxDim) / origH));
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Canvas context initialization failed.");
        }
        ctx.drawImage(video, 0, 0, targetW, targetH);

        // Encode as JPEG quality 0.72, reducing if > 2MB
        let quality = 0.72;
        let frameBlob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/jpeg", quality)
        );

        while (
          frameBlob &&
          frameBlob.size > 2 * 1024 * 1024 &&
          quality > 0.3
        ) {
          quality -= 0.15;
          frameBlob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, "image/jpeg", quality)
          );
        }

        if (!frameBlob) {
          throw new Error(
            `Failed to encode video frame at ${timestamp}s as JPEG.`
          );
        }

        extracted.push({
          blob: frameBlob,
          timestamp_seconds: timestamp,
        });

        // Release canvas memory
        canvas.width = 0;
        canvas.height = 0;
      }

      return extracted;
    } finally {
      // 4. Release all temporary object URLs and video resources
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    }
  }

  /**
   * Uploads extracted JPEG frames to private visual-analysis-frames bucket
   * using exact path format: {userId}/{analysisId}/frame-{index}.jpg
   * Returns framePaths manifest for Edge Function invocation.
   */
  public async uploadAnalysisFrames(
    userId: string,
    analysisId: string,
    frames: Array<{ blob: Blob; timestamp_seconds: number }>
  ): Promise<FramePathItem[]> {
    const framePaths: FramePathItem[] = [];

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const storagePath = `${userId}/${analysisId}/frame-${i}.jpg`;

      const { error } = await supabase.storage
        .from(VISUAL_FRAMES_BUCKET)
        .upload(storagePath, frame.blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        throw new Error(
          `Failed to upload frame ${i + 1} to storage: ${error.message}`
        );
      }

      framePaths.push({
        path: storagePath,
        timestamp_seconds: frame.timestamp_seconds,
      });
    }

    return framePaths;
  }

  /**
   * Invokes the deployed Supabase Edge Function 'analyze-visual'
   * for the given analysisId and framePaths manifest using the authenticated session.
   * Supports asynchronous backend: { success: true, queued: true, analysisId, status: "queued" }.
   */
  public async analyzeVisual(
    analysisId: string,
    framePaths?: FramePathItem[]
  ): Promise<{
    success: boolean;
    queued?: boolean;
    status?: VisualAnalysisStatus;
    analysisId?: string;
    visual_analysis?: VisualBackendResult;
    error?: string;
  }> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return {
          success: false,
          error: "Authentication required: Please sign in to analyze Reel visuals.",
        };
      }

      const bodyPayload: {
        analysisId: string;
        framePaths?: FramePathItem[];
      } = {
        analysisId,
      };

      if (framePaths && framePaths.length > 0) {
        bodyPayload.framePaths = framePaths;
      }

      const { data, error } = await supabase.functions.invoke("analyze-visual", {
        body: bodyPayload,
      });

      if (error) {
        let msg = error.message;
        if ((error as any).context && typeof (error as any).context?.json === "function") {
          try {
            const body = await (error as any).context.json();
            if (body?.error) {
              msg = body.error;
            }
          } catch {}
        }
        return {
          success: false,
          error: msg || "Visual analysis invocation failed.",
        };
      }

      if (data && data.success === false) {
        return {
          success: false,
          error: data.error || "Visual analysis returned an error.",
        };
      }

      return {
        success: true,
        queued: Boolean(data?.queued),
        status: (data?.status as VisualAnalysisStatus) || (data?.queued ? "queued" : "processing"),
        analysisId: data?.analysisId || analysisId,
        visual_analysis: data?.visual_analysis,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to invoke analyze-visual function.",
      };
    }
  }

  /**
   * Polls the user's existing content_analyses record using Supabase.
   * Selects visual_analysis, visual_analysis_status, and visual_analysis_error,
   * filtered by current analysisId.
   */
  public async pollVisualStatus(analysisId: string): Promise<{
    visual_analysis: VisualBackendResult | null;
    visual_analysis_status: VisualAnalysisStatus | null;
    visual_analysis_error: string | null;
  } | null> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .select("visual_analysis, visual_analysis_status, visual_analysis_error")
        .eq("id", analysisId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        visual_analysis: (data.visual_analysis as VisualBackendResult) || null,
        visual_analysis_status: (data.visual_analysis_status as VisualAnalysisStatus) || null,
        visual_analysis_error: (data.visual_analysis_error as string) || null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetches a single ContentAnalysisRecord by ID for the authenticated user.
   */
  public async fetchAnalysisById(
    id: string
  ): Promise<ContentAnalysisRecord | null> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        return null;
      }

      return data as ContentAnalysisRecord;
    } catch (err) {
      console.error("[ContentAnalysisService] Error fetching record by id:", err);
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
      sceneCount:
        record.visual_analysis?.scenes?.length ||
        result?.visualAnalysis?.totalScenes ||
        0,
      accuracyScore: result?.accuracyReport?.overallScore || 0,
      isDemo: false,
      filePath: record.file_path,
      fileSizeBytes: record.file_size_bytes,
      mimeType: record.mime_type,
      createdAt: record.created_at,
      audioAnalysis: record.audio_analysis || null,
      audioAnalysisStatus: record.audio_analysis_status || null,
      audioAnalysisError: record.audio_analysis_error || null,
      visualAnalysis: record.visual_analysis || null,
      visualAnalysisStatus: record.visual_analysis_status || null,
      visualAnalysisError: record.visual_analysis_error || null,
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
