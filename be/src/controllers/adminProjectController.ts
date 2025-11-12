import { Request, Response } from "express";
import Project from "../models/project";
import User from "../models/user";
import { Sequelize } from "sequelize";
import { ProjectStudents } from "../models";

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
        [
          Sequelize.fn("COUNT", Sequelize.col("projectStudents.id")),
          "student_count",
        ],
      ],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["full_name", "email"],
        },
        {
          model: ProjectStudents,
          as: "projectStudents",
          attributes: [],
          duplicating: false,
        },
      ],
      group: ["Project.id", "teacher.id"],
      order: [["id", "ASC"]],
      raw: false,
      subQuery: false,
    });

    const formattedProjects = projects.map((project: any) => {
      const projectData = project.toJSON();
      return {
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        teacher_id: projectData.teacher_id,
        status: projectData.status,
        created_at: projectData.created_at,
        expired_at: projectData.expire_at,
        teacher_name: projectData.teacher?.full_name || null,
        teacher_email: projectData.teacher?.email || null,
        student_count: parseInt(projectData.student_count) || 0,
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
