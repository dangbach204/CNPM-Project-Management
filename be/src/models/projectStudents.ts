import { DataTypes as ProjectStudentsDataTypes } from "sequelize";
import db from "../config/db";

const ProjectStudents = db.define(
  "ProjectStudents",
  {
    id: {
      type: ProjectStudentsDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_id: {
      type: ProjectStudentsDataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    student_id: {
      type: ProjectStudentsDataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    joined_at: {
      type: ProjectStudentsDataTypes.DATE,
      defaultValue: ProjectStudentsDataTypes.NOW,
    },
  },
  {
    tableName: "project_students",
    timestamps: false,
  }
);
export default ProjectStudents;
