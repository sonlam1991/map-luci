const _ = require('lodash');
const Promise = require('promise');
const Request = require('./request');
const config = require('../config');

module.exports.response = (res, data, status = 200, message = 'Success') => {
    if (!data && (status == 200)) {
        status = 404;
    }
    return res.status(200).json({
        status: status,
        data: data,
        message: message
    })
}





module.exports.getStatusDevice = async (devids) => {
    const body = {
        homeid: config.SMART_HOME_HOME_ID,
        payload: {
            cmd: 'get',
            reqid: 'xxxxxxxxxxxxxx',
            objects: [{
                type: 'devices',
                data: devids
            }]
        }
    };
    console.log(body);
    console.log(body.payload.objects);
    let options = Request.getOptionRequest('/device/get-status-devices', body);
    let result = await Request.requestPromise(options);
    if (!result.success) {
        const loginOptions = Request.getOptionRequest('site/login', {
            "email": "anhnt@lumi.biz",
            "password": "lumivn274"
        });
        const resultLogin = await Request.requestPromise(loginOptions);
        console.log({resultLogin});
        if(resultLogin.success) {
            config.SMART_HOME_TOKEN = resultLogin.data.access_token;
            options = Request.getOptionRequest('/device/get-status-devices', body);
            console.log(options);
            result = await Request.requestPromise(options);
        }
    }
    console.log(result);
    return result;
}

module.exports.control = async (devid, value) => {
    const body = {
        homeid: config.SMART_HOME_HOME_ID,
        payload: {
            cmd: 'set',
            reqid: 'xxxxxxxxxxxxxx',
            objects: [{
                type: 'devices',
                data: [devid],
                execution: {
                    command: 'OnOff',
                    params: { on: value }
                }
            }]
        }
    };
    let options = Request.getOptionRequest('/home-control/push-control-to-thing', body);
    let result = await Request.requestPromise(options);
    if (!result.success) {
        const loginOptions = Request.getOptionRequest('site/login', {
            "email": "anhnt@lumi.biz",
            "password": "lumivn274"
        });
        const resultLogin = await Request.requestPromise(loginOptions);
        console.log({resultLogin});
        if(resultLogin.success) {
            config.SMART_HOME_TOKEN = resultLogin.data.access_token;
            options = Request.getOptionRequest('/home-control/push-control-to-thing', body);
            console.log(options);
            result = await Request.requestPromise(options);
        }
    }
    console.log(result);
    return result;
}

module.exports.collectLongLang = (data) => {
    return new Promise(function (resolve, reject) {
        const latLon = [];
        if (data.routes && data.routes[0].legs && data.routes[0].legs[0].steps) {
            const steps = data.routes[0].legs[0].steps;
            if (steps) {
                for (const step of steps) {
                    if (step && step.maneuver && step.maneuver.location) {
                        const temp = {
                            lon: step.maneuver.location[0],
                            lat: step.maneuver.location[1]
                        }
                        latLon.push(temp);
                    }
                }
            }
        }

        if (data.routes && data.routes[1] && data.routes[1].legs && data.routes[1].legs[0].steps) {
            const steps = data.routes[1].legs[0].steps;
            if (steps) {
                for (const step of steps) {
                    if (step && step.maneuver && step.maneuver.location) {
                        const temp = {
                            lon: step.maneuver.location[0],
                            lat: step.maneuver.location[1]
                        }
                        latLon.push(temp);
                    }
                }
            }
        }

        resolve(latLon);
    });
}

module.exports.mappingSpeedWithId = (dataAddresses, dataSpeeds) => {
    return new Promise(function (resolve, reject) {
        const response = [];
        for (const item of dataAddresses) {
            const speedRaw = _getSpeedById(dataSpeeds, item.id);
            item['data'] = [];
            if (speedRaw && (speedRaw.length > 0)) {
                for (const speed of speedRaw) {
                    const temp = {
                        maxSpeed: speed.maxSpeed ? speed.maxSpeed : 0,
                        minSpeed: speed.minSpeed ? speed.minSpeed : 0,
                        lon: speed.lon,
                        lat: speed.lat
                    };
                    item['data'].push(temp);
                }
            } else {
                item['data'].push({
                    maxSpeed: 0,
                    minSpeed: 0,
                    lon: item.lon,
                    lat: item.lat
                });
            }

            response.push(item);
        }
        resolve(response);
    });
}

