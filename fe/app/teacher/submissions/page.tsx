"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Loader2, FileText, User, Calendar, Award } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useGetSubmissions } from "@/hooks/useGetSubmissions";
import { teacherGradeSubmission } from "@/service/teacher-service";
import { useToast } from "@/hooks/use-toast";

type Submission = {
  id: number;
  projectTitle: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  reportLink: string;
  score: number | null;
  feedback: string | null;
};

export default function TeacherSubmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    submissions: submissionsResponse,
    isLoading,
    refetch,
  } = useGetSubmissions();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradeData, setGradeData] = useState<{
    score: number | null;
    feedback: string;
  }>({
    score: 0,
    feedback: "",
  });
  const [initialGradeData, setInitialGradeData] = useState<{
    score: number | null;
    feedback: string;
  }>({
    score: 0,
    feedback: "",
  });

  const submissions: Submission[] = Array.isArray(submissionsResponse)
    ? submissionsResponse
    : (submissionsResponse as any)?.submissions || [];
  const totalSubmissions = Array.isArray(submissionsResponse)
    ? submissionsResponse.length
    : (submissionsResponse as any)?.totalSubmissions || 0;

  useEffect(() => {
    const gradeId = searchParams.get("gradeId");
    if (gradeId && submissions.length > 0) {
      const targetSubmission = submissions.find(
        (s) => s.id === parseInt(gradeId)
      );
      if (targetSubmission) {
        const initialData = {
          score: targetSubmission.score ?? 0,
          feedback: targetSubmission.feedback || "",
        };
        setSelectedSubmission(targetSubmission);
        setGradeData(initialData);
        setInitialGradeData(initialData);
        setIsDialogOpen(true);
      }
    }
  }, [searchParams, submissions]);

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.projectTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const isGraded =
      submission.score !== null && submission.score !== undefined;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "graded" && isGraded) ||
      (statusFilter === "not_graded" && !isGraded);

    return matchesSearch && matchesStatus;
  });

  const gradedCount = submissions.filter(
    (s) => s.score !== null && s.score !== undefined
  ).length;
  const notGradedCount = submissions.length - gradedCount;

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      const currentParams = new URLSearchParams(searchParams.toString());
      if (currentParams.has("gradeId")) {
        currentParams.delete("gradeId");
        const newPath = currentParams.toString()
          ? `/teacher/submissions?${currentParams.toString()}`
          : "/teacher/submissions";
        router.replace(newPath, { scroll: false });
      }
    }
  };

  const handleViewDetails = (submission: Submission) => {
    const initialData = {
      score: submission.score ?? 0,
      feedback: submission.feedback || "",
    };
    setSelectedSubmission(submission);
    setGradeData(initialData);
    setInitialGradeData(initialData);
    setIsDialogOpen(true);

    router.replace(`/teacher/submissions?gradeId=${submission.id}`, {
      scroll: false,
    });
  };

  const hasChanges =
    gradeData.score !== initialGradeData.score ||
    gradeData.feedback !== initialGradeData.feedback;

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    if (!hasChanges) {
      setIsDialogOpen(false);
      router.replace("/teacher/submissions", { scroll: false });
      return;
    }

    const scoreValue = gradeData.score;
    if (
      scoreValue === null ||
      isNaN(scoreValue) ||
      scoreValue < 0 ||
      scoreValue > 10
    ) {
      toast({
        title: "Lỗi",
        description: "Điểm phải là số từ 0 đến 10",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGrading(true);
      await teacherGradeSubmission(selectedSubmission.id, {
        score: scoreValue,
        feedback: gradeData.feedback,
      });

      toast({
        title: "Thành công",
        description: "Đã chấm điểm thành công",
      });

      refetch();
      setIsDialogOpen(false);

      router.replace("/teacher/submissions", { scroll: false });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể chấm điểm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsGrading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 8.5) return "text-green-600";
    if (score >= 7) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (submission: Submission) => {
    const isGraded =
      submission.score !== null && submission.score !== undefined;
    if (isGraded) {
      return (
        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-0 text-[11px] font-medium">
          Đã chấm
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-0 text-[11px] font-medium">
        Chưa chấm
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="flex h-screen">
        {/* Sidebar and Header remain unchanged */}
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          {/* Main content with subtle background treatment */}
          <main className="flex-1 overflow-y-auto relative">
            {/* BACKGROUND WRAPPER */}
            <div className="absolute top-0 left-0 w-full h-full min-h-full overflow-hidden z-0 pointer-events-none">
              {/* Blurred background image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/bkhoa2.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                  backgroundRepeat: "no-repeat",
                  filter: "blur(10px)",
                  opacity: 0.6,
                  transform: "scale(1.1)",
                }}
              />

              {/* Gradient overlay (fade to white) */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.95) 55%)",
                }}
              />
            </div>

            {/* Content layer */}
            <div className="relative z-10 min-h-full p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
              {/* Stats Cards - reduced visual weight with softer styling */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border border-gray-100 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tổng bài nộp
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                          {totalSubmissions}
                        </p>
                      </div>
                      <div className="p-2.5 bg-blue-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-100 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Đã chấm
                        </p>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                          {gradedCount}
                        </p>
                      </div>
                      <div className="p-2.5 bg-green-50 rounded-lg">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-100 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Chưa chấm
                        </p>
                        <p className="text-3xl font-bold text-amber-600 mt-1">
                          {notGradedCount}
                        </p>
                      </div>
                      <div className="p-2.5 bg-amber-50 rounded-lg">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search & Filter - cohesive control bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên dự án hoặc sinh viên..."
                    className="pl-9 h-10 bg-white border-gray-200 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white border-gray-200 rounded-lg">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="graded">Đã chấm</SelectItem>
                    <SelectItem value="not_graded">Chưa chấm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submission Cards - more compact with clear hierarchy */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubmissions.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <p className="text-sm text-gray-400">
                      Không tìm thấy bài nộp nào
                    </p>
                  </div>
                ) : (
                  filteredSubmissions.map((submission) => {
                    const isGraded =
                      submission.score !== null &&
                      submission.score !== undefined;

                    const getScoreColorClass = (score: number) => {
                      if (score < 7) return "text-red-600";
                      if (score < 8.5) return "text-yellow-600";
                      return "text-green-600";
                    };

                    return (
                      <Card
                        key={submission.id}
                        className="bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                        onClick={() => handleViewDetails(submission)}
                      >
                        {/* Card header - status first, then title */}
                        <CardHeader className="p-4 pb-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            {/* Status badge emphasized */}
                            {getStatusBadge(submission)}
                          </div>
                          <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
                            {submission.projectTitle}
                          </CardTitle>
                        </CardHeader>

                        {/* Card content - student and meta info */}
                        <CardContent className="p-4 pt-0 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {submission.studentName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>{submission.submittedAt}</span>
                          </div>
                          {/* Score with color-coded display */}
                          {isGraded && (
                            <div
                              className={`flex items-center gap-2 text-sm pt-1 font-medium ${getScoreColorClass(
                                submission.score!
                              )}`}
                            >
                              <Award className="h-3.5 w-3.5 shrink-0" />
                              <span>Điểm: {submission.score}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Detail Dialog - URL-driven for shareability */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        {/* Dialog with clean layout and proper spacing */}
        <DialogContent className="max-w-2xl p-0 gap-0 border-gray-200">
          {/* Header - lighter title with subtle subtitle */}
          <DialogHeader className="px-6 py-5 border-b border-gray-100">
            <DialogTitle className="text-lg font-medium text-gray-900">
              Chi tiết bài nộp
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Thông tin chi tiết về bài nộp của sinh viên
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="px-6 py-5 space-y-6">
              {/* Helper function for score color feedback */}
              {(() => {
                const getScoreColorClass = (score: number | null) => {
                  if (score === null || score === 0) return "text-gray-900";
                  if (score < 7) return "text-red-600";
                  if (score < 8.5) return "text-amber-600";
                  return "text-green-600";
                };
                const scoreColorClass = getScoreColorClass(gradeData.score);

                return (
                  <>
                    {/* Read-only information section - grouped with muted styling */}
                    <div className="space-y-4 pb-5 border-b border-gray-100">
                      {/* Project Info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-gray-400" />
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Dự án
                          </Label>
                        </div>
                        <p className="text-base text-gray-900 pl-5">
                          {selectedSubmission.projectTitle}
                        </p>
                      </div>

                      {/* Student Info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Sinh viên
                          </Label>
                        </div>
                        <div className="pl-5 space-y-0.5">
                          <p className="text-base font-medium text-gray-900">
                            {selectedSubmission.studentName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedSubmission.studentEmail}
                          </p>
                        </div>
                      </div>

                      {/* Submission Date */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Ngày giờ nộp
                          </Label>
                        </div>
                        <p className="text-base text-gray-900 pl-5">
                          {selectedSubmission.submittedAt}
                        </p>
                      </div>
                    </div>

                    {/* Grading section - main focus area */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          Chấm điểm
                        </h3>
                      </div>

                      <div className="space-y-4 pl-6">
                        {/* Score input with clear range indication and color feedback */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="grade"
                            className="text-xs font-medium text-gray-500 uppercase tracking-wide"
                          >
                            Điểm số (0–10)
                          </Label>
                          <Input
                            id="grade"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="Nhập điểm từ 0 đến 10"
                            value={gradeData.score ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setGradeData({
                                ...gradeData,
                                score: value === "" ? null : Number(value),
                              });
                            }}
                            className={`h-10 max-w-xs border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-semibold ${scoreColorClass}`}
                          />
                        </div>

                        {/* Feedback textarea - comfortable height with softer styling */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="feedback"
                            className="text-xs font-medium text-gray-500 uppercase tracking-wide"
                          >
                            Nhận xét
                          </Label>
                          <Textarea
                            id="feedback"
                            placeholder="Nhập nhận xét về bài làm của sinh viên..."
                            rows={5}
                            value={gradeData.feedback}
                            onChange={(e) =>
                              setGradeData({
                                ...gradeData,
                                feedback: e.target.value,
                              })
                            }
                            className="border-gray-200 rounded-lg resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Footer with clear action hierarchy */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between gap-3">
              {/* Secondary action - view report */}
              <Button
                variant="outline"
                onClick={() =>
                  window.open(selectedSubmission?.reportLink, "_blank")
                }
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200"
              >
                Xem báo cáo
              </Button>

              {/* Primary action - save grade */}
              <Button
                onClick={handleSubmitGrade}
                disabled={
                  isGrading ||
                  !gradeData.score ||
                  (selectedSubmission?.score != null && !hasChanges)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : selectedSubmission?.score ? (
                  "Cập nhật điểm"
                ) : (
                  "Lưu điểm"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
