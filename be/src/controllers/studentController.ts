import { Request, Response } from "express";
import { studentService, ServiceError } from "../services/studentService";
import { notifyTeacher } from "./notificationController";

export const getStundentOverview = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    const overview = await studentService.getOverview(studentId);

    return res.status(200).json(overview);
  } catch (error: any) {
    console.error("Error fetching student overview:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy tổng quan sinh viên",
    });
  }
};

export const getMyProject = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        message: "Unauthorized: Student ID not found",
      });
    }

    const project = await studentService.getMyProject(studentId);

    if (!project) {
      return res.status(200).json({
        message: "Student has not joined any project yet",
        project: null,
      });
    }

    return res.status(200).json({
      message: "Successfully fetched student project",
      project,
    });
  } catch (error) {
    console.error("Error fetching student project:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy đề tài của sinh viên",
    });
  }
};

export const studentJoinProject = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { projectId } = req.params;

    if (!studentId || !projectId) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    await studentService.joinProject(studentId, Number(projectId));

    return res.status(200).json({
      message: "Tham gia đề tài thành công",
    });
  } catch (error: any) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({
        message: error.message,
        ...(error.data && error.data),
      });
    }

    console.error("Error joining project:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi tham gia đề tài",
    });
  }
};

export const submitProject = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { projectId } = req.params;
    const { reportLink } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { submission, project, studentName } =
      await studentService.submitProject(
        studentId,
        Number(projectId),
        reportLink,
      );

    // Notification is a side effect - handled in controller
    if (project.teacher_id) {
      await notifyTeacher(
        project.teacher_id,
        studentId,
        "submission_received",
        Number(projectId),
        project.title,
        `Sinh viên ${studentName} đã nộp báo cáo cho dự án "${project.title}"`,
      );
    }

    return res.status(201).json({
      message: "Nộp báo cáo thành công",
      submission,
    });
  } catch (error: any) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error("Error submitting project:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi nộp báo cáo",
    });
  }
};

export const studentGetProjects = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await studentService.getAvailableProjects(studentId);

    // Extract joined project IDs for backward compatibility
    const myProjectIds = projects
      .filter((p: { isJoined: boolean }) => p.isJoined)
      .map((p: { id: number }) => p.id);

    return res.status(200).json({
      projects,
      myProjectIds,
    });
  } catch (error: any) {
    console.error("Error fetching all projects:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy tất cả đề tài",
    });
  }
};

export const getMySubmissions = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        message: "Unauthorized: Student ID not found",
      });
    }

    const projectId = req.query.projectId
      ? Number(req.query.projectId)
      : undefined;

    const submissions = await studentService.getSubmissionHistory(
      studentId,
      projectId,
    );

    return res.status(200).json({
      message: "Successfully fetched submissions",
      submissionCount: submissions.length,
      submissions,
    });
  } catch (error: any) {
    console.error("Error fetching student submissions:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy danh sách bài nộp",
    });
  }
};