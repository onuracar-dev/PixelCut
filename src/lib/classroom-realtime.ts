import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";
import { Challenge, StudentLiveState } from "@/types";

export interface RealtimeCodePayload {
  studentId: string;
  studentName: string;
  studentNo: string;
  avatarUrl: string;
  html: string;
  css: string;
  visualMatch: number;
  cleanScore: number;
  linesCount: number;
  unusedCssPercent: number;
  timestamp: number;
}

export interface RealtimeHelpPayload {
  studentId: string;
  studentName: string;
  helpTopic: string;
  note?: string;
  timestamp: number;
}

export interface RealtimeAssistancePayload {
  studentId: string;
  html: string;
  css: string;
  teacherName: string;
  timestamp: number;
}

export interface SubmissionPayload {
  challengeId: string;
  studentId: string;
  studentName: string;
  studentNo: string;
  html: string;
  css: string;
  visualMatch: number;
  cleanScore: number;
  linesCount: number;
  unusedCssPercent: number;
}

// -------------------------------------------------------------
// LOCAL DRAFT MANAGEMENT (Öğrencinin kodları cihazda güvende)
// -------------------------------------------------------------
const DRAFT_PREFIX = "csspg_draft_";

export function saveDraftLocally(challengeId: string, html: string, css: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${DRAFT_PREFIX}${challengeId}`,
      JSON.stringify({ html, css, updatedAt: Date.now() })
    );
  } catch (e) {
    console.warn("[Draft] LocalStorage write failed", e);
  }
}

export function loadDraftLocally(
  challengeId: string
): { html: string; css: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${challengeId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearDraftLocally(challengeId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${challengeId}`);
  } catch (e) {}
}

// -------------------------------------------------------------
// SUPABASE DATABASE API (Nihai Görev & Ödev Teslimleri)
// -------------------------------------------------------------
export async function submitToSupabase(payload: SubmissionPayload): Promise<{
  success: boolean;
  error?: string;
  data?: any;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      data: { localOnly: true, message: "Supabase bağlı değil, yerel teslim alındı." },
    };
  }

  try {
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        challenge_id: payload.challengeId,
        student_id: payload.studentId,
        student_name: payload.studentName,
        student_no: payload.studentNo,
        html: payload.html,
        css: payload.css,
        visual_match: payload.visualMatch,
        clean_score: payload.cleanScore,
        lines_count: payload.linesCount,
        unused_css_percent: payload.unusedCssPercent,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[Supabase Submission Error]:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[Supabase Submission Exception]:", err);
    return { success: false, error: err.message || "Bilinmeyen hata" };
  }
}

export async function fetchChallengesFromSupabase(): Promise<Challenge[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      difficulty: c.difficulty,
      roomType: c.room_type || "practice",
      targetImageUrl: c.target_image_url,
      targetWidth: c.target_width || 720,
      targetHeight: c.target_height || 420,
      starterHtml: c.starter_html,
      starterCss: c.starter_css,
      hints: Array.isArray(c.hints) ? c.hints : [],
      maxLinesGoal: c.max_lines_goal,
      xpReward: c.xp_reward || 100,
      deadline: c.deadline || undefined,
      createdAt: c.created_at,
    }));
  } catch (e) {
    console.warn("[Supabase] Challenges fetch error, falling back to mock", e);
    return null;
  }
}

// -------------------------------------------------------------
// SUPABASE REALTIME WEBSOCKET (In-Memory Broadcast & Presence)
// -------------------------------------------------------------
// Not: Veritabanına saniyede bir tuşa basış SQL yazılmaz!
// Keystroke'lar tamamen Supabase Realtime Channel Broadcast üzerinden akar.
// Bu sayede 500MB DB kotası korunur, sıfır gecikmeli canlı yayın yapılır.

export class ClassroomRealtimeManager {
  private channel: RealtimeChannel | null = null;
  private channelName: string;
  private isSubscribed: boolean = false;

