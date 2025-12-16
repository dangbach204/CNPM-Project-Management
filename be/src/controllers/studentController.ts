import { Request, Response } from "express";
import { Grade, Project, ProjectStudents, Submission, User } from "../models";
import user from "../models/user";

export const getStundentOverview = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    const [myProject, mySubmissions] = await Promise.all([
      ProjectStudents.findAll({
        where: {
          student_id: studentId,
        },

        include: [
          {
            model: Project,
            as: "joinedProject",
            attributes: ["id", "title", "description"],
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
          },
        ],
      }),
    ]);

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

    const formattedMyProject = myProject.map((myProject: any) => {
      return {
        projectId: myProject.joinedProject.id,
        title: myProject.joinedProject.title,
        description: myProject.joinedProject.description,
        joinedAt: formatDate(myProject.joined_at),
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
        submittedAt: formatDate(submission.submitted_at),
        reportLink: submission.report_link,
        grade:
          submission.grades.length > 0
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
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy tổng quan sinh viên",
      error: error.message,
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
          attributes: ["id", "title", "description", "expire_at"],
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

    const existingEntry = await ProjectStudents.findOne({
      where: {
        student_id: studentId,
      },
    });

    const joinedProject = await Project.findOne({
      where: {
        id: existingEntry?.project_id || null,
      },
      attributes: ["title", "description"],
    });

    if (existingEntry) {
      return res.status(400).json({
        message: "Student already joined another project",
        joinedProject,
      });
    }

    await ProjectStudents.create({
      student_id: studentId,
      project_id: projectId,
      joined_at: new Date(),
    });
    return res.status(200).json({
      message: "Successfully joined the project",
    });
  } catch (error: any) {
    console.error("Error joining project:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi tham gia đề tài",
      error: error.message,
    });
  }
};

export const submitProject = async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  const { projectId } = req.params;
  const { reportLink } = req.body;

  try {
    const submission = await Submission.create({
      project_id: projectId,
      student_id: studentId,
      report_link: reportLink,
      submitted_at: new Date(),
    });

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
        expireAt: project.expire_at,
      };
    });

    return res.status(200).json(formattedProjects);
  } catch (error: any) {
    console.error("Error fetching all projects:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy tất cả đề tài",
      error: error.message,
    });
  }
};

// export const studentLeaveProject = async (req: Request, res: Response) => {
//   try {
//     const studentId = req.user?.id;
//     const { projectId } = req.params;

//     if (!studentId) {
//       return res.status(401).json({
//         message: "Unauthorized: Student ID not found",
//       });
//     }

//     const projectEntry = await ProjectStudents.findOne({
//       where: {
//         student_id: studentId,
//         project_id: projectId,
//       },
//     });

//     if (!projectEntry) {
//       return res.status(404).json({
//         message: "Bạn chưa tham gia đề tài này",
//       });
//     }

//     await projectEntry.destroy();

//     return res.status(200).json({
//       message: "Rời khỏi đề tài thành công",
//     });
//   } catch (error: any) {
//     console.error("Error leaving project:", error);
//     return res.status(500).json({
//       message: "Lỗi máy chủ khi rời khỏi đề tài",
//       error: error.message,
//     });
//   }
// };

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
              gradedAt: submission.grades[0].graded_at,
            }
          : null,
    }));

    return res.status(200).json({
      message: "Successfully fetched submissions",
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
