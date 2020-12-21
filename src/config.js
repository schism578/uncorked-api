module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql: //adrianmarquis@localhost/uncorked-test',
  DB_URL: process.env.DB_URL || 'postgresql://adrianmarquis@localhost/uncorked',
  JWT_SECRET: process.env.JWT_SECRET || 'sprechensiedeutsch',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL ||
    'http://localhost:8000/',
}