  constructor(channelName: string = "classroom-live-radar") {
    this.channelName = channelName;
  }

  public init({
    onStudentCodeStream,
    onStudentAskHelp,
    onStudentCancelHelp,
    onTeacherAssistance,
    onTeacherCompleteAssistance,
  }: {
    onStudentCodeStream?: (payload: RealtimeCodePayload) => void;
    onStudentAskHelp?: (payload: RealtimeHelpPayload) => void;
    onStudentCancelHelp?: (studentId: string) => void;
    onTeacherAssistance?: (payload: RealtimeAssistancePayload) => void;
    onTeacherCompleteAssistance?: (studentId: string) => void;
  }) {
    if (!isSupabaseConfigured) return;

    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    this.channel = supabase.channel(this.channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: "client" },
      },
    });

    // 1. Dinleyiciler: Öğrenci Canlı Kod Akışı
    this.channel.on(
      "broadcast",
      { event: "student:code-stream" },
      ({ payload }: { payload: RealtimeCodePayload }) => {
        onStudentCodeStream?.(payload);
      }
    );

    // 2. Dinleyiciler: Öğrenci Yardım İsteği
    this.channel.on(
      "broadcast",
      { event: "student:ask-help" },
      ({ payload }: { payload: RealtimeHelpPayload }) => {
        onStudentAskHelp?.(payload);
      }
    );

    // 3. Dinleyiciler: Öğrenci Yardım İptali
    this.channel.on(
      "broadcast",
      { event: "student:cancel-help" },
      ({ payload }: { payload: { studentId: string } }) => {
        onStudentCancelHelp?.(payload.studentId);
      }
    );

    // 4. Dinleyiciler: Hoca Canlı Kod Müdahalesi / Düzeltmesi
    this.channel.on(
      "broadcast",
      { event: "teacher:send-assistance" },
      ({ payload }: { payload: RealtimeAssistancePayload }) => {
        onTeacherAssistance?.(payload);
      }
    );

    // 5. Dinleyiciler: Hoca Yardımı Bitirdi
    this.channel.on(
      "broadcast",
      { event: "teacher:complete-assistance" },
      ({ payload }: { payload: { studentId: string } }) => {
        onTeacherCompleteAssistance?.(payload.studentId);
      }
    );

    this.channel.subscribe((status) => {
      this.isSubscribed = status === "SUBSCRIBED";
    });
  }

  // Öğrencinin Canlı Kod Yayını (Debounce ile çağrılır)
  public broadcastCode(payload: RealtimeCodePayload) {
    if (!this.channel || !this.isSubscribed) return;
    this.channel.send({
      type: "broadcast",
      event: "student:code-stream",
      payload,
    });
  }

  // Öğrenci Yardım İstediğinde
  public broadcastAskHelp(payload: RealtimeHelpPayload) {
    if (!this.channel || !this.isSubscribed) return;
    this.channel.send({
      type: "broadcast",
      event: "student:ask-help",
      payload,
    });
  }

  // Öğrenci Yardım İsteğini İptal Ettiğinde
  public broadcastCancelHelp(studentId: string) {
    if (!this.channel || !this.isSubscribed) return;
    this.channel.send({
      type: "broadcast",
      event: "student:cancel-help",
      payload: { studentId },
    });
  }

  // Hoca Canlı Müdahale Kodu Gönderdiğinde
  public broadcastAssistance(payload: RealtimeAssistancePayload) {
    if (!this.channel || !this.isSubscribed) return;
    this.channel.send({
      type: "broadcast",
      event: "teacher:send-assistance",
      payload,
    });
  }

  // Hoca Yardımı Tamamladığında
  public broadcastCompleteAssistance(studentId: string) {
    if (!this.channel || !this.isSubscribed) return;
    this.channel.send({
      type: "broadcast",
      event: "teacher:complete-assistance",
      payload: { studentId },
    });
  }

  public disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.isSubscribed = false;
    }
  }
}

export const classroomRealtime = new ClassroomRealtimeManager();
