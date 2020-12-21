CREATE TABLE wine (
    winemaker TEXT NOT NULL,
    wine_type TEXT NOT NULL,
    wine_name TEXT,
    varietal TEXT,
    vintage INTEGER,
    region TEXT,
    tasting_notes TEXT,
    rating INTEGER,
    img_url TEXT,
    user_id INTEGER REFERENCES user_info(user_id)
);