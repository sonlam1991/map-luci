const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    SMART_HOME_API: process.env.SMART_HOME_API,
    SMART_HOME_SYSTEM_API_KEY: process.env.SMART_HOME_SYSTEM_API_KEY,
    SMART_HOME_KEY_API: process.env.SMART_HOME_KEY_API,
    SMART_HOME_TOKEN: process.env.SMART_HOME_TOKEN,
    SMART_HOME_HOME_ID: parseInt(process.env.SMART_HOME_HOME_ID),
};