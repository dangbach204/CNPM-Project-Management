import { Request, Response } from "express";
import Project from "../models/project";

export const getProjectsManagement = async (req: Request, res: Response) => {
  try {
    const [projects] = await Promise.all([
      Project.findAll({
        attributes: [
          "id",
          "title",
          "description",
          "teacher_id",
          "status",
          "created_at",
          "expire_at",
        ],
        order: [["id", "ASC"]],
      }),
    ]);

    return res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      message: "Server error while fetching projects",
    });
  }
};
