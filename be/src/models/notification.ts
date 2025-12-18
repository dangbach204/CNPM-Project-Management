import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface NotificationAttributes {
  id: number;
  recipientId: number;
  actorId: number;
  type:
    | "user_created"
    | "user_updated"
    | "project_updated"
    | "grade_submitted"
    | "added_to_project"
    | "submission_received";
  entityId: number;
  entityName: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, "id" | "isRead"> {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public recipientId!: number;
  public actorId!: number;
  public type!:
    | "user_created"
    | "user_updated"
    | "project_updated"
    | "grade_submitted"
    | "added_to_project"
    | "submission_received";
  public entityId!: number;
  public entityName!: string;
  public message!: string;
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "recipient_id",
    },
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "actor_id",
    },
    type: {
      type: DataTypes.ENUM(
        "user_created",
        "user_updated",
        "project_updated",
        "grade_submitted",
        "added_to_project",
        "submission_received"
      ),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "entity_id",
    },
    entityName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "entity_name",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_read",
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true,
    underscored: true,
  }
);

export default Notification;
