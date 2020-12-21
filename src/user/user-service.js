const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UserService = {
    getUser(knex) {
        return knex
            .select('*')
            .from('user_info');
    },

    hasUserWithUsername(db, username) {
        return db('user_info')
          .where({ username })
          .first()
          .then(user => !!user)
    },

    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },

    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('user_info')
            .returning('*')
            .then(([user]) => user)
    },

    validatePassword(password) {
        if (password.length < 8) {
          return 'password must be at least 8 characters'
        }
        if (password.length > 72) {
          return 'password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
          return 'password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
          return 'password must contain one upper case, lower case, number and special character'
        }
        return null
    },

    getById(knex, id) {
        return knex
            .from('user_info')
            .select('*')
            .where('user_id', id)
            .first();
    },

    deleteUser(knex, id) {
        return knex('user_info')
            .where('user_id', id)
            .delete();
    },

    updateUser(knex, id, user) {
        return knex('user_info')
            .where('user_id', id)
            .update(user);
    }
};

module.exports = UserService;