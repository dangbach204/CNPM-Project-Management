import Comments from "./comment";
import Grade from "./grade";
import Log from "./log";
import Project from "./project";
import ProjectStudents from "./projectStudents";
import Submission from "./submission";
import User from "./user";

User.hasMany(Project, { foreignKey: "teacher_id", as: "taughtProjects" });
User.hasMany(Project, { foreignKey: "student_id", as: "studentProjects" });
User.hasMany(Submission, {
  foreignKey: "student_id",
  as: "studentSubmissions",
});
User.hasMany(Grade, { foreignKey: "teacher_id", as: "gradedSubmissions" });
User.hasMany(Comments, { foreignKey: "user_id", as: "comments" });
User.hasMany(Log, { foreignKey: "user_id", as: "logs" });
User.hasMany(ProjectStudents, {
  foreignKey: "student_id",
  as: "projectMemberships",
});

Project.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
Project.belongsTo(User, { foreignKey: "student_id", as: "student" });
Project.hasMany(Submission, {
  foreignKey: "project_id",
  as: "projectSubmissions",
});
Project.hasMany(Comments, { foreignKey: "project_id", as: "projectComments" });
Project.hasMany(ProjectStudents, {
  foreignKey: "project_id",
  as: "projectStudents",
});

Submission.belongsTo(Project, {
  foreignKey: "project_id",
  as: "submissionProject",
});
Submission.belongsTo(User, { foreignKey: "student_id", as: "student" });
Submission.hasMany(Grade, { foreignKey: "submission_id", as: "grades" });

Grade.belongsTo(Submission, { foreignKey: "submission_id", as: "submission" });
Grade.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });

Comments.belongsTo(Project, { foreignKey: "project_id", as: "commentProject" });
Comments.belongsTo(User, { foreignKey: "user_id", as: "user" });

Log.belongsTo(User, { foreignKey: "user_id", as: "user" });

ProjectStudents.belongsTo(Project, {
  foreignKey: "project_id",
  as: "joinedProject",
});
ProjectStudents.belongsTo(User, { foreignKey: "student_id", as: "student" });

export { User, Project, Submission, Grade, Comments, Log, ProjectStudents };
