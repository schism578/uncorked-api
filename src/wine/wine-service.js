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
    },
    searchWine(knex, searchTerm, user_id) {
        return knex
        .select('wine_type', 'winemaker', 'wine_name', 'varietal', 'vintage', 'region', 'tasting_notes', 'rating')
        .from('wine')
        .where('wine_type', 'LIKE', `%${searchTerm.wine_type || ''}%`)
        .where('user_id', '=', user_id)
        //.where('wine_name', 'LIKE', `%${searchTerm || ''}%`)
        //.where('winemaker', 'LIKE', `%${searchTerm || ''}%`)
        //.where('varietal', 'LIKE', `%${searchTerm || ''}%`)
        //.where('region', 'LIKE', `%${searchTerm || ''}%`)
        //.where('tasting_notes', 'LIKE', `%${searchTerm || ''}%`)
        //.where('cast(vintage AS TEXT)', 'LIKE', `%${searchTerm || ''}%`)
        //.where('cast(rating AS TEXT)', 'LIKE', `%${searchTerm || ''}%`)
    },
};

module.exports = wineService;