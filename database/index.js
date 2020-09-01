/* eslint-disable camelcase */
const { Pool } = require('pg');
// Client?

const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: 'gametime',
  password: process.env.DB_PASS,
});

const getUserCommand = `
  SELECT users.*
  FROM users
  WHERE id = $1
`;

const getUserScoreCommand = `
  SELECT scores.*
  FROM scores
  WHERE id_user = $1
`;

const getUser = (id) => {
  let user;
  return pool.query(getUserCommand, [id])
    .then((res) => {
      [user] = res.rows;
      return pool.query(getUserScoreCommand, [user.id]);
    })
    .then((scores) => {
      user.scores = scores.rows;
      return user;
    })
    .catch((err) => { throw err; });
};

// async function getUser(id) {
//   console.log('ID: ', id);
//   let user = await pool.query(getUserCommand, [id]);
//   console.log('USER: ', user.rows);
//   const scores = await pool.query(getUserScoreCommand, [id]);
//   console.log('SCORES: ', scores.rows);
//   user = user.rows;
//   user.scores = scores.rows;
//   return user;
// }

const addUserCommand = `
  INSERT INTO users (id_discord, username, profile_photo_url, location, age)
  VALUES ($1, $2, $3, $4, $5);
`;

const getAddededUserCommand = `
  SELECT *
  FROM users
  WHERE id_discord = $1
`;

async function addUser(userObj) {
  const {
    id_discord, username, profile_photo_url, location, age,
  } = userObj;
  await pool.query(addUserCommand, [id_discord, username, profile_photo_url, location, age]);
  let addedUser = await pool.query(getAddededUserCommand, [id_discord]);
  addedUser = addedUser.rows;
  addedUser[0].scores = [];
  return addedUser;
}

// const postUser = (userObj) => {
//   const {
//     id_discord, username, profile_photo_url, location, age,
//   } = userObj;
//   return pool.query(postUserCommand, [id_discord, username, profile_photo_url, location, age])
//     .catch((err) => { throw err; });
// };

module.exports = {
  getUser,
  addUser,
};