module.exports.mappingRouting = (dataRouting, dataSpeeds) => {
    return new Promise(function (resolve, reject) {
        if (dataRouting.routes && dataRouting.routes[0].legs && dataRouting.routes[0].legs[0].steps) {
            const steps = dataRouting.routes[0].legs[0].steps;
            if (steps) {
                const tempSteps1 = [];
                for (const step of steps) {
                    if (step && step.maneuver && step.maneuver.location) {
                        const temp = {
                            lon: step.maneuver.location[0],
                            lat: step.maneuver.location[1]
                        }
                        const dataSpeed = _getSpeedByLonLat(dataSpeeds, temp.lon, temp.lat);
                        if (dataSpeed) {
                            step['data'] = dataSpeed['data'];
                            step['name'] = dataSpeed['name'];
                        } else {
                            step['data'] = [];
                        }
                        tempSteps1.push(step);
                    }
                }
                dataRouting.routes[0].legs[0].steps = tempSteps1;

            }
        }

        if (dataRouting.routes && dataRouting.routes[1] && dataRouting.routes[1].legs && dataRouting.routes[1].legs[0].steps) {
            const steps = dataRouting.routes[1].legs[0].steps;
            if (steps) {
                const tempSteps2 = [];
                for (const step of steps) {
                    if (step && step.maneuver && step.maneuver.location) {
                        const temp = {
                            lon: step.maneuver.location[0],
                            lat: step.maneuver.location[1]
                        }
                        const dataSpeed = _getSpeedByLonLat(dataSpeeds, temp.lon, temp.lat);
                        if (dataSpeed) {
                            step['data'] = dataSpeed['data'];
                        } else {
                            step['data'] = [];
                        }
                        tempSteps2.push(step);
                    }
                }
                dataRouting.routes[1].legs[0].steps = tempSteps2;
            }
        }
        resolve(dataRouting);
    });
}

module.exports.createIdAddress = (address) => {
    var idAddress = '';
    if (address.road) {
        idAddress += _nonAccentVietnamese(address.road) + '_';
    }

    if (address.village) {
        idAddress += _nonAccentVietnamese(address.village) + '_';
    }

    if (address.town) {
        idAddress += _nonAccentVietnamese(address.town) + '_';
    }

    if (address.county) {
        idAddress += _nonAccentVietnamese(address.county) + '_';
    }

    if (address.state) {
        idAddress += _nonAccentVietnamese(address.state) + '_';
    }

    if (address.city_district) {
        idAddress += _nonAccentVietnamese(address.city_district) + '_';
    } else if (address.suburb) {
        idAddress += _nonAccentVietnamese(address.suburb) + '_';
    }

    if (address.city) {
        idAddress += _nonAccentVietnamese(address.city) + '_';
    }

    if (address.country) {
        idAddress += _nonAccentVietnamese(address.country);
    }

    return idAddress;
}

module.exports.createTinhThanhPho = (address) => {
    var tinhThanhPho = '';

    if (address.city) {
        tinhThanhPho += _nonAccentVietnamese(address.city);
    } else if (address.state) {
        tinhThanhPho += _nonAccentVietnamese(address.state);
    }

    return tinhThanhPho;
}

function _getSpeedByLonLat(speeds, lon, lat) {
    for (const speed of speeds) {
        if (speed.lon == lon && speed.lat == lat) {
            return speed;
        }
    }

    return null;
}

function _getSpeedById(speeds, id) {
    const response = [];
    for (const speed of speeds) {
        if (speed.id == id) {
            response.push(speed);
        }
    }
    return response;
}

function _nonAccentVietnamese(str) {
    str = str.toLowerCase();
    str = str.replace(/đường|ngõ|phường|phố|quận|huyện/g, "");
    str = str.trim();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư


    str = str.replace(/ /g, "_");

    return str;
}