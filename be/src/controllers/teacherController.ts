import { Request, Response } from "express";
import { Project, ProjectStudents, Submission, User } from "../models";

export const getTeacherOverview = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    console.log("teacherId:", teacherId);

    const [totalProjects, projects, submissions, totalSubmissions] =
      await Promise.all([
        Project.count({
          where: { teacher_id: teacherId },
        }),

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
      ]);

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
        teacherId: projectData.teacher_id ?? teacherId,
        status: projectData.status,
        createdAt: projectData.created_at,
        expiredAt: projectData.expire_at,
        studentCount: students.length,
        students,
      };
    });

    const formattedSubmissions = submissions.map((sub: any) => {
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

    return res.status(200).json({
      totalProjects,
      projects: formattedProjects,
      submissions: formattedSubmissions,
      totalSubmissions,
    });
  } catch (error) {
    console.error("Lỗi lấy tổng quan giáo viên:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy tổng quan giáo viên",
    });
  }
};
