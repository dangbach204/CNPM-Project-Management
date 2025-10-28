import { DataTypes as ProjectStudentsDataTypes } from "sequelize";
import sequelizeDb from "../config/db";

const ProjectStudents = sequelizeDb.define(
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
      unique: true,
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
