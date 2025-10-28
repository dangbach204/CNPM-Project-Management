import Project from "./project";

import { DataTypes as SubmissionDataTypes } from "sequelize";
import sequelizeInstance from "../config/db";

const Submission = sequelizeInstance.define(
  "Submission",
  {
    id: {
      type: SubmissionDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_id: {
      type: SubmissionDataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    student_id: {
      type: SubmissionDataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    report_link: {
      type: SubmissionDataTypes.TEXT,
      allowNull: true,
    },
    submitted_at: {
      type: SubmissionDataTypes.DATE,
      defaultValue: SubmissionDataTypes.NOW,
    },
  },
  {
    tableName: "submissions",
    timestamps: false,
  }
);

Submission.belongsTo(Project, { foreignKey: "project_id", as: "project" });
Project.hasMany(Submission, { foreignKey: "project_id", as: "submissions" });

export default Submission;
