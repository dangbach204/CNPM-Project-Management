import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import {
  User,
  Project,
  Submission,
  ProjectStudents,
  Log,
} from "../models/index";
import { toISOStringOrNull } from "../utils/formatDate";

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
        order: [["id", "ASC"]],
      }),
      User.findAll({
        where: { role: "student" },
        attributes: ["id", "email", "full_name", "created_at", "avatar"],
        order: [["id", "ASC"]],
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
          "expire_at",
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
        attributes: [
          "id",
          "title",
          "description",
          "created_at",
          "status",
          "expire_at",
        ],
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

    const now = new Date();
    const allProjectsToCheck = [...projects, ...latestProjects];
    const uniqueProjects = Array.from(
      new Set(allProjectsToCheck.map((p: any) => p.id))
    ).map((id) => allProjectsToCheck.find((p: any) => p.id === id));

    for (const project of uniqueProjects) {
      if (project) {
        const projectData = project.toJSON() as any;
        if (
          projectData.expire_at &&
          new Date(projectData.expire_at) < now &&
          projectData.status !== "expired"
        ) {
          await project.update({ status: "expired" });
        }
      }
    }

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

    const formatArray = (arr: any[], dateField: string) =>
      arr.map((item) => ({
        ...item.toJSON(),
        [dateField]: toISOStringOrNull(item[dateField]),
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
        submitted_at: toISOStringOrNull(submission.submitted_at),
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
      submitted_at: toISOStringOrNull(submission.submitted_at),
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
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 15, 1),
      100
    );
    const offset = (page - 1) * limit;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const whereClause: any = {};
    if (role && role !== "all") {
      whereClause.role = role;
    }
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count: totalUsers, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [["id", "ASC"]],
      limit,
      offset,
    });

    const [totalAdmins, totalTeachers, totalStudents] = await Promise.all([
      User.count({ where: { role: "admin" } }),
      User.count({ where: { role: "teacher" } }),
      User.count({ where: { role: "student" } }),
    ]);

    return res.status(200).json({
      users,
      totalUsers,
      totalAdmins,
      totalTeachers,
      totalStudents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalItems: totalUsers,
        itemsPerPage: limit,
      },
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
