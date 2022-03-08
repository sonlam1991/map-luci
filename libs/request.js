const Promise = require('promise');
const request = require('request');
const config = require('../config');

module.exports.getOptionRequest = (url_api, data_request) => {
    const url_api_request = config.SMART_HOME_API + url_api;

    const options = {
        url: url_api_request,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Lumi-Api-Key': config.SMART_HOME_KEY_API,
            'system-api-key': config.SMART_HOME_SYSTEM_API_KEY,
            'Authorization': 'Bearer ' + config.SMART_HOME_TOKEN,
        },
        body: data_request,
        json: true
    };

    return options;
}

module.exports.requestPromise = (options) => {
    return new Promise(function(resolve, reject) {
        request(options, function(err, res, body) {
            if (err) {
                reject(err);
            }
            resolve(body);
        });
    });
}

