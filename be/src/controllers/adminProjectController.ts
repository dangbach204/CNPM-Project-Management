import { Request, Response } from "express";
import Project from "../models/project";
import User from "../models/user";
import { ProjectStudents } from "../models";
import sequelize from "../config/db";
import LogService, { LOG_ACTIONS, ENTITY_TYPES } from "../lib/logService";

export const getProjectsManagement = async (req: Request, res: Response) => {
  try {
    const projects = await Project.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "teacher_id",
        "status",
        "created_at",
        "expire_at",
      ],
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
      order: [["id", "ASC"]],
    });

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
        teacherId: projectData.teacher_id,
        status: projectData.status,
        createdAt: projectData.created_at,
        expiredAt: projectData.expire_at,
        teacher: projectData.teacher
          ? {
              id: projectData.teacher.id,
              fullName: projectData.teacher.full_name,
              email: projectData.teacher.email,
              avatar: projectData.teacher.avatar,
            }
          : null,
        studentCount: students.length,
        students,
      };
    });

    return res.status(200).json({
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy danh sách dự án",
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId);
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: "Project không tồn tại" });
    }

    const projectData = project.toJSON() as any;
    await project.destroy({ transaction });

    await LogService.log(
      LOG_ACTIONS.DELETE_PROJECT,
      req,
      ENTITY_TYPES.PROJECT,
      projectData.id,
      {
        title: projectData.title,
        teacher_id: projectData.teacher_id,
      }
    );

    await transaction.commit();
    return res
      .status(200)
      .json({ message: "Xóa project và dữ liệu liên quan thành công" });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi xóa project:", error);
    return res.status(500).json({ message: "Lỗi server khi xóa project" });
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
      teacherId,
      status,
      expiredAt,
      addStudents,
      removeStudents,
    } = req.body;

    if (
      !title &&
      !description &&
      !teacherId &&
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

    if (teacherId) {
      const teacher = await User.findByPk(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        await transaction.rollback();
        return res.status(400).json({ message: "Giáo viên không hợp lệ" });
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (teacherId !== undefined) updateData.teacher_id = teacherId;
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
