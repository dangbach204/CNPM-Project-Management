import { DataTypes as ProjectDataTypes } from "sequelize";
import sequelizeDb from "../config/db";

const Project = sequelizeDb.define(
  "Project",
  {
    id: {
      type: ProjectDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: ProjectDataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: ProjectDataTypes.TEXT,
      allowNull: true,
    },
    teacher_id: {
      type: ProjectDataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    status: {
      type: ProjectDataTypes.STRING(50),
      defaultValue: "pending",
    },
    created_at: {
      type: ProjectDataTypes.DATE,
      defaultValue: ProjectDataTypes.NOW,
    },
  },
  {
    tableName: "projects",
    timestamps: false,
  }
);

export default Project;
