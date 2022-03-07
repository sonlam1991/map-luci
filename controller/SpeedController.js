const Utils = require('../libs/utils');
const SpeedModel = require('../models/speedModel');
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

    async speedList(req, res, next) {
        const query = req.body ? req.body : {};
        try {
            const { status, data, error } = await BaseController.list(SpeedModel, query, req);
            if (!status) {
                return Utils.response(res, null, 500, error);
            } else {
                return Utils.response(res, data);
            }
        } catch (error) {
            return Utils.response(res, null);
        }
    },
    async speedConvert(req, res, next) {
        const query = req.body ? req.body : {};
        try {
            const { status, data, error } = await BaseController.list(SpeedModel, query, req);
            if (!status) {
                return Utils.response(res, null, 500, error);
            } else {
                for (const speed of data) {
                    const url = `${config.NominatimURI}/reverse?format=jsonv2&accept-language=vi&lat=${speed.lat}&lon=${speed.lon}`;
                    const dataResult = await Requests.requestGetPromise(url);
                    const dataResultJson = JSON.parse(dataResult);
                    const address = dataResultJson.address;
                    const tinhThanhPho = Utils.createTinhThanhPho(address);
                    console.log("address => ", address);
                    console.log("tinhThanhPho => ", tinhThanhPho);
                    console.log("speed._id => ", speed._id);
                    await SpeedModel.findOneAndUpdate({ _id: speed._id }, {
                        tinhThanhPho: tinhThanhPho,
                        addressData: address,
                    });
                }
                return Utils.response(res, data);
            }

        } catch (error) {
            return Utils.response(res, null);
        }
    },

    async addOrUpdate(req, res) {
        try {
            const query = {
                id: req.body.id
            };
            const speed = await SpeedModel.findOne(query);
            if (speed && (speed.changeSpeed == false)) {
                speed.name = req.body.name ? req.body.name : speed.name;
                speed.address = req.body.address ? req.body.address : speed.address;
                speed.changeSpeed = req.body.changeSpeed ? req.body.changeSpeed : speed.changeSpeed;
                speed.minSpeed = req.body.minSpeed ? req.body.minSpeed : speed.minSpeed;
                speed.maxSpeed = req.body.maxSpeed ? req.body.maxSpeed : speed.maxSpeed;
                speed.lon = req.body.lon ? req.body.lon : speed.lon;
                speed.lat = req.body.lat ? req.body.lat : speed.lat;
                speed.gocHuong = req.body.gocHuong ? req.body.gocHuong : speed.gocHuong;
                speed.tinhThanhPho = req.body.tinhThanhPho ? req.body.tinhThanhPho : speed.tinhThanhPho;
                speed.addressData = req.body.addressData ? req.body.addressData : speed.addressData;
                // speed.lon.push(req.body.lon);
                // speed.lon = [...new Set(speed.lon)];

                // speed.lat.push(req.body.lat);
                // speed.lat = [...new Set(speed.lat)];

                await speed.save();
                return Utils.response(res, speed);
            }

            const dataInsert = {
                id: req.body.id,
                name: req.body.name,
                lon: req.body.lon,
                lat: req.body.lat,
                address: req.body.address,
                changeSpeed: req.body.changeSpeed,
                minSpeed: req.body.minSpeed,
                maxSpeed: req.body.maxSpeed,
                tinhThanhPho: req.body.tinhThanhPho,
                addressData: req.body.addressData,
                gocHuong: req.body.gocHuong,
            };
            if (req.body.changeSpeed == true) {
                const { status, data, error } = await BaseController.addOne(SpeedModel, dataInsert);
                if (!status) {
                    return Utils.response(res, null, 500, error);
                } else {
                    return Utils.response(res, data);
                }
            }
            const { status, data, error } = await BaseController.addNotExist(SpeedModel, query, dataInsert);
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
            const { status, data, error } = await BaseController.delete(SpeedModel, req.body.id);
            if (!status) {
                return Utils.response(res, null, 500, error);
            } else {
                return Utils.response(res, 'Delete success');
            }
        } catch (error) {
            return Utils.response(res, null, 500, error);
        }
    },

    async deleteSpeedChange(req, res) {
        try {
            const { status, data, error } = await BaseController.deleteQuery(SpeedModel, { id: req.body.id });
            if (!status) {
                return Utils.response(res, null, 500, error);
            } else {
                return Utils.response(res, 'Delete success');
            }
        } catch (error) {
            return Utils.response(res, null, 500, error);
        }
    }
};