"use client";

import { useState } from "react";
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
import Link from "next/link";
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
  const [gradeData, setGradeData] = useState({
    score: 0,
    feedback: "",
  });

  const submissions: Submission[] = Array.isArray(submissionsResponse)
    ? submissionsResponse
    : (submissionsResponse as any)?.submissions || [];
  const totalSubmissions = Array.isArray(submissionsResponse)
    ? submissionsResponse.length
    : (submissionsResponse as any)?.totalSubmissions || 0;

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

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score ?? 0,
      feedback: submission.feedback || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    const scoreValue = gradeData.score;
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 10) {
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

      // Refresh data
      refetch();
      setIsDialogOpen(false);
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
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
          Đã chấm
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">
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
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto relative" style={{
            backgroundImage: 'url(/bkhoa1.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}>
            <div className="absolute inset-0 bg-white/15 backdrop-blur-[1px] -z-10"></div>
            <div className="p-8 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/90 backdrop-blur-sm border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xl text-black font-bold">
                          Tổng bài nộp
                        </p>
                        <p className="text-4xl font-bold mt-2">
                          {totalSubmissions}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xl text-black font-bold">
                          Đã chấm
                        </p>
                        <p className="text-4xl font-bold mt-2 text-green-600">
                          {gradedCount}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <Award className="w-7 h-7 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xl text-black font-bold">
                          Chưa chấm
                        </p>
                        <p className="text-4xl font-bold mt-2 text-yellow-600">
                          {notGradedCount}
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <FileText className="w-7 h-7 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:flex-1 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                  <Search className="absolute left-5 top-5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên dự án hoặc sinh viên..."
                    className="pl-8 bg-transparent border-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-transparent border-0">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="graded">Đã chấm</SelectItem>
                      <SelectItem value="not_graded">Chưa chấm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submission Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubmissions.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    Không tìm thấy bài nộp nào
                  </div>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <Card
                      key={submission.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewDetails(submission)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-1">
                              {submission.projectTitle}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {submission.studentName}
                            </CardDescription>
                          </div>
                          {getStatusBadge(submission)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{submission.submittedAt}</span>
                          </div>
                          {submission.score !== null && submission.score !== undefined && (
                            <div className={`flex items-center gap-2 font-semibold ${getScoreColor(submission.score)}`}>
                              <Award className="h-4 w-4" />
                              <span>Điểm: {submission.score}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết bài nộp</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về bài nộp của sinh viên
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Project Info */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dự án
                </h3>
                <p className="text-lg">{selectedSubmission.projectTitle}</p>
              </div>

              {/* Student Info */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sinh viên
                </h3>
                <div className="space-y-1">
                  <p className="text-lg font-medium">
                    {selectedSubmission.studentName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.studentEmail}
                  </p>
                </div>
              </div>

              {/* Submission Date */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ngày giờ nộp
                </h3>
                <p>{selectedSubmission.submittedAt}</p>
              </div>

              {/* Grade Info */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Chấm điểm
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Điểm số (0-10)</Label>
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="Nhập điểm..."
                      value={gradeData.score}
                      onChange={(e) =>
                        setGradeData({
                          ...gradeData,
                          score: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Nhận xét</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Nhập nhận xét về bài làm của sinh viên..."
                      rows={4}
                      value={gradeData.feedback}
                      onChange={(e) =>
                        setGradeData({ ...gradeData, feedback: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={handleSubmitGrade}
                  disabled={isGrading || !gradeData.score}
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
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(selectedSubmission?.reportLink, "_blank")
                  }
                >
                  Xem báo cáo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
