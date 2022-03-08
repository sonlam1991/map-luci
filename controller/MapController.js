const Utils = require('../libs/utils');
const MapModel = require('../models/mapModel');
const BaseController = require('./BaseController');
const Requests = require('../libs/request');
const config = require('../config');
const util = require('util');

module.exports = {
    async speeds(req, res, next) {
        const body = req.body ? req.body : null;
        if (body) {
            const url = `${config.NominatimURI}/reverse?format=jsonv2&accept-language=vi&lat=${body.lat}&lon=${body.lon}`;
            console.log(url);
            const dataResult = await Requests.requestGetPromise(url);
            const dataResultJson = JSON.parse(dataResult);
            console.log({ dataResultJson });
            const id = Utils.createIdAddress(dataResultJson.address);
            const query = {
                $or: [
                    { id: id },
                    {
                        $and: [
                            { lat: { $gte: Number(body.lat) - 0.01, $lte: Number(body.lat) + 0.01 } },
                            { lon: { $gte: Number(body.lon) - 0.01, $lte: Number(body.lon) + 0.01 } },
                        ]
                    }
                ]
            };
            // console.log(util.inspect(query, false, null, true /* enable colors */));
            try {
                const data = await SpeedModel.find(query);
                // console.log(data);
                let currentRoad = data.filter(item => item.id == id);
                currentRoad = currentRoad[0] ? currentRoad[0] : {};
                return res.status(200).json({
                    status: 200,
                    data: data,
                    currentRoad: currentRoad
                });
            } catch (error) {
                return Utils.response(res, null);
            }
        } else {
            return Utils.response(res, null);
        }
    },

    async mapList(req, res, next) {
        const query = req.body ? req.body : {};
        try {
            const { status, data, error } = await BaseController.list(MapModel, query, req);
            // console.log({data});
            if (!status) {
                return Utils.response(res, null, 500, error);
            } else {
                return Utils.response(res, data);
            }
        } catch (error) {
            return Utils.response(res, null);
        }
    },

    async addOrUpdate(req, res) {
        try {
            const body = req.body;
            console.log(body);
            const query = {
                type: body.type,
                lat: body.lat,
                lon: body.lon,
            };
            const dataMap = await MapModel.findOne(query);
            if (dataMap && dataMap._id) {
                dataMap.type = body.type ? body.type : dataMap.type;
                dataMap.lat = body.lat ? body.lat : dataMap.lat;
                dataMap.lon = body.lon ? body.lon : dataMap.lon;
                dataMap.data = body.data ? body.data : dataMap.data;
                await dataMap.save();
                return Utils.response(res, dataMap);
            }

            const dataInsert = {
                type: body.type,
                lon: body.lon,
                lat: body.lat,
                data: body.data,
            };
            const { status, data, error } = await BaseController.addNotExist(MapModel, query, dataInsert);
            if (!status) {
                return Utils.response(res, null, 500, error);
            } else {
                return Utils.response(res, data);
            }
        } catch (error) {
            return Utils.response(res, null, 500, error);
        }
    },

    async delete(req, res) {
        try {
            const { status, data, error } = await BaseController.delete(MapModel, req.body._id);
            if (!status) {
                return Utils.response(res, null, 500, error);
            } else {
                return Utils.response(res, 'Delete success');
            }
        } catch (error) {
            return Utils.response(res, null, 500, error);
        }
    },
};