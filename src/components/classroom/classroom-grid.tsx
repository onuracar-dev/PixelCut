"use client";

import * as React from "react";
import {
  CheckCircle2,
  Search,
  Plus,
} from "lucide-react";
import { LiveAssistanceSession, StudentLiveState, Challenge } from "@/types";
import { LayoutMorphRadar } from "./layout-morph-radar";
import { CreateChallengeDialog } from "./create-challenge-dialog";
import { CurveDrawer } from "../ui/curve-drawer";
import { DiffSlider } from "../workspace/diff-slider";
import { SegmentedControl } from "@/components/apple/segmented-control";
import { cn } from "@/lib/utils";

interface ClassroomGridProps {
  students: StudentLiveState[];
  targetImageUrl: string;
  onGradeStudent?: (studentId: string, grade: number, feedback: string) => void;
  onStartSession?: (session: LiveAssistanceSession) => void;
  currentChallenge?: Challenge;
  challenges?: Challenge[];
  onSelectChallenge?: (challengeId: string) => void;
  onPublishChallenge?: (challenge: Challenge) => void;
  userRole?: string;
}

export function ClassroomGrid({
  students,
  targetImageUrl,
  onGradeStudent,
  onStartSession,
  currentChallenge,
  challenges = [],
  onSelectChallenge,
  onPublishChallenge,
  userRole,
}: ClassroomGridProps) {
  const isTeacher = userRole === "teacher";
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<
    "all" | "help" | "coding" | "submitted"
  >("all");
  const [inspectedStudent, setInspectedStudent] =
    React.useState<StudentLiveState | null>(null);
  const [gradeInput, setGradeInput] = React.useState<number>(95);
  const [feedbackInput, setFeedbackInput] = React.useState<string>("");
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = React.useState(false);

  // Aggregate stats
  const helpCount = students.filter((s) => s.status === "needs_help").length;
  const activeCount = students.filter((s) => s.status === "coding").length;
  const submittedCount = students.filter((s) => s.status === "submitted").length;
  const avgVisualMatch = Number(
    (
      students.reduce((acc, curr) => acc + curr.visualMatch, 0) /
      (students.length || 1)
    ).toFixed(1)
  );

  // Filter students based on search and status
  const filteredStudents = React.useMemo(() => {
    return students.filter((st) => {
      const matchesSearch =
        st.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.studentNo.includes(searchQuery);

      if (!matchesSearch) return false;
      if (filterStatus === "all") return true;
      if (filterStatus === "help") return st.status === "needs_help";
      if (filterStatus === "coding") return st.status === "coding";
      if (filterStatus === "submitted") return st.status === "submitted";
      return true;
    });
  }, [students, searchQuery, filterStatus]);

  const handleApprove = () => {
    if (!inspectedStudent) return;
    onGradeStudent?.(inspectedStudent.studentId, gradeInput, feedbackInput);
    setInspectedStudent(null);
  };

  return (
    <div className="flex h-full w-full flex-col bg-canvas select-none overflow-hidden">
      {/* Sleek Minimalist Command Bar */}
      <header className="border-b border-hairline bg-surface/85 px-4 sm:px-6 py-2.5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Field & Teacher Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-label-3" />
              <input
                type="text"
                placeholder="Öğrenci adı veya numarası ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mac-field pl-8 w-full text-[12px]"
              />
            </div>

            {isTeacher && (
              <button
                type="button"
                onClick={() => setIsCreateChallengeOpen(true)}
                className="mac-btn mac-btn-primary h-[31px] px-3 text-[12px] font-medium gap-1.5 shadow-mac-xs shrink-0"
                title="Yeni Laboratuvar Görevi Oluştur"
              >
                <Plus className="size-3.5" />
                <span>Yeni Görev</span>
              </button>
            )}
          </div>

          {/* Filter Segmented Control */}
          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto shrink-0">
            <SegmentedControl
              options={[
                { value: "all", label: `Tümü (${students.length})` },
                { value: "help", label: `🚨 Yardım (${helpCount})` },
                { value: "coding", label: `Yazanlar (${activeCount})` },
                { value: "submitted", label: `Teslim (${submittedCount})` },
              ]}
              value={filterStatus}
              onChange={(val) => setFilterStatus(val as any)}
              size="sm"
            />
          </div>
        </div>
      </header>

      {/* Main 3D Layout Morph Stage */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 dot-canvas">
        <LayoutMorphRadar
          students={filteredStudents}
          onStartSession={onStartSession}
          onGradeStudent={(studentId, grade, feedback) => {
            const student = students.find((s) => s.studentId === studentId);
            if (student) {
              setInspectedStudent(student);
              setGradeInput(grade);
              setFeedbackInput(feedback);
            }
          }}
        />
      </main>

      {/* Live Inspection Drawer */}
      <CurveDrawer
        isOpen={Boolean(inspectedStudent)}
        onClose={() => setInspectedStudent(null)}
        title={inspectedStudent ? `${inspectedStudent.studentName} — Canlı İnceleme` : ""}
        subtitle={
          inspectedStudent
            ? `No: ${inspectedStudent.studentNo} • Görsel Benzerlik: %${inspectedStudent.visualMatch}`
            : ""
        }
        side="right"
      >
        {inspectedStudent && (
          <div className="space-y-6">
            {/* Live Visual Diff Comparison */}
            <div>
              <span className="section-label block mb-2">Canlı Perde Kıyaslama</span>
              <DiffSlider
                studentHtml={inspectedStudent.html}
                studentCss={inspectedStudent.css}
                targetImageUrl={targetImageUrl}
                height={260}
              />
            </div>

            {/* Code Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[14px] bg-well p-3 shadow-mac-xs">
                <span className="text-[11px] text-label-3 block">CSS Satır Sayısı</span>
                <p className="mt-1 text-[16px] font-semibold font-mono text-label">
                  {inspectedStudent.linesCount} satır
                </p>
              </div>

              <div className="rounded-[14px] bg-well p-3 shadow-mac-xs">
                <span className="text-[11px] text-label-3 block">Görsel Eşleşme</span>
                <p className="mt-1 text-[16px] font-semibold font-mono text-label">
                  %{inspectedStudent.visualMatch}
                </p>
              </div>
            </div>

            {/* Student's Raw Code Inspection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="section-label">Öğrencinin Ayıkladığı CSS</span>
                <span className="text-[10.5px] font-mono text-label-3">Canlı Akış</span>
              </div>
              <pre className="max-h-56 overflow-y-auto rounded-[14px] border border-hairline bg-surface p-3 font-mono text-[11.5px] text-label leading-relaxed shadow-mac-xs">
                <code>{inspectedStudent.css}</code>
              </pre>
            </div>

            {/* Teacher Grading Section */}
            <div className="rounded-[18px] bg-surface p-4 shadow-mac-sm space-y-3.5">
              <span className="section-label block">Öğretmen Değerlendirmesi & Not</span>

              <div className="flex items-center justify-between">
                <label className="text-[12.5px] text-label-2">Verilen Not (100 üzerinden):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(Number(e.target.value))}
                    className="w-20 rounded-[8px] border border-hairline bg-well px-2.5 py-1 text-center font-mono text-[13px] font-semibold text-tint outline-none focus:border-tint"
                  />
                  <span className="text-[11px] text-label-3 font-mono">/ 100</span>
                </div>
              </div>

              <textarea
                placeholder="Öğrenciye anlık geri bildirim veya uyarı notu yazın..."
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                rows={3}
                className="w-full rounded-[10px] border border-hairline bg-well p-2.5 text-[12px] text-label placeholder:text-label-3 outline-none resize-none focus:border-tint"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setInspectedStudent(null)}
                  className="mac-btn mac-btn-ghost text-[12px]"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="mac-btn mac-btn-primary text-[12px]"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Notu Kaydet ve Gönder</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </CurveDrawer>

      {/* Create Challenge Dialog Wizard */}
      <CreateChallengeDialog
        isOpen={isCreateChallengeOpen}
        onClose={() => setIsCreateChallengeOpen(false)}
        onPublishChallenge={(newChallenge) => {
          onPublishChallenge?.(newChallenge);
          setIsCreateChallengeOpen(false);
        }}
        existingCount={challenges.length || 1}
      />
    </div>
  );
}
