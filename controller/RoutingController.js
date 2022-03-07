const Utils = require('../libs/utils');
const Requests = require('../libs/request');
const SpeedModel = require('../models/speedModel');
const BaseController = require('./BaseController');
const config = require('../config');

module.exports = {
    async routing(req, res, next) {
        try {
            const dataBody = req.body;
            if (dataBody.from_lon && dataBody.from_lat && dataBody.to_lon && dataBody.to_lat) {
                // console.log(req.body);
                // const url = `http://113.177.27.162:5000/route/v1/driving/${dataBody.from_lon},${dataBody.from_lat};${dataBody.to_lon},${dataBody.to_lat}?overview=false&alternatives=true&steps=true&hints=;`;
                const url = `${config.OsmBackendURI}/route/v1/driving/${dataBody.from_lon},${dataBody.from_lat};${dataBody.to_lon},${dataBody.to_lat}?overview=false&alternatives=true&steps=true&hints=;`;
                const data = await Requests.requestGetPromise(url);
                const dataRoutingJson = JSON.parse(data);
                const latlon = await Utils.collectLongLang(dataRoutingJson);

                const dataLonLat = [];
                let idAddresses = [];
                for (const item of latlon) {
                    const url = `${config.NominatimURI}/reverse?format=jsonv2&accept-language=vi&lat=${item.lat}&lon=${item.lon}`;
                    const dataResult = await Requests.requestGetPromise(url);
                    const dataResultJson = JSON.parse(dataResult);
                    item['data'] = dataResultJson.address;
                    item['name'] = dataResultJson.address.road ? dataResultJson.address.road : '';
                    item['id'] = Utils.createIdAddress(dataResultJson.address);
                    idAddresses.push(item['id']);
                    dataLonLat.push(item);
                }

                idAddresses = [...new Set(idAddresses)];
                // console.log(idAddresses);
                // find speed on DB
                const speeds = await SpeedModel.find({ id: { $in: idAddresses } });
                let dataSpeedAddress;
                if (speeds) {
                    dataSpeedAddress = await Utils.mappingSpeedWithId(dataLonLat, speeds);
                }
                const dataRoutingFinal = await Utils.mappingRouting(dataRoutingJson, dataSpeedAddress);

                return Utils.response(res, dataRoutingFinal);
            }

            return Utils.response(res, null, 400, 'Yêu cầu đầy đủ thông tin lon và lat của từ điểm đi to điểm đến');

        } catch (error) {
            console.log(error);
            return Utils.response(res, null);
        }
    },
};