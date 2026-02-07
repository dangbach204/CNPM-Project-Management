import { Op, fn, col } from "sequelize";
import {
  User,
  Project,
  Submission,
  ProjectStudents,
  Log,
} from "../models/index";
import { toISOStringOrNull } from "../utils/formatDate";

/**
 * Custom error class for service-layer errors with HTTP status codes
 */
export class ServiceError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public data?: any,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

/**
 * Admin Service - Business logic for admin operations
 */
export class AdminService {
  /**
   * Get admin dashboard overview
   */
  async getOverview() {
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
        include: [{ model: Project, as: "project", attributes: ["title"] }],
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
        include: [{ model: Project, as: "project", attributes: ["title"] }],
      }),
    ]);

    // Bulk update expired projects
    await this.updateExpiredProjects();

    // Get student counts per project
    const projectIds = projects.map((project: any) => project.id);
    const studentCountMap = await this.getStudentCountMap(projectIds);

    // Format data
    const formattedTeachers = this.formatArray(teachers, "created_at");
    const formattedStudents = this.formatArray(students, "created_at");

    const formattedLatestProjects = this.formatArray(
      latestProjects,
      "created_at",
    ).map((proj) => ({
      ...proj,
      student_count: studentCountMap[proj.id] || 0,
      teacher_instructor:
        teachers.find((t: any) => t.id === proj.teacher_id)?.full_name ||
        "chưa phân công",
    }));

    const formattedLatestSubmissions = latestSubmissions.map(
      (submission: any) => ({
        id: submission.id,
        project_id: submission.project_id,
        project_title: submission.project?.title || null,
        student_id: submission.student_id,
        report_link: submission.report_link,
        submitted_at: toISOStringOrNull(submission.submitted_at),
      }),
    );

    const formattedProjects = this.formatArray(projects, "created_at").map(
      (proj) => ({
        ...proj,
        teacher_instructor:
          teachers.find((t: any) => t.id === proj.teacher_id)?.full_name ||
          "chưa phân công",
        student_count: studentCountMap[proj.id] || 0,
      }),
    );

    const formattedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      project_id: submission.project_id,
      project_title: submission.project?.title || null,
      student_id: submission.student_id,
      report_link: submission.report_link,
      submitted_at: toISOStringOrNull(submission.submitted_at),
    }));

    return {
      teachers: formattedTeachers,
      students: formattedStudents,
      projects: formattedProjects,
      submissions: formattedSubmissions,
      totalProjects,
      totalSubmissions,
      latestProjects: formattedLatestProjects,
      latestSubmissions: formattedLatestSubmissions,
    };
  }

  /**
   * Get paginated users with filtering
   */
  async getUsersManagement(options: {
    page: number;
    limit: number;
    role?: string;
    search?: string;
  }) {
    const { page, limit, role, search } = options;
    const offset = (page - 1) * limit;

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

    return {
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
    };
  }

  /**
   * Get paginated logs
   */
  async getLogsOverview(options: { page: number; limit: number }) {
    const { page, limit } = options;
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

    return {
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalLogs: count,
        logsPerPage: limit,
      },
    };
  }

  // ============ HELPER METHODS ============

  private async updateExpiredProjects() {
    const now = new Date();
    await Project.update(
      { status: "expired" },
      {
        where: {
          expire_at: { [Op.lt]: now },
          status: { [Op.ne]: "expired" },
        },
      },
    );
  }

  private async getStudentCountMap(
    projectIds: number[],
  ): Promise<Record<number, number>> {
    if (projectIds.length === 0) return {};

    const studentCounts = await ProjectStudents.findAll({
      where: { project_id: { [Op.in]: projectIds } },
      attributes: [
        "project_id",
        [fn("COUNT", col("student_id")), "student_count"],
      ],
      group: ["project_id"],
      raw: true,
    });

    return Object.fromEntries(
      studentCounts.map((item: any) => [
        item.project_id,
        parseInt(item.student_count),
      ]),
    );
  }

  private formatArray(arr: any[], dateField: string) {
    return arr.map((item) => ({
      ...item.toJSON(),
      [dateField]: toISOStringOrNull(item[dateField]),
    }));
  }
}

// Export singleton instance
export const adminService = new AdminService();
