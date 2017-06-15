require('dotenv').config();
const pgp = require('pg-promise')();

const envVars = process.env;

// TODO: Vaildation and default value

// DB
const username = envVars.DB_USERNAME;
const password = envVars.DB_PASSWORD;
const host =  envVars.DB_HOST;
const port =  envVars.DB_PORT || 5432;
const dbName = envVars.DB_NAME;
const connString = `postgres://${username}:${password}@${host}:${port}/${dbName}`;
const db = pgp(connString);

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db,
};

module.exports = config;

// db.query('select * from stock')
//   .then((d) => {
//     console.log(d);
//   })
//   .catch((e) => {
//     console.log(e);
//   });
