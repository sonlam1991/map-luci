const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    mongoURI: process.env.mongoURI,
    OsmBackendURI: process.env.OsmBackendURI,
    NominatimURI: process.env.NominatimURI,
    // mongoURI: 'mongodb://enetwork:enetwork2020@127.0.0.1:27017/enetwork'
};