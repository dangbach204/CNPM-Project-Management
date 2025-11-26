import Comments from "./feedback";
import Grade from "./grade";
import Log from "./log";
import PasswordRestTokens from "./passwordResetTokens";
import Project from "./project";
import ProjectStudents from "./projectStudents";
import Submission from "./submission";
import User from "./user";

User.hasMany(Project, { foreignKey: "teacher_id", as: "taughtProjects" });
User.belongsToMany(Project, {
  through: ProjectStudents,
  foreignKey: "student_id",
  otherKey: "project_id",
  as: "joinedProjects",
});
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

User.hasMany(PasswordRestTokens, {foreignKey: "user_id"});

Project.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
Project.belongsToMany(User, {
  through: ProjectStudents,
  foreignKey: "project_id",
  otherKey: "student_id",
  as: "students",
});
Project.hasMany(Submission, {
  foreignKey: "project_id",
  as: "projectSubmissions",
  ondelete: "CASCADE",
});
Project.hasMany(Comments, {
  foreignKey: "project_id",
  as: "projectComments",
  ondelete: "CASCADE",
});
Project.hasMany(ProjectStudents, {
  foreignKey: "project_id",
  as: "projectStudents",
  ondelete: "CASCADE",
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

PasswordRestTokens.belongsTo(User, {foreignKey: "user_id"});

export { User, Project, Submission, Grade, Comments, Log, ProjectStudents, PasswordRestTokens };