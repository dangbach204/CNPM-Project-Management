import { DataTypes } from "sequelize";
import db from "../config/db";

const PasswordResetTokens = db.define(
  "PasswordResetTokens",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    token_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expire_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "password_reset_tokens",
    timestamps: false,
  }
);

export default PasswordResetTokens;
