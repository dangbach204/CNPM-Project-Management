const { Sequelize } = require("sequelize");
require("dotenv").config();
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    timezone: "+07:00",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      useUTC: false,
      dateStrings: true,
      typeCast: true,
    },
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err: Error) => {
    console.error("Unable to connect to the database:", err);
  });
// sequelize
//     .sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch((err) => {
//         console.error('Unable to create the database & tables:', err);
//     });
export default sequelize;
