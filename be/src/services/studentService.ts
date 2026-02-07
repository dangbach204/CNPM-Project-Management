import { Op, Transaction } from "sequelize";
import { Grade, Project, ProjectStudents, Submission, User } from "../models";
import { toISOStringOrNull } from "../utils/formatDate";
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
 * Student Service - Business logic for student operations
 */
export class StudentService {
  /**
   * Get student overview: joined projects and submissions
   */
  async getOverview(studentId: number) {
    const [myProject, mySubmissions] = await Promise.all([
      ProjectStudents.findAll({
        where: { student_id: studentId },
        include: [
          {
            model: Project,
            as: "joinedProject",
            attributes: ["id", "title", "description", "status"],
            required: false,
          },
        ],
      }),
      Submission.findAll({
        where: { student_id: studentId },
        include: [
          {
            model: Grade,
            as: "grades",
            attributes: ["score", "feedback"],
            required: false,
          },
        ],
      }),
    ]);

    const formattedMyProject = myProject.map((entry: any) => ({
      projectId: entry.joinedProject.id,
      title: entry.joinedProject.title,
      description: entry.joinedProject.description,
      joinedAt: toISOStringOrNull(entry.joined_at),
    }));

    const formattedMySubmissions = mySubmissions.map((submission: any) => {
      const projectInfo = myProject.find(
        (p: any) => p.project_id === submission.project_id,
      );

      return {
        submissionId: submission.id,
        projectId: submission.project_id,
        title: projectInfo?.joinedProject?.title || "N/A",
        description: projectInfo?.joinedProject?.description || "N/A",
        submittedAt: toISOStringOrNull(submission.submitted_at),
        reportLink: submission.report_link,
        grade:
          submission.grades && submission.grades.length > 0
            ? {
                score: submission.grades[0].score,
                feedback: submission.grades[0].feedback,
              }
            : null,
      };
    });

    return {
      myProject: formattedMyProject,
      mySubmissions: formattedMySubmissions,
    };
  }

