import { DataTypes as LogDataTypes } from 'sequelize';
import sequelizeConn from '../config/db';

const Log = sequelizeConn.define(
  'Log',
  {
    id: { 
      type: LogDataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    user_id: { 
      type: LogDataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    action: { 
      type: LogDataTypes.TEXT, 
      allowNull: true 
    },
    created_at: {
      type: LogDataTypes.DATE,
      defaultValue: LogDataTypes.NOW
    }
  },
  {
    tableName: 'logs',
    timestamps: false,
  }
);

export default Log;