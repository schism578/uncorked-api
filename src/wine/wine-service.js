const wineService = {
    getWine(knex) {
        return knex
            .select('*')
            .from('wine');
    },

    insertWine(knex, newWine) {
        return knex
            .insert(newWine)
            .into('wine')
            .returning('*')
            .then(rows => rows[0]);
    },

    getById(knex, id) {
        return knex
            .from('wine')
            .select('*')
            .where('wine_id', id)
            .first();
    },

    deleteWine(knex, id) {
        return knex('wine')
            .where('wine_id', id)
            .delete();
    },

    updateWine(knex, id, newWine) {
        return knex('wine')
            .where('wine_id', id)
            .update(newWine);
    },

    getAllWine(knex, user_id) {
        return knex
            .select('*')
            .from('wine')
            .where('user_id', user_id)
    }
};

module.exports = wineService;