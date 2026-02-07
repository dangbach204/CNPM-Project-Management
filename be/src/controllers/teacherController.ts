import { Request, Response } from "express";
import { teacherService, ServiceError } from "../services/teacherService";
import LogService, { ENTITY_TYPES, LOG_ACTIONS } from "../lib/logService";
import { notifyStudent } from "./notificationController";
import sequelize from "../config/db";

const STATUS_LABELS: { [key: string]: string } = {
  open: "Trống",
  available: "Mở",
  pending: "Đang thực hiện",
  completed: "Hoàn thành",
  approved: "Đã phê duyệt",
  rejected: "Đã từ chối",
  expired: "Hết hạn",
};

export const getTeacherOverview = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const overview = await teacherService.getOverview(teacherId);
    return res.status(200).json(overview);
  } catch (error) {
    console.error("Lỗi lấy tổng quan giáo viên:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy tổng quan giáo viên" });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await teacherService.createProject(teacherId, req.body);

    // Log action (side effect - kept in controller)
    await LogService.log(
      LOG_ACTIONS.CREATE_PROJECT,
      req,
      ENTITY_TYPES.PROJECT,
      project.id,
      {
        title: project.title,
        description: project.description,
        createAt: project.createdAt,
        expireAt: project.expireAt,
      },
    );

    return res.status(201).json({
      message: "Tạo đề tài thành công",
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        expireAt: project.expireAt,
      },
    });
  } catch (error: any) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Lỗi tạo đề tài:", error);
    return res.status(500).json({ message: "Lỗi server khi tạo đề tài" });
  }
};

export const updateProjectInfo = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const teacherId = req.user?.id;
    const projectId = Number(req.params.projectId);

    if (!teacherId) {
      await transaction.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (Number.isNaN(projectId)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid projectId parameter" });
    }

    const { project, actualChanges, addedStudents, removedStudents } =
      await teacherService.updateProject(
        projectId,
        teacherId,
        req.body,
        transaction,
      );

    // Log updates
    const { title, description, status, expiredAt } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (expiredAt !== undefined) updateData.expire_at = expiredAt;

    if (Object.keys(updateData).length > 0) {
      await LogService.log(
        LOG_ACTIONS.UPDATE_PROJECT,
        req,
        ENTITY_TYPES.PROJECT,
        projectId,
        {
          updated_fields: Object.keys(updateData),
          ...updateData,
        },
      );
    }

    // Log student additions/removals
    for (const studentId of addedStudents) {
      await LogService.log(
        LOG_ACTIONS.ADD_STUDENT,
        req,
        ENTITY_TYPES.PROJECT,
        projectId,
        {
          student_id: studentId,
        },
      );

      if (teacherId) {
        await notifyStudent(
          studentId,
          teacherId,
          "added_to_project",
          projectId,
          project.title,
          `đã thêm bạn vào dự án "${project.title}"`,
        );
      }
    }

    for (const studentId of removedStudents) {
      await LogService.log(
        LOG_ACTIONS.REMOVE_STUDENT,
        req,
        ENTITY_TYPES.PROJECT,
        projectId,
        {
          student_id: studentId,
        },
      );
    }

    // Send notifications for project changes
    if (Object.keys(actualChanges).length > 0 && teacherId) {
      const projectStudents =
        await teacherService.getProjectStudents(projectId);

      for (const ps of projectStudents) {
        if (actualChanges.title) {
          await notifyStudent(
            ps.student_id,
            teacherId,
            "project_updated",
            projectId,
            project.title,
            `đã đổi tên dự án thành "${actualChanges.title}"`,
          );
        }

        if (actualChanges.description) {
          const shortDesc =
            actualChanges.description.length > 100
              ? actualChanges.description.substring(0, 100) + "..."
              : actualChanges.description;
          await notifyStudent(
            ps.student_id,
            teacherId,
            "project_updated",
            projectId,
            project.title,
            `đã đổi mô tả dự án thành "${shortDesc}"`,
          );
        }

        if (actualChanges.status) {
          await notifyStudent(
            ps.student_id,
            teacherId,
            "project_updated",
            projectId,
            project.title,
            `đã đổi trạng thái dự án thành "${STATUS_LABELS[actualChanges.status] || actualChanges.status}"`,
          );
        }

        if (actualChanges.expiredAt) {
          const date = new Date(actualChanges.expiredAt);
          await notifyStudent(
            ps.student_id,
            teacherId,
            "project_updated",
            projectId,
            project.title,
            `đã đổi hạn nộp dự án thành ${date.toLocaleDateString("vi-VN")}`,
          );
        }
      }
    }

    await transaction.commit();

    const updatedProject =
      await teacherService.getProjectWithDetails(projectId);

    return res.status(200).json({
      message: "Cập nhật project thành công",
      project: updatedProject,
    });
  } catch (error: any) {
    await transaction.rollback();

    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Lỗi cập nhật project:", error);
    return res.status(500).json({ message: "Lỗi server khi cập nhật project" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const { projectId } = req.params;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectData = await teacherService.deleteProject(
      Number(projectId),
      teacherId,
    );

    await LogService.log(
      LOG_ACTIONS.DELETE_PROJECT,
      req,
      ENTITY_TYPES.PROJECT,
      projectData.id,
      {
        title: projectData.title,
        description: projectData.description,
        createAt: projectData.created_at,
        expireAt: projectData.expire_at,
      },
    );

    return res.status(200).json({ message: "Xóa project thành công" });
  } catch (error: any) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Lỗi xóa project:", error);
    return res.status(500).json({ message: "Lỗi server khi xóa project" });
  }
};

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await teacherService.getSubmissions(teacherId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting submissions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const teacherGradeSubmission = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const { submissionId } = req.params;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { grade, submission, teacherName } =
      await teacherService.gradeSubmission(
        Number(submissionId),
        teacherId,
        req.body,
      );

    // Send notification (side effect)
    if (submission) {
      const projectTitle =
        (submission as any).submissionProject?.title || "Bài nộp";
      const { score, feedback } = req.body;
      const numericScore =
        typeof score === "string" ? parseFloat(score) : score;

      try {
        await notifyStudent(
          submission.student_id,
          teacherId,
          "grade_submitted",
          Number(submissionId),
          projectTitle,
          `${teacherName} đã chấm điểm báo cáo đề tài "${projectTitle}" của bạn: ${numericScore}/10${feedback ? ` - Nhận xét: ${feedback}` : ""}`,
        );
      } catch (notifyError) {
        console.error("Error sending notification:", notifyError);
      }
    }

    return res.status(200).json({
      message: "Grading successful",
      grade,
    });
  } catch (error: any) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Error grading submission:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const teacherUpdateProjectInfo = async (req: Request, res: Response) => {
  return updateProjectInfo(req, res);
};
