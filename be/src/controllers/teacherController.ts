import { Request, Response } from "express";
import { Grade, Project, ProjectStudents, Submission, User } from "../models";
import LogService, { ENTITY_TYPES, LOG_ACTIONS } from "../lib/logService";
import sequelize from "../config/db";
import {
  toISOStringOrNull,
  isValidISODate,
  parseDate,
} from "../utils/formatDate";
import { notifyStudent } from "./notificationController";

export const getTeacherOverview = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;

    const [
      totalProjects,
      projects,
      submissions,
      totalSubmissions,
      allStudents,
    ] = await Promise.all([
      Project.count({
        where: { teacher_id: teacherId },
      }),

      Project.findAll({
        where: { teacher_id: teacherId },
        include: [
          {
            model: ProjectStudents,
            as: "projectStudents",
            include: [
              {
                model: User,
                as: "student",
                attributes: ["id", "full_name", "email", "avatar"],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      }),

      Submission.findAll({
        include: [
          {
            model: Project,
            as: "submissionProject",
            where: { teacher_id: teacherId },
            attributes: ["id", "title"],
          },
          {
            model: User,
            as: "student",
            attributes: ["id", "full_name", "email", "avatar"],
          },
        ],
        order: [["submitted_at", "DESC"]],
      }),
      Submission.count({
        include: [
          {
            model: Project,
            as: "submissionProject",
            where: { teacher_id: teacherId },
          },
        ],
      }),
      User.findAll({
        where: { role: "student" },
        attributes: ["id", "full_name", "email", "avatar"],
        order: [["id", "ASC"]],
        include: [
          {
            model: Project,
            as: "joinedProjects",
            attributes: ["id", "title"],
            through: { attributes: [] },
          },
        ],
      }),
    ]);

    const now = new Date();
    for (const project of projects) {
      const projectData = project.toJSON() as any;
      if (
        projectData.expire_at &&
        new Date(projectData.expire_at) < now &&
        projectData.status !== "expired"
      ) {
        await project.update({ status: "expired" });
      }
    }

    const formattedProjects = projects.map((project: any) => {
      const projectData = project.toJSON();
      const students =
        projectData?.projectStudents?.map((projectStudent: any) => ({
          id: projectStudent.student?.id,
          fullName: projectStudent.student?.full_name,
          email: projectStudent.student?.email,
          avatar: projectStudent.student?.avatar,
        })) || [];

      return {
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        teacherId: projectData.teacher_id ?? teacherId,
        status: projectData.status,
        createdAt: projectData.created_at,
        expiredAt: projectData.expire_at,
        studentCount: students.length,
        students,
      };
    });

    const formattedSubmissions = submissions.map((sub: any) => {
      const subData = sub.toJSON();
      return {
        id: subData.id,
        projectId: subData.project_id,
        projectTitle: subData.submissionProject?.title,
        studentId: subData.student_id,
        studentName: subData.student?.full_name,
        studentEmail: subData.student?.email,
        studentAvatar: subData.student?.avatar,
        reportLink: subData.report_link,
        submittedAt: subData.submitted_at,
      };
    });

    const grades = await Grade.findAll({
      where: {
        submission_id: submissions.map((sub: any) => sub.id),
      },
      attributes: ["submission_id"],
    });

    const gradedSubmissionIds = new Set(
      grades.map((grade: any) => grade.submission_id)
    );

    const pendingSubmissions = formattedSubmissions.filter(
      (sub: any) => !gradedSubmissionIds.has(sub.id)
    );

    return res.status(200).json({
      totalProjects,
      projects: formattedProjects,
      submissions: formattedSubmissions,
      totalSubmissions,
      pendingSubmissionsCount: pendingSubmissions.length,
      pendingSubmissions,
      allStudents,
    });
  } catch (error) {
    console.error("Lỗi lấy tổng quan giáo viên:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy tổng quan giáo viên",
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, expireAt } = req.body;
    const teacherId = req.user?.id;

    if (!title) {
      return res.status(400).json({ message: "Tiêu đề đề tài là bắt buộc" });
    }

    if (!title && !description && !expireAt) {
      return res.status(400).json({
        message: "Vui lòng cung cấp ít nhất một trường để tạo đề tài",
      });
    }

    if (expireAt && !isValidISODate(expireAt)) {
      return res.status(400).json({
        message:
          "expireAt phải là chuỗi ISO-8601 hợp lệ (VD: 2024-01-15T10:30:00Z)",
      });
    }

    const parsedExpireAt = parseDate(expireAt);

    
    if (parsedExpireAt) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const expireDate = new Date(parsedExpireAt);
      expireDate.setHours(0, 0, 0, 0);
      
      if (expireDate < now) {
        return res.status(400).json({
          message: "Ngày hết hạn phải sau ngày hiện tại",
        });
      }
    }

    const newProject = await Project.create({
      title,
      description,
      teacher_id: teacherId,
      ...(parsedExpireAt && { expire_at: parsedExpireAt }),
      status: "open",
    });

    await LogService.log(
      LOG_ACTIONS.CREATE_PROJECT,
      req,
      ENTITY_TYPES.PROJECT,
      newProject.id,
      {
        title: newProject.title,
        description: newProject.description,
        createAt: newProject.created_at,
        expireAt: newProject.expire_at,
      }
    );

    return res.status(201).json({
      message: "Tạo đề tài thành công",
      project: {
        id: newProject.id,
        title: newProject.title,
        description: newProject.description,
        expireAt: newProject.expire_at,
      },
    });
  } catch (error) {
    console.error("Lỗi tạo đề tài:", error);
    return res.status(500).json({
      message: "Lỗi server khi tạo đề tài",
    });
  }
};

export const updateProjectInfo = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const projectIdParam = req.params.projectId;
    const projectId = Number(projectIdParam);
    if (Number.isNaN(projectId)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid projectId parameter" });
    }

    const {
      title,
      description,
      status,
      expiredAt,
      addStudents,
      removeStudents,
    } = req.body;

    if (
      !title &&
      !description &&
      !status &&
      !expiredAt &&
      !addStudents &&
      !removeStudents
    ) {
      await transaction.rollback();
      return res.status(400).json({ message: "No fields to update" });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: "Project không tồn tại" });
    }

    const teacherId = req.user?.id;
    if (project.teacher_id !== teacherId) {
      await transaction.rollback();
      return res.status(403).json({
        message: "Bạn không có quyền sửa project này",
      });
    }

    if (expiredAt && !isValidISODate(expiredAt)) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "expiredAt phải là chuỗi ISO-8601 hợp lệ (VD: 2024-01-15T10:30:00Z)",
      });
    }

    
    if (expiredAt) {
      const projectData = project.toJSON() as any;
      const createdAt = new Date(projectData.created_at);
      createdAt.setHours(0, 0, 0, 0);
      const expireDate = new Date(expiredAt);
      expireDate.setHours(0, 0, 0, 0);
      
      if (expireDate < createdAt) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Ngày hết hạn phải sau ngày tạo đề tài",
        });
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (expiredAt !== undefined) updateData.expire_at = expiredAt;

    if (Object.keys(updateData).length > 0) {
      await project.update(updateData, { transaction });

      await LogService.log(
        LOG_ACTIONS.UPDATE_PROJECT,
        req,
        ENTITY_TYPES.PROJECT,
        projectId,
        { updated_fields: Object.keys(updateData), ...updateData }
      );
    }

    if (addStudents && Array.isArray(addStudents) && addStudents.length > 0) {
      const currentStudentCount = await ProjectStudents.count({
        where: { project_id: projectId },
      });

      const projectData = project.toJSON() as any;
      const maxStudents = projectData.max_students || 4;

      const removeCount =
        removeStudents && Array.isArray(removeStudents)
          ? removeStudents.length
          : 0;
      const finalStudentCount =
        currentStudentCount - removeCount + addStudents.length;

      if (finalStudentCount > maxStudents) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Không thể thêm sinh viên. Dự án đã đạt số lượng tối đa ${maxStudents} sinh viên. Hiện tại có ${currentStudentCount} sinh viên, không thể thêm ${addStudents.length} sinh viên nữa.`,
        });
      }

      for (const studentId of addStudents) {
        const student = await User.findByPk(studentId);
        if (!student || student.role !== "student") {
          await transaction.rollback();
          return res.status(400).json({
            message: `Sinh viên với ID ${studentId} không hợp lệ`,
          });
        }

        const existingProject = await ProjectStudents.findOne({
          where: { student_id: studentId },
        });
        if (existingProject) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Sinh viên với ID ${studentId} đã tham gia project khác`,
          });
        }
      }

      const projectStudentsData = addStudents.map((studentId) => ({
        project_id: projectId,
        student_id: studentId,
      }));
      await ProjectStudents.bulkCreate(projectStudentsData, { transaction });

      for (const studentId of addStudents) {
        await LogService.log(
          LOG_ACTIONS.ADD_STUDENT,
          req,
          ENTITY_TYPES.PROJECT,
          projectId,
          { student_id: studentId }
        );

        if (req.user?.id) {
          await notifyStudent(
            studentId,
            req.user.id,
            "added_to_project",
            projectId,
            project.title,
            `đã thêm bạn vào dự án "${project.title}"`
          );
        }
      }
    }

    if (
      removeStudents &&
      Array.isArray(removeStudents) &&
      removeStudents.length > 0
    ) {
      await ProjectStudents.destroy({
        where: {
          project_id: projectId,
          student_id: removeStudents,
        },
        transaction,
      });

      for (const studentId of removeStudents) {
        await LogService.log(
          LOG_ACTIONS.REMOVE_STUDENT,
          req,
          ENTITY_TYPES.PROJECT,
          projectId,
          { student_id: studentId }
        );
      }
    }

    await transaction.commit();

    const updatedProject = await Project.findByPk(projectId, {
      include: [
        {
          model: ProjectStudents,
          as: "projectStudents",
          include: [
            {
              model: User,
              as: "student",
              attributes: ["id", "full_name", "email", "avatar"],
            },
          ],
        },
      ],
    });

    const projectData = updatedProject?.toJSON() as any;
    const students =
      projectData?.projectStudents?.map((ps: any) => ({
        id: ps.student?.id,
        fullName: ps.student?.full_name,
        email: ps.student?.email,
        avatar: ps.student?.avatar,
      })) || [];

    return res.status(200).json({
      message: "Cập nhật project thành công",
      project: {
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        status: projectData.status,
        expiredAt: projectData.expire_at,
        students,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi cập nhật project:", error);
    return res.status(500).json({ message: "Lỗi server khi cập nhật project" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { projectId } = req.params;
    const teacherId = req.user?.id;
    const project = await Project.findByPk(projectId);

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: "Project không tồn tại" });
    }

    const projectData = project.toJSON() as any;

    if (projectData.teacher_id !== teacherId) {
      await transaction.rollback();
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa project này" });
    }

    await ProjectStudents.destroy({
      where: { project_id: projectId },
      transaction,
    });

    await Submission.destroy({
      where: { project_id: projectId },
      transaction,
    });

    await project.destroy({ transaction });

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
      }
    );

    await transaction.commit();
    return res.status(200).json({ message: "Xóa project thành công" });
  } catch (error) {
    await transaction.rollback();
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

    const [submissions, totalSubmissions] = await Promise.all([
      Submission.findAll({
        include: [
          {
            model: Project,
            as: "submissionProject",
            where: {
              teacher_id: teacherId,
            },
            attributes: ["id", "title", "teacher_id"],
          },
          {
            model: User,
            as: "student",
            attributes: ["id", "full_name", "email"],
          },
          {
            model: Grade,
            as: "grades",
            attributes: ["id", "score", "feedback"],
          },
        ],
        order: [["submitted_at", "DESC"]],
      }),

      Submission.count({
        include: [
          {
            model: Project,
            as: "submissionProject",
            where: {
              teacher_id: teacherId,
            },
          },
        ],
      }),
    ]);

    const formattedSubmissions = submissions.map((submission: any) => {
      return {
        id: submission.id,
        projectTitle: submission.submissionProject?.title,
        studentName: submission.student?.full_name,
        studentEmail: submission.student?.email,
        submittedAt: toISOStringOrNull(submission.submitted_at),
        reportLink: submission.report_link,
        score: submission.grades?.[0]?.score ?? null,
        feedback: submission.grades?.[0]?.feedback ?? "",
      };
    });

    return res.status(200).json({
      totalSubmissions,
      submissions: formattedSubmissions,
    });
  } catch (error) {
    console.error("Error getting submissions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const teacherGradeSubmission = async (req: Request, res: Response) => {
  try {
    const submissionId = req.params.submissionId;
    const { score, feedback } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ message: "Score is required" });
    }

    // Convert score to number if it's a string
    const numericScore = typeof score === 'string' ? parseFloat(score) : score;

    if (typeof numericScore !== "number" || isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      return res.status(400).json({ message: "Invalid score" });
    }

    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    let grade = await Grade.findOne({
      where: { submission_id: submissionId },
    });

    if (!grade) {
      grade = await Grade.create({
        teacher_id: req.user?.id,
        submission_id: submissionId,
        score: numericScore,
        feedback: feedback || null,
      });
    } else {
      grade.score = numericScore;
      grade.feedback = feedback ?? grade.feedback;
      await grade.save();
    }

    const submissionData = await Submission.findByPk(submissionId, {
      include: [
        {
          model: Project,
          as: "submissionProject",
          attributes: ["title"],
        },
      ],
    });

    // Lấy thông tin giáo viên
    const teacher = await User.findByPk(req.user?.id, {
      attributes: ["full_name"],
    });

    if (submissionData && req.user?.id) {
      console.log(
        "Sending notification to student ID:",
        submissionData.student_id
      );
      try {
        const projectTitle = (submissionData as any).submissionProject?.title || "Bài nộp";
        const teacherName = teacher?.full_name || "Giáo viên";
        
        await notifyStudent(
          submissionData.student_id,
          req.user.id,
          "grade_submitted",
          Number(submissionId),
          projectTitle,
          `${teacherName} đã chấm điểm báo cáo đề tài "${projectTitle}" của bạn: ${numericScore}/10${feedback ? ` - Nhận xét: ${feedback}` : ""}`
        );
        console.log("Notification sent successfully!");
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    } else {
      console.log("Cannot send notification - missing data");
    }

    return res.status(200).json({
      message: "Grading successful",
      grade: {
        id: grade.id,
        submissionId: grade.submission_id,
        score: grade.score,
        feedback: grade.feedback,
      },
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const teacherUpdateProjectInfo = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const projectIdParam = req.params.projectId;
    const projectId = Number(projectIdParam);
    if (Number.isNaN(projectId)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid projectId parameter" });
    }

    const {
      title,
      description,
      status,
      expiredAt,
      addStudents,
      removeStudents,
    } = req.body;

    if (
      !title &&
      !description &&
      !status &&
      !expiredAt &&
      !addStudents &&
      !removeStudents
    ) {
      await transaction.rollback();
      return res.status(400).json({ message: "No fields to update" });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: "Project không tồn tại" });
    }

    // Lưu giá trị cũ để so sánh
    const oldValues = {
      title: project.title,
      description: project.description,
      status: project.status,
      expiredAt: project.expire_at,
    };

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (expiredAt !== undefined) updateData.expire_at = expiredAt;

    // Track actual changes để chỉ gửi thông báo cho field thực sự thay đổi
    const actualChanges: any = {};
    if (title !== undefined && title !== oldValues.title) actualChanges.title = title;
    if (description !== undefined && description !== oldValues.description) actualChanges.description = description;
    if (status !== undefined && status !== oldValues.status) actualChanges.status = status;
    
    // So sánh date chính xác (CHỈ so sánh phần NGÀY, không so sánh time)
    if (expiredAt !== undefined && oldValues.expiredAt) {
      // Extract chỉ phần date (YYYY-MM-DD)
      const newDateOnly = new Date(expiredAt).toISOString().split('T')[0];
      const oldDateOnly = new Date(oldValues.expiredAt).toISOString().split('T')[0];
      
      if (newDateOnly !== oldDateOnly) {
        actualChanges.expiredAt = expiredAt;
      }
    } else if (expiredAt !== undefined && !oldValues.expiredAt) {
      // Trường hợp thêm mới expiredAt
      actualChanges.expiredAt = expiredAt;
    }

    if (Object.keys(updateData).length > 0) {

      await project.update(updateData, { transaction });

      await LogService.log(
        LOG_ACTIONS.UPDATE_PROJECT,
        req,
        ENTITY_TYPES.PROJECT,
        projectId,
        { updated_fields: Object.keys(updateData), ...updateData }
      );

      if ((status !== undefined || expiredAt !== undefined || title !== undefined || description !== undefined) && req.user?.id) {
        const projectStudents = await ProjectStudents.findAll({
          where: { project_id: projectId },
        });

        const statusLabels: { [key: string]: string } = {
          open: "Trống",
          available: "Mở",
          pending: "Đang thực hiện",
          completed: "Hoàn thành",
          approved: "Đã phê duyệt",
          rejected: "Đã từ chối",
          expired: "Hết hạn",
        };

        // Gửi từng thông báo riêng biệt - CHỈ khi giá trị THỰC SỰ thay đổi
        for (const ps of projectStudents) {
          // Thông báo khi đổi tên (CHỈ khi thay đổi)
          if (actualChanges.title) {
            await notifyStudent(
              ps.student_id,
              req.user.id,
              "project_updated",
              projectId,
              project.title,
              `đã đổi tên dự án thành "${actualChanges.title}"`
            );
          }
          
          // Thông báo khi đổi mô tả (CHỈ khi thay đổi)
          if (actualChanges.description) {
            const shortDesc = actualChanges.description.length > 100 
              ? actualChanges.description.substring(0, 100) + '...' 
              : actualChanges.description;
            await notifyStudent(
              ps.student_id,
              req.user.id,
              "project_updated",
              projectId,
              project.title,
              `đã đổi mô tả dự án thành "${shortDesc}"`
            );
          }
          
          // Thông báo khi đổi trạng thái (CHỈ khi thay đổi)
          if (actualChanges.status) {
            await notifyStudent(
              ps.student_id,
              req.user.id,
              "project_updated",
              projectId,
              project.title,
              `đã đổi trạng thái dự án thành "${statusLabels[actualChanges.status] || actualChanges.status}"`
            );
          }

          if (actualChanges.expiredAt) {
            const date = new Date(actualChanges.expiredAt);
            await notifyStudent(
              ps.student_id,
              req.user.id,
              "project_updated",
              projectId,
              project.title,
              `đã đổi hạn nộp dự án thành ${date.toLocaleDateString("vi-VN")}`
            );
          }
        }

      } else {
        console.log("Notification conditions not met");
      }
    }

    if (addStudents && Array.isArray(addStudents) && addStudents.length > 0) {
      const currentStudentCount = await ProjectStudents.count({
        where: { project_id: projectId },
      });

      const projectData = project.toJSON() as any;
      const maxStudents = projectData.max_students || 4;

      const removeCount =
        removeStudents && Array.isArray(removeStudents)
          ? removeStudents.length
          : 0;
      const finalStudentCount =
        currentStudentCount - removeCount + addStudents.length;

      if (finalStudentCount > maxStudents) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Không thể thêm sinh viên. Dự án đã đạt số lượng tối đa ${maxStudents} sinh viên. Hiện tại có ${currentStudentCount} sinh viên, không thể thêm ${addStudents.length} sinh viên nữa.`,
        });
      }

      for (const studentId of addStudents) {
        const student = await User.findByPk(studentId);
        if (!student || student.role !== "student") {
          await transaction.rollback();
          return res.status(400).json({
            message: `Sinh viên với ID ${studentId} không hợp lệ`,
          });
        }

        const existingProject = await ProjectStudents.findOne({
          where: { student_id: studentId },
        });
        if (existingProject) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Sinh viên với ID ${studentId} đã tham gia project khác`,
          });
        }
      }

      const projectStudentsData = addStudents.map((studentId) => ({
        project_id: projectId,
        student_id: studentId,
      }));
      await ProjectStudents.bulkCreate(projectStudentsData, { transaction });

      for (const studentId of addStudents) {
        await LogService.log(
          LOG_ACTIONS.ADD_STUDENT,
          req,
          ENTITY_TYPES.PROJECT,
          projectId,
          { student_id: studentId }
        );

        if (req.user?.id) {
          await notifyStudent(
            studentId,
            req.user.id,
            "added_to_project",
            projectId,
            project.title,
            `đã thêm bạn vào dự án "${project.title}"`
          );
        }
      }
    }

    if (
      removeStudents &&
      Array.isArray(removeStudents) &&
      removeStudents.length > 0
    ) {
      await ProjectStudents.destroy({
        where: {
          project_id: projectId,
          student_id: removeStudents,
        },
        transaction,
      });

      for (const studentId of removeStudents) {
        await LogService.log(
          LOG_ACTIONS.REMOVE_STUDENT,
          req,
          ENTITY_TYPES.PROJECT,
          projectId,
          { student_id: studentId }
        );
      }
    }

    await transaction.commit();

    const updatedProject = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "full_name", "email", "avatar"],
        },
        {
          model: ProjectStudents,
          as: "projectStudents",
          include: [
            {
              model: User,
              as: "student",
              attributes: ["id", "full_name", "email", "avatar"],
            },
          ],
        },
      ],
    });

    const projectData = updatedProject?.toJSON() as any;
    const students =
      projectData?.projectStudents?.map((ps: any) => ({
        id: ps.student?.id,
        fullName: ps.student?.full_name,
        email: ps.student?.email,
        avatar: ps.student?.avatar,
      })) || [];

    return res.status(200).json({
      message: "Cập nhật project thành công",
      project: {
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        teacherId: projectData.teacher_id,
        status: projectData.status,
        expiredAt: projectData.expire_at,
        teacher: projectData.teacher
          ? {
              id: projectData.teacher.id,
              fullName: projectData.teacher.full_name,
              email: projectData.teacher.email,
              avatar: projectData.teacher.avatar,
            }
          : null,
        students,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi cập nhật project:", error);
    return res.status(500).json({ message: "Lỗi server khi cập nhật project" });
  }
};
