"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockProjects, mockSubmissions, mockGrades } from "@/lib/mock-data";
import { BookOpen, FileText, Award } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/user";

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const enrolledProjects = mockProjects.filter((p) =>
    p.enrolledStudents.includes(user?.id.toString() || "")
  );

  const mySubmissions = mockSubmissions.filter(
    (s) => s.studentId === user?.id.toString()
  );

  const myGrades = mockGrades.filter((g) =>
    mySubmissions.some((s) => s.id === g.submissionId)
  );

  const averageScore =
    myGrades.length > 0
      ? Math.round(
          (myGrades.reduce((sum, g) => sum + g.score, 0) / myGrades.length) * 10
        ) / 10
      : 0;

  const stats = [
    {
      title: "Đề tài tham gia",
      value: enrolledProjects.length,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Bài nộp",
      value: mySubmissions.length,
      icon: FileText,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Điểm trung bình",
      value: averageScore,
      icon: Award,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Sinh viên</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi đề tài và bài nộp của bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {typeof stat.value === "number" && stat.value % 1 !== 0
                        ? stat.value.toFixed(1)
                        : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enrolled Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Đề tài của tôi</CardTitle>
          <CardDescription>Các đề tài bạn đang tham gia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrolledProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Bạn chưa tham gia đề tài nào
                </p>
                <Link href="/student/projects">
                  <Button>Tìm Đề tài</Button>
                </Link>
              </div>
            ) : (
              enrolledProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Hạn chót:{" "}
                      {new Date(project.endDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <Link href={`/student/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Bài nộp của tôi</CardTitle>
          <CardDescription>Lịch sử bài nộp và điểm số</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mySubmissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Chưa có bài nộp nào
              </p>
            ) : (
              mySubmissions.map((submission) => {
                const grade = myGrades.find(
                  (g) => g.submissionId === submission.id
                );
                return (
                  <div
                    key={submission.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{submission.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Nộp:{" "}
                        {new Date(submission.submittedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                      {grade && (
                        <p className="text-sm font-medium mt-2">
                          Điểm:{" "}
                          <span className="text-primary">
                            {grade.score}/{grade.maxScore}
                          </span>
                        </p>
                      )}
                    </div>
                    <Link href={`/student/submissions/${submission.id}`}>
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
