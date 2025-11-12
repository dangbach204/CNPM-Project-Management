import { DataTypes } from 'sequelize';
import db from '../config/db';

const User = db.define(
  'User',
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    full_name: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING(100), 
      allowNull: false, 
      unique: true 
    },
    password_hash: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    role: { 
      type: DataTypes.ENUM('admin', 'teacher', 'student'), 
      allowNull: false 
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'users',
    timestamps: false,
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);
export default User;