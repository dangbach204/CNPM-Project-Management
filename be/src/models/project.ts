import { DataTypes as ProjectDataTypes } from "sequelize";
import db from "../config/db";

const Project = db.define(
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
      ondelete: "SET NULL",
    },
    status: {
      type: ProjectDataTypes.STRING(50),
      defaultValue: "open",
    },
    created_at: {
      type: ProjectDataTypes.DATE,
      defaultValue: ProjectDataTypes.NOW,
    },
    expire_at: {
      type: ProjectDataTypes.DATE,
      allowNull: true,
    },
    max_students: {
      type: ProjectDataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
    }
  },
  {
    tableName: "projects",
    timestamps: false,
  }
);

export default Project;
