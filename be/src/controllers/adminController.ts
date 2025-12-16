import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import {
  User,
  Project,
  Submission,
  ProjectStudents,
  Log,
} from "../models/index";

export const getAdminOverview = async (req: Request, res: Response) => {
  try {
    const [
      teachers,
      students,
      projects,
      submissions,
      totalProjects,
      totalSubmissions,
      latestProjects,
      latestSubmissions,
    ] = await Promise.all([
      User.findAll({
        where: { role: "teacher" },
        attributes: ["id", "email", "full_name", "created_at", "avatar"],
      }),
      User.findAll({
        where: { role: "student" },
        attributes: ["id", "email", "full_name", "created_at", "avatar"],
      }),
      Project.findAll({
        order: [["created_at", "DESC"]],
        attributes: [
          "id",
          "title",
          "description",
          "created_at",
          "status",
          "teacher_id",
        ],
      }),
      Submission.findAll({
        order: [["submitted_at", "DESC"]],
        attributes: [
          "id",
          "report_link",
          "submitted_at",
          "project_id",
          "student_id",
        ],
        include: [
          {
            model: Project,
            as: "project",
            attributes: ["title"],
          },
        ],
      }),
      Project.count(),
      Submission.count(),
      Project.findAll({
        order: [["created_at", "DESC"]],
        limit: 3,
        attributes: ["id", "title", "description", "created_at", "status"],
      }),
      Submission.findAll({
        order: [["submitted_at", "DESC"]],
        limit: 4,
        attributes: [
          "id",
          "report_link",
          "submitted_at",
          "project_id",
          "student_id",
        ],
        include: [
          {
            model: Project,
            as: "project",
            attributes: ["title"],
          },
        ],
      }),
    ]);

    const projectIds = projects.map((project: any) => project.id);

    const studentCounts = await ProjectStudents.findAll({
      where: { project_id: { [Op.in]: projectIds } },
      attributes: [
        "project_id",
        [fn("COUNT", col("student_id")), "student_count"],
      ],
      group: ["project_id"],
      raw: true,
    });

    const studentCountMap = Object.fromEntries(
      studentCounts.map((item: any) => [
        item.project_id,
        parseInt(item.student_count),
      ])
    );

    const formatDate = (date: Date | string | null) => {
      if (!date) return null;
      return new Date(date)
        .toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(",", "");
    };

    const formatArray = (arr: any[], dateField: string) =>
      arr.map((item) => ({
        ...item.toJSON(),
        [dateField]: formatDate(item[dateField]),
      }));

    const formattedLatestProjects = formatArray(
      latestProjects,
      "created_at"
    ).map((proj) => ({
      ...proj,
      student_count: studentCountMap[proj.id] || 0,
      teacher_instructor:
        teachers.find((teacher: any) => teacher.id === proj.teacher_id)
          ?.full_name || "chưa phân công",
    }));

    const formattedLatestSubmissions = latestSubmissions.map(
      (submission: any) => ({
        id: submission.id,
        project_id: submission.project_id,
        project_title: submission.project?.title || null,
        student_id: submission.student_id,
        report_link: submission.report_link,
        submitted_at: formatDate(submission.submitted_at),
      })
    );

    const formattedProjects = formatArray(projects, "created_at").map(
      (proj) => ({
        ...proj,
        teacher_instructor:
          teachers.find((teacher: any) => teacher.id === proj.teacher_id)
            ?.full_name || "chưa phân công",
        student_count: studentCountMap[proj.id] || 0,
      })
    );

    const formattedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      project_id: submission.project_id,
      project_title: submission.project?.title || null,
      student_id: submission.student_id,
      report_link: submission.report_link,
      submitted_at: formatDate(submission.submitted_at),
    }));

    return res.status(200).json({
      teachers: formatArray(teachers, "created_at"),
      students: formatArray(students, "created_at"),
      projects: formattedProjects,
      submissions: formattedSubmissions,
      totalProjects,
      totalSubmissions,
      latestProjects: formattedLatestProjects,
      latestSubmissions: formattedLatestSubmissions,
    });
  } catch (error) {
    console.error("Lỗi lấy tổng quan admin:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy dữ liệu",
    });
  }
};

export const getUsersManagement = async (req: Request, res: Response) => {
  try {
    const [users, admins, teachers, students] = await Promise.all([
      User.findAll({ order: [["id", "ASC"]] }),
      User.findAll({
        where: { role: "admin" },
        order: [["id", "ASC"]],
      }),
      User.findAll({
        where: { role: "teacher" },
        order: [["id", "ASC"]],
      }),
      User.findAll({
        where: { role: "student" },
        order: [["id", "ASC"]],
      }),
    ]);

    return res.status(200).json({
      users,
      admins,
      teachers,
      students,
    });
  } catch (error) {
    console.error("Lỗi lấy quản lý người dùng:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy dữ liệu",
    });
  }
};

export const getLogsOverview = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 10, 1),
      50
    );
    const offset = (page - 1) * limit;

    const { count, rows: logs } = await Log.findAndCountAll({
      distinct: true,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name", "email"],
        },
      ],
      limit,
      offset,
    });

    return res.status(200).json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalLogs: count,
        logsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy logs:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy dữ liệu logs",
    });
  }
};
