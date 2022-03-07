const Promise = require('promise');
const request = require('request');

module.exports.getOptionRequest = (access_key) => {
    return {
        'Content-Type': 'application/json',
        'system-api-key': access_key,
        'timeout': 3000
    };
};

module.exports.requestGetPromise = (url) => {
    return new Promise(function (resolve, reject) {
        request.get(url , (err, res, body) => {
            if (err) {
                reject(err);
            }
            resolve(body);
        });
    });
};




module.exports.requestPostPromise = (options) => {
    return new Promise(function (resolve, reject) {
        options['timeout'] = 30000;
        request.post(options, (err, res, body) => {
            if (err) {
                reject(err);
            }
            resolve(body);
        });
    });
};
