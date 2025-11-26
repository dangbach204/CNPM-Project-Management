import { DataTypes as LogDataTypes } from "sequelize";
import db from "../config/db";

const Log = db.define(
  "Log",
  {
    id: {
      type: LogDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: LogDataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
      comment:
        "ID của user thực hiện hành động, null nếu là hành động hệ thống",
    },
    action: {
      type: LogDataTypes.STRING(100),
      allowNull: false,
      comment:
        "Loại hành động: LOGIN, LOGOUT, CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT, ADD_STUDENT, REMOVE_STUDENT, SUBMIT_ASSIGNMENT, GRADE_SUBMISSION, etc.",
    },
    entity_type: {
      type: LogDataTypes.STRING(50),
      allowNull: true,
      comment:
        "Loại đối tượng bị tác động: User, Project, Submission, Grade, etc.",
    },
    entity_id: {
      type: LogDataTypes.INTEGER,
      allowNull: true,
      comment: "ID của đối tượng bị tác động",
    },
    details: {
      type: LogDataTypes.JSON,
      allowNull: true,
      comment: "Thông tin chi tiết về hành động dưới dạng JSON",
    },
    ip_address: {
      type: LogDataTypes.STRING(45),
      allowNull: true,
      comment: "Địa chỉ IP của người thực hiện (hỗ trợ IPv6)",
    },
    created_at: {
      type: LogDataTypes.DATE,
      defaultValue: LogDataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "logs",
    timestamps: false,
  }
);

export default Log;
