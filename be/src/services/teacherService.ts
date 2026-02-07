import { Op, Transaction } from "sequelize";
import { Grade, Project, ProjectStudents, Submission, User } from "../models";
import {
  toISOStringOrNull,
  isValidISODate,
  parseDate,
} from "../utils/formatDate";
import sequelize from "../config/db";

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
 * Teacher Service - Business logic for teacher operations
 */
export class TeacherService {
  /**
   * Get teacher dashboard overview
   */
  async getOverview(teacherId: number) {
    const [
      totalProjects,
      projects,
      submissions,
      totalSubmissions,
      allStudents,
    ] = await Promise.all([
      Project.count({ where: { teacher_id: teacherId } }),

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

    // Bulk update expired projects
    await this.updateExpiredProjects(projects.map((p: any) => p.id));

    const formattedProjects = this.formatProjects(projects, teacherId);
    const formattedSubmissions = this.formatSubmissions(submissions);

    // Get graded submission IDs
    const grades = await Grade.findAll({
      where: { submission_id: submissions.map((sub: any) => sub.id) },
      attributes: ["submission_id"],
    });

    const gradedSubmissionIds = new Set(
      grades.map((g: any) => g.submission_id),
    );
    const pendingSubmissions = formattedSubmissions.filter(
      (sub: any) => !gradedSubmissionIds.has(sub.id),
    );

    return {
      totalProjects,
      projects: formattedProjects,
      submissions: formattedSubmissions,
      totalSubmissions,
      pendingSubmissionsCount: pendingSubmissions.length,
      pendingSubmissions,
      allStudents,
    };
  }

  /**
   * Create a new project
   */
  async createProject(
    teacherId: number,
    data: { title: string; description?: string; expireAt?: string },
  ) {
    const { title, description, expireAt } = data;

    if (!title) {
      throw new ServiceError("Tiêu đề đề tài là bắt buộc", 400);
    }

    if (expireAt && !isValidISODate(expireAt)) {
      throw new ServiceError(
        "expireAt phải là chuỗi ISO-8601 hợp lệ (VD: 2024-01-15T10:30:00Z)",
        400,
      );
    }

    const parsedExpireAt = parseDate(expireAt);

    if (parsedExpireAt) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const expireDate = new Date(parsedExpireAt);
      expireDate.setHours(0, 0, 0, 0);

      if (expireDate < now) {
        throw new ServiceError("Ngày hết hạn phải sau ngày hiện tại", 400);
      }
    }

    const newProject = await Project.create({
      title,
      description,
      teacher_id: teacherId,
      ...(parsedExpireAt && { expire_at: parsedExpireAt }),
      status: "open",
    });

    return {
      id: newProject.id,
      title: newProject.title,
      description: newProject.description,
      expireAt: newProject.expire_at,
      createdAt: newProject.created_at,
    };
  }

  /**
   * Update project information with student management
   */
  async updateProject(
    projectId: number,
    teacherId: number,
    data: {
      title?: string;
      description?: string;
      status?: string;
      expiredAt?: string;
      addStudents?: number[];
      removeStudents?: number[];
    },
    transaction: Transaction,
  ): Promise<{
    project: any;
    actualChanges: any;
    addedStudents: number[];
    removedStudents: number[];
  }> {
    const {
      title,
      description,
      status,
      expiredAt,
      addStudents,
      removeStudents,
    } = data;

    // Validate at least one field
    if (
      !title &&
      !description &&
      !status &&
      !expiredAt &&
      !addStudents &&
      !removeStudents
    ) {
      throw new ServiceError("No fields to update", 400);
    }

    const project = await Project.findByPk(projectId, { transaction });
    if (!project) {
      throw new ServiceError("Project không tồn tại", 404);
    }

    if (project.teacher_id !== teacherId) {
      throw new ServiceError("Bạn không có quyền sửa project này", 403);
    }

    // Validate expiredAt format
    if (expiredAt && !isValidISODate(expiredAt)) {
      throw new ServiceError(
        "expiredAt phải là chuỗi ISO-8601 hợp lệ (VD: 2024-01-15T10:30:00Z)",
        400,
      );
    }

    // Validate expiredAt is after creation date
    if (expiredAt) {
      const projectData = project.toJSON() as any;
      const createdAt = new Date(projectData.created_at);
      createdAt.setHours(0, 0, 0, 0);
      const expireDate = new Date(expiredAt);
      expireDate.setHours(0, 0, 0, 0);

      if (expireDate < createdAt) {
        throw new ServiceError("Ngày hết hạn phải sau ngày tạo đề tài", 400);
      }
    }

    // Track old values for change detection
    const oldValues = {
      title: project.title,
      description: project.description,
      status: project.status,
      expiredAt: project.expire_at,
    };

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (expiredAt !== undefined) updateData.expire_at = expiredAt;

    // Track actual changes
    const actualChanges: any = {};
    if (title !== undefined && title !== oldValues.title)
      actualChanges.title = title;
    if (description !== undefined && description !== oldValues.description)
      actualChanges.description = description;
    if (status !== undefined && status !== oldValues.status)
      actualChanges.status = status;

    // Compare dates (only date part)
    if (expiredAt !== undefined && oldValues.expiredAt) {
      const newDateOnly = new Date(expiredAt).toISOString().split("T")[0];
      const oldDateOnly = new Date(oldValues.expiredAt)
        .toISOString()
        .split("T")[0];
      if (newDateOnly !== oldDateOnly) {
        actualChanges.expiredAt = expiredAt;
      }
    } else if (expiredAt !== undefined && !oldValues.expiredAt) {
      actualChanges.expiredAt = expiredAt;
    }

    // Update project fields
    if (Object.keys(updateData).length > 0) {
      await project.update(updateData, { transaction });
    }

    // Handle student additions
    const addedStudents: number[] = [];
    if (addStudents && Array.isArray(addStudents) && addStudents.length > 0) {
      await this.validateAndAddStudents(
        projectId,
        addStudents,
        removeStudents,
        transaction,
      );
      addedStudents.push(...addStudents);
    }

    // Handle student removals
    const removedStudents: number[] = [];
    if (
      removeStudents &&
      Array.isArray(removeStudents) &&
      removeStudents.length > 0
    ) {
      await ProjectStudents.destroy({
        where: { project_id: projectId, student_id: removeStudents },
        transaction,
      });
      removedStudents.push(...removeStudents);
    }

    return {
      project,
      actualChanges,
      addedStudents,
      removedStudents,
    };
  }

  /**
   * Validate and add students to project
   */
  private async validateAndAddStudents(
    projectId: number,
    addStudents: number[],
    removeStudents: number[] | undefined,
    transaction: Transaction,
  ) {
    const currentStudentCount = await ProjectStudents.count({
      where: { project_id: projectId },
      transaction,
    });

    const project = await Project.findByPk(projectId, { transaction });
    const projectData = project?.toJSON() as any;
    const maxStudents = projectData?.max_students || 4;

    const removeCount = removeStudents?.length || 0;
    const finalStudentCount =
      currentStudentCount - removeCount + addStudents.length;

    if (finalStudentCount > maxStudents) {
      throw new ServiceError(
        `Không thể thêm sinh viên. Dự án đã đạt số lượng tối đa ${maxStudents} sinh viên.`,
        400,
      );
    }

    // Bulk validate students
    const validStudents = await User.findAll({
      where: { id: { [Op.in]: addStudents }, role: "student" },
      attributes: ["id"],
      transaction,
    });

    const validStudentIds = new Set(validStudents.map((s: any) => s.id));
    for (const studentId of addStudents) {
      if (!validStudentIds.has(studentId)) {
        throw new ServiceError(
          `Sinh viên với ID ${studentId} không hợp lệ`,
          400,
        );
      }
    }

    // Check existing memberships
    const existingMemberships = await ProjectStudents.findAll({
      where: { student_id: { [Op.in]: addStudents } },
      attributes: ["student_id"],
      transaction,
    });

    if (existingMemberships.length > 0) {
      const conflictingId = existingMemberships[0].student_id;
      throw new ServiceError(
        `Sinh viên với ID ${conflictingId} đã tham gia project khác`,
        400,
      );
    }

    // Bulk create
    const projectStudentsData = addStudents.map((studentId) => ({
      project_id: projectId,
      student_id: studentId,
    }));
    await ProjectStudents.bulkCreate(projectStudentsData, { transaction });
  }

  /**
   * Delete a project and all related data
   */
  async deleteProject(projectId: number, teacherId: number) {
    const transaction = await sequelize.transaction();

    try {
      const project = await Project.findByPk(projectId, { transaction });

      if (!project) {
        await transaction.rollback();
        throw new ServiceError("Project không tồn tại", 404);
      }

      const projectData = project.toJSON() as any;

      if (projectData.teacher_id !== teacherId) {
        await transaction.rollback();
        throw new ServiceError("Bạn không có quyền xóa project này", 403);
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

      await transaction.commit();

      return projectData;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get all submissions for teacher's projects
   */
  async getSubmissions(teacherId: number) {
    const [submissions, totalSubmissions] = await Promise.all([
      Submission.findAll({
        include: [
          {
            model: Project,
            as: "submissionProject",
            where: { teacher_id: teacherId },
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
            where: { teacher_id: teacherId },
          },
        ],
      }),
    ]);

    const formattedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      projectTitle: submission.submissionProject?.title,
      studentName: submission.student?.full_name,
      studentEmail: submission.student?.email,
      submittedAt: toISOStringOrNull(submission.submitted_at),
      reportLink: submission.report_link,
      score: submission.grades?.[0]?.score ?? null,
      feedback: submission.grades?.[0]?.feedback ?? "",
    }));

    return { totalSubmissions, submissions: formattedSubmissions };
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(
    submissionId: number,
    teacherId: number,
    data: { score: number | string; feedback?: string },
  ): Promise<{ grade: any; submission: any; teacherName: string }> {
    const { score, feedback } = data;

    if (score === undefined || score === null) {
      throw new ServiceError("Score is required", 400);
    }

    const numericScore = typeof score === "string" ? parseFloat(score) : score;

    if (
      typeof numericScore !== "number" ||
      isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 10
    ) {
      throw new ServiceError("Invalid score", 400);
    }

    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      throw new ServiceError("Submission not found", 404);
    }

    let grade = await Grade.findOne({ where: { submission_id: submissionId } });

    if (!grade) {
      grade = await Grade.create({
        teacher_id: teacherId,
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
        { model: Project, as: "submissionProject", attributes: ["title"] },
      ],
    });

    const teacher = await User.findByPk(teacherId, {
      attributes: ["full_name"],
    });

    return {
      grade: {
        id: grade.id,
        submissionId: grade.submission_id,
        score: grade.score,
        feedback: grade.feedback,
      },
      submission: submissionData,
      teacherName: teacher?.full_name || "Giáo viên",
    };
  }

  /**
   * Get project with full details
   */
  async getProjectWithDetails(projectId: number) {
    const project = await Project.findByPk(projectId, {
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

    if (!project) return null;

    const projectData = project.toJSON() as any;
    const students =
      projectData.projectStudents?.map((ps: any) => ({
        id: ps.student?.id,
        fullName: ps.student?.full_name,
        email: ps.student?.email,
        avatar: ps.student?.avatar,
      })) || [];

    return {
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
    };
  }

  /**
   * Get students assigned to a project
   */
  async getProjectStudents(projectId: number) {
    return ProjectStudents.findAll({
      where: { project_id: projectId },
      attributes: ["student_id"],
    });
  }

  // ============ HELPER METHODS ============

  private async updateExpiredProjects(projectIds: number[]) {
    if (projectIds.length === 0) return;

    const now = new Date();
    await Project.update(
      { status: "expired" },
      {
        where: {
          id: { [Op.in]: projectIds },
          expire_at: { [Op.lt]: now },
          status: { [Op.ne]: "expired" },
        },
      },
    );
  }

  private formatProjects(projects: any[], teacherId: number) {
    return projects.map((project: any) => {
      const projectData = project.toJSON();
      const students =
        projectData?.projectStudents?.map((ps: any) => ({
          id: ps.student?.id,
          fullName: ps.student?.full_name,
          email: ps.student?.email,
          avatar: ps.student?.avatar,
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
  }

  private formatSubmissions(submissions: any[]) {
    return submissions.map((sub: any) => {
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
  }
}

// Export singleton instance
export const teacherService = new TeacherService();
