import { Request, Response } from "express";
import {
  Grade,
  Log,
  Project,
  ProjectStudents,
  Submission,
  User,
} from "../models";
import LogService, { ENTITY_TYPES, LOG_ACTIONS } from "../lib/logService";
import sequelize from "../config/db";

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
        where: { role: "student", is_active: true },
        attributes: ["id", "full_name", "email", "avatar"],
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

    return res.status(200).json({
      totalProjects,
      projects: formattedProjects,
      submissions: formattedSubmissions,
      totalSubmissions,
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
    const { title, description, createAt, expireAt } = req.body;
    const teacherId = req.user?.id;

    if (!title) {
      return res.status(400).json({ message: "Tiêu đề đề tài là bắt buộc" });
    }

    if (!title && !description && !createAt && !expireAt) {
      return res.status(400).json({
        message: "Vui lòng cung cấp ít nhất một trường để tạo đề tài",
      });
    }

    const newProject = await Project.create({
      title,
      description,
      teacher_id: teacherId,
      created_at: createAt || new Date(),
      expire_at: expireAt,
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
        expireAt: newProject.expireAt,
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
        submittedAt: submission.submitted_at,
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
