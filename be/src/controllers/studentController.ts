import { Request, Response } from "express";
import { Grade, Project, ProjectStudents, Submission, User } from "../models";
import user from "../models/user";
import { toISOStringOrNull } from "../utils/formatDate";
import { notifyTeacher } from "./notificationController";

export const getStundentOverview = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    const [myProject, mySubmissions] = await Promise.all([
      ProjectStudents.findAll({
        where: {
          student_id: studentId,
        },
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
        where: {
          student_id: studentId,
        },
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

    const formattedMyProject = myProject.map((myProject: any) => {
      return {
        projectId: myProject.joinedProject.id,
        title: myProject.joinedProject.title,
        description: myProject.joinedProject.description,
        joinedAt: toISOStringOrNull(myProject.joined_at),
      };
    });

    const formattedMySubmissions = mySubmissions.map((submission: any) => {
      const projectInfo = myProject.find(
        (p: any) => p.project_id === submission.project_id
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

    return res.status(200).json({
      myProject: formattedMyProject,
      mySubmissions: formattedMySubmissions,
    });
  } catch (error: any) {
    console.error("Error fetching student overview:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy tổng quan sinh viên",
      error: error.message,
      details: error.stack,
    });
  }
};

export const getMyProject = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        message: "Unauthorized: Student ID not found",
      });
    }

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
      return res.status(200).json({
        message: "Student has not joined any project yet",
        project: null,
      });
    }

    const { joinedProject } = projectEntry;

    return res.status(200).json({
      message: "Successfully fetched student project",
      project: {
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
      },
    });
  } catch (error) {
    console.error("Error fetching student project:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy đề tài của sinh viên",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const studentJoinProject = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { projectId } = req.params;

    if (!studentId || !projectId) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const existingEntry = await ProjectStudents.findOne({
      where: { student_id: studentId },
      include: [
        {
          model: Project,
          as: "joinedProject",
          attributes: ["id", "title", "description"],
        },
      ],
    });

    if (existingEntry) {
      return res.status(400).json({
        message: "Sinh viên đã tham gia một đề tài khác",
        joinedProject: existingEntry.joinedProject,
      });
    }

    const project = await Project.findByPk(projectId, {
      attributes: ["id", "max_students"],
    });

    if (!project) {
      return res.status(404).json({
        message: "Đề tài không tồn tại",
      });
    }

    const currentCount = await ProjectStudents.count({
      where: { project_id: projectId },
    });

    if (currentCount >= project.max_students) {
      return res.status(400).json({
        message: "Đề tài đã đủ số lượng sinh viên",
      });
    }

    await ProjectStudents.create({
      student_id: studentId,
      project_id: projectId,
      joined_at: new Date(),
    });

    return res.status(200).json({
      message: "Tham gia đề tài thành công",
    });
  } catch (error: any) {
    console.error("Error joining project:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi tham gia đề tài",
    });
  }
};

export const submitProject = async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  const { projectId } = req.params;
  const { reportLink } = req.body;

  try {
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
      return res.status(404).json({
        message: "Project không tồn tại",
      });
    }

    const submission = await Submission.create({
      project_id: projectId,
      student_id: studentId,
      report_link: reportLink,
      submitted_at: new Date(),
    });

    if (project.teacher_id && studentId) {
      const student = await User.findByPk(studentId, {
        attributes: ["full_name"],
      });

      const studentName = student?.full_name || "Sinh viên";

      await notifyTeacher(
        project.teacher_id,
        studentId,
        "submission_received",
        Number(projectId),
        project.title,
        `Sinh viên ${studentName} đã nộp báo cáo cho dự án "${project.title}"`
      );
    } else {
      console.log("Teacher or student ID is missing, skipping notification.");
    }

    return res.status(201).json({
      message: "Nộp báo cáo thành công",
      submission,
    });
  } catch (error: any) {
    console.error("Error submitting project:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi nộp báo cáo",
      error: error.message,
    });
  }
};

export const studentGetProjects = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    const projects = await Project.findAll({
      include: [
        {
          model: ProjectStudents,
          as: "projectStudents",
        },
        {
          model: user,
          as: "teacher",
          attributes: ["id", "full_name"],
        },
        {
          model: user,
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
      ],
    });

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

    const myProjects = await ProjectStudents.findAll({
      where: {
        student_id: studentId,
      },
      attributes: ["project_id"],
    });

    const myProjectIds = myProjects.map((p: any) => p.project_id);

    return res.status(200).json({
      projects: formattedProjects,
      myProjectIds: myProjectIds,
    });
  } catch (error: any) {
    console.error("Error fetching all projects:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy tất cả đề tài",
      error: error.message,
    });
  }
};

export const getMySubmissions = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        message: "Unauthorized: Student ID not found",
      });
    }

    const submissions = await Submission.findAll({
      where: {
        student_id: studentId,
      },
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

    const submissionCount = submissions.length;

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

    return res.status(200).json({
      message: "Successfully fetched submissions",
      submissionCount,
      submissions: formattedSubmissions,
    });
  } catch (error: any) {
    console.error("Error fetching student submissions:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy danh sách bài nộp",
      error: error.message,
    });
  }
};