  /**
   * Get the project a student has joined
   */
  async getMyProject(studentId: number) {
    const projectEntry = await ProjectStudents.findOne({
      where: { student_id: studentId },
      include: [
        {
          model: Project,
          as: "joinedProject",
          attributes: ["id", "title", "description", "status", "expire_at"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "full_name"],
            },
          ],
        },
      ],
    });

    if (!projectEntry) {
      return null;
    }

    const { joinedProject } = projectEntry;

    return {
      projectId: joinedProject.id,
      title: joinedProject.title,
      description: joinedProject.description,
      status: joinedProject.status,
      teacher: joinedProject.teacher
        ? {
            id: joinedProject.teacher.id,
            name: joinedProject.teacher.full_name,
          }
        : null,
      joinedAt: projectEntry.joined_at,
      expireAt: joinedProject.expire_at,
    };
  }

  /**
   * Join a project with proper concurrency control
   */
  async joinProject(studentId: number, projectId: number) {
    const transaction = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    });

    try {
      // Check if student already joined any project (with row lock)
      const existingEntry = await ProjectStudents.findOne({
        where: { student_id: studentId },
        include: [
          {
            model: Project,
            as: "joinedProject",
            attributes: ["id", "title", "description"],
          },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existingEntry) {
        await transaction.rollback();
        throw new ServiceError("Sinh viên đã tham gia một đề tài khác", 400, {
          joinedProject: existingEntry.joinedProject,
        });
      }

      // Lock the project row to prevent concurrent modifications
      const project = await Project.findByPk(projectId, {
        attributes: ["id", "max_students"],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!project) {
        await transaction.rollback();
        throw new ServiceError("Đề tài không tồn tại", 404);
      }

      // Count within the same transaction to ensure consistency
      const currentCount = await ProjectStudents.count({
        where: { project_id: projectId },
        transaction,
      });

      if (currentCount >= project.max_students) {
        await transaction.rollback();
        throw new ServiceError("Đề tài đã đủ số lượng sinh viên", 400);
      }

      await ProjectStudents.create(
        {
          student_id: studentId,
          project_id: projectId,
          joined_at: new Date(),
        },
        { transaction },
      );

      await transaction.commit();
      return { success: true };
    } catch (error) {
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          // Already rolled back
        }
      }
      throw error;
    }
  }

  /**
   * Submit a project report
   */
  async submitProject(
    studentId: number,
    projectId: number,
    reportLink: string,
  ): Promise<{ submission: any; project: any; studentName: string }> {
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "full_name"],
        },
      ],
    });

    if (!project) {
      throw new ServiceError("Project không tồn tại", 404);
    }

    const submission = await Submission.create({
      project_id: projectId,
      student_id: studentId,
      report_link: reportLink,
      submitted_at: new Date(),
    });

    const student = await User.findByPk(studentId, {
      attributes: ["full_name"],
    });

    return {
      submission,
      project,
      studentName: student?.full_name || "Sinh viên",
    };
  }

  /**
   * Get all projects for student view (with expired status update)
   */
  async getAllProjects(studentId: number) {
    const projects = await Project.findAll({
      include: [
        {
          model: ProjectStudents,
          as: "projectStudents",
        },
        {
          model: User,
          as: "teacher",
          attributes: ["id", "full_name"],
        },
        {
          model: User,
          as: "students",
          attributes: ["id", "full_name", "email"],
          through: { attributes: [] },
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "teacher_id",
        "max_students",
        "created_at",
        "expire_at",
        "status",
      ],
    });

    // Bulk update expired projects (instead of N+1)
    const now = new Date();
    const expiredProjectIds = projects
      .filter((p: any) => {
        const data = p.toJSON();
        return (
          data.expire_at &&
          new Date(data.expire_at) < now &&
          data.status !== "expired"
        );
      })
      .map((p: any) => p.id);

    if (expiredProjectIds.length > 0) {
      await Project.update(
        { status: "expired" },
        { where: { id: { [Op.in]: expiredProjectIds } } },
      );
    }

    const formattedProjects = projects.map((project: any) => {
      const currentStudentCount = project.projectStudents?.length || 0;
      const maxStudents = project.max_students || 4;

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        teacherId: project.teacher_id,
        teacherName: project.teacher?.full_name || null,
        studentCount: `${currentStudentCount}/${maxStudents}`,
        students: project.students || [],
        createdAt: project.created_at,
        expiredAt: project.expire_at,
      };
    });

    // Get student's joined projects
    const myProjects = await ProjectStudents.findAll({
      where: { student_id: studentId },
      attributes: ["project_id"],
    });

    const myProjectIds = myProjects.map((p: any) => p.project_id);

    return {
      projects: formattedProjects,
      myProjectIds,
    };
  }

  /**
   * Get all submissions for a student
   */
  async getMySubmissions(studentId: number) {
    const submissions = await Submission.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "title", "description"],
        },
        {
          model: Grade,
          as: "grades",
          attributes: ["id", "score", "feedback", "created_at"],
        },
      ],
      order: [["submitted_at", "DESC"]],
    });

    const formattedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      projectId: submission.project_id,
      projectTitle: submission.project?.title || null,
      projectDescription: submission.project?.description || null,
      reportLink: submission.report_link,
      submittedAt: submission.submitted_at,
      grade:
        submission.grades?.length > 0
          ? {
              id: submission.grades[0].id,
              score: submission.grades[0].score,
              feedback: submission.grades[0].feedback,
              gradedAt: submission.grades[0].created_at,
            }
          : null,
    }));

    return {
      submissionCount: submissions.length,
      submissions: formattedSubmissions,
    };
  }

  /**
   * Get available projects for students to join
   */
  async getAvailableProjects(studentId: number) {
    // Get student's current project if any
    const currentProject = await ProjectStudents.findOne({
      where: { student_id: studentId },
      attributes: ["project_id"],
    });

    const projects = await Project.findAll({
      where: { status: "open" },
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "full_name", "avatar"],
        },
        {
          model: ProjectStudents,
          as: "projectStudents",
          attributes: ["student_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return projects.map((project: any) => {
      const projectData = project.toJSON();
      const currentStudentCount = projectData.projectStudents?.length || 0;
      const isJoined = currentProject?.project_id === projectData.id;

      return {
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        status: projectData.status,
        expireAt: projectData.expire_at,
        maxStudents: projectData.max_students,
        currentStudentCount,
        isFull: currentStudentCount >= projectData.max_students,
        isJoined,
        teacher: projectData.teacher
          ? {
              id: projectData.teacher.id,
              name: projectData.teacher.full_name,
              avatar: projectData.teacher.avatar,
            }
          : null,
      };
    });
  }

  /**
   * Get submission history for a student
   */
  async getSubmissionHistory(studentId: number, projectId?: number) {
    const whereClause: any = { student_id: studentId };
    if (projectId) {
      whereClause.project_id = projectId;
    }

    const submissions = await Submission.findAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: "submissionProject",
          attributes: ["id", "title"],
        },
        {
          model: Grade,
          as: "grades",
          attributes: ["score", "feedback", "graded_at"],
          required: false,
        },
      ],
      order: [["submitted_at", "DESC"]],
    });

    return submissions.map((sub: any) => ({
      id: sub.id,
      projectId: sub.project_id,
      projectTitle: sub.submissionProject?.title,
      reportLink: sub.report_link,
      submittedAt: toISOStringOrNull(sub.submitted_at),
      grade: sub.grades?.[0]
        ? {
            score: sub.grades[0].score,
            feedback: sub.grades[0].feedback,
            gradedAt: toISOStringOrNull(sub.grades[0].graded_at),
          }
        : null,
    }));
  }
}

// Export singleton instance
export const studentService = new StudentService();
