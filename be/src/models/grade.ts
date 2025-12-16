import { DataTypes as GradeDataTypes } from 'sequelize';
import db from '../config/db';

const Grade = db.define(
  'Grade',
  {
    id: { 
      type: GradeDataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    submission_id: { 
      type: GradeDataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'submissions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    teacher_id: { 
      type: GradeDataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    score: { 
      type: GradeDataTypes.DECIMAL(5, 2), 
      allowNull: true 
    },
    feedback: { 
      type: GradeDataTypes.TEXT, 
      allowNull: true 
    },
    created_at: {
      type: GradeDataTypes.DATE,
      defaultValue: GradeDataTypes.NOW
    }
  },
  {
    tableName: 'grades',
    timestamps: false,
  }
);

export default Grade;