const Utils = require('../libs/utils');


module.exports = {
    async upload(req, res, next) {
        return Utils.response(res, req.file);
    },
}