const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
      {
        user_id: 1,
        username: 'TU1',
        password: 'password',
      },
      {
        user_id: 2,
        username: 'TU2',
        password: 'password',
      },
      {
        user_id: 3,
        username: 'TU3',
        password: 'password',
      },
      {
        user_id: 4,
        username: 'TU4',
        password: 'password',
      },
    ]
  }

  /*function makeCaloriesArray() {
    return [
      {
        user_id: 1,
        calories: '1400'
      },
      {
        user_id: 2,
        calories: '2400'
      },
      {
        user_id: 3,
        calories: '0'
      },
      {
        user_id: 4,
        calories: '1000000000'
      }
    ]
  }*/
  
  function makeUsersFixtures() {
    const testUsers = makeUsersArray();
    return { testUsers }
  }

  /*function makeCaloriesFixtures() {
    const testCalories = makeCaloriesArray();
    return { testCalories }
  }*/
  
  function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE
          user_info
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE user_info_user_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('user_info_user_id_seq', 0)`),
        ])
      )
    )
  }
  
  function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('user_info').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('user_info_user_id_seq', ?)`,
          [users[users.length - 1].user_id],
        )
      )
  }

  /*function seedCalories(db, calories) {
    const preppedCalories = calories.map(calorie => ({
      ...calorie
    }))
    return db.into('calories').insert(preppedCalories)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('calories_user_id_seq', ?)`,
          [calories[calories.length - 1].user_id],
        )
      )
  }*/
  
  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
      const token = jwt.sign({ user_id: user.user_id }, secret, {
        subject: user.username,
        algorithm: 'HS256',
      })
      return `Bearer ${token}`
  }
    
  module.exports = {
    makeUsersArray,
    //makeCaloriesArray,
    makeUsersFixtures,
    //makeCaloriesFixtures,
    cleanTables,
    seedUsers,
    //seedCalories,
    makeAuthHeader
  }