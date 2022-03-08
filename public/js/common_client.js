
$(document).ready(function () {
});


function requestPromiseGET(url, data = {}) {
    return new Promise(resolve => {
        $.ajax({
            url: 'api/v1' + url,
            traditional: true,
            type: "get",
            dataType: "json",
            contentType: 'application/json',
            data: data,
            success: function (result) {
                resolve(result);
            }
        });
    });
}

function requestPromisePOST(url, data = {}) {
    return new Promise(resolve => {
        $.ajax({
            url: 'api/v1' + url,
            traditional: true,
            type: "post",
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (result) {
                resolve(result);
            }
        });
    });
}

function requestPromisePUT(url, data = {}) {
    return new Promise(resolve => {
        $.ajax({
            url: 'api/v1' + url,
            traditional: true,
            type: "put",
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (result) {
                resolve(result);
            }
        });
    });
}

function requestPromiseDELETE(url, data = {}) {
    return new Promise(resolve => {
        $.ajax({
            url: 'api/v1' + url,
            traditional: true,
            type: "delete",
            dataType: "json",
            contentType: 'application/json',
            data: data,
            success: function (result) {
                resolve(result);
            }
        });
    });
}

function getValueByIdSelector(id_selector) {
    return $('#' + id_selector).val().trim();
}


function getNameStreet(lat, lon) {
    return new Promise(resolve => {
        // 16.065774, 108.191459
        $.get(`http://113.177.27.162:8099/reverse?format=jsonv2&accept-language=vi&lat=${lat}&lon=${lon}`, function (data) {
            // $.get(`http://nominatim:8080/reverse?format=jsonv2&accept-language=vi&lat=${lat}&lon=${lon}`, function (data) {
            // console.log('data =>', data);
            data.display_name = data.display_name.replace(/\+/g, "");
            data.address.postcode = data.address.postcode ? data.address.postcode.replace(/\+/g, "") : null;
            const response = {
                id: createIdAddress(data.address),
                address: (data.display_name.replace(new RegExp(data.address.postcode + ',', "g"), "")).trim(),
                name: data.address.road ? data.address.road : data.address.suburb,
                dataAddress: data.address
            };
            console.log(response);
            resolve(response);
        });
    });
}

function createIdAddress(address) {
    var idAddress = '';
    if (address.road) {
        idAddress += nonAccentVietnamese(address.road) + '_';
    }

    if (address.village) {
        idAddress += nonAccentVietnamese(address.village) + '_';
    }

    if (address.town) {
        idAddress += nonAccentVietnamese(address.town) + '_';
    }

    if (address.county) {
        idAddress += nonAccentVietnamese(address.county) + '_';
    }

    if (address.state) {
        idAddress += nonAccentVietnamese(address.state) + '_';
    }

    if (address.city_district) {
        idAddress += nonAccentVietnamese(address.city_district) + '_';
    } else if (address.suburb) {
        idAddress += nonAccentVietnamese(address.suburb) + '_';
    }

    if (address.city) {
        idAddress += nonAccentVietnamese(address.city) + '_';
    }

    if (address.country) {
        idAddress += nonAccentVietnamese(address.country);
    }

    return idAddress;
}

function createTinhThanhPho(address) {
    var tinhThanhPho = '';

    if (address.city) {
        tinhThanhPho += nonAccentVietnamese(address.city);
    } else if (address.state) {
        tinhThanhPho += nonAccentVietnamese(address.state);
    }

    return tinhThanhPho;
}


function nonAccentVietnamese(str) {
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



function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function degrees_to_radians(degrees) {
    return degrees * Math.PI / 180;
}

function calculate_initial_compass_bearing(pointA, pointB) {
    const lat1 = degrees_to_radians(pointA[0]);
    const lat2 = degrees_to_radians(pointB[0]);

    const diffLong = degrees_to_radians(pointB[1] - pointA[1]);

    const x = Math.sin(diffLong) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - (Math.sin(lat1)
        * Math.cos(lat2) * Math.cos(diffLong));

    let initial_bearing = Math.atan2(x, y);

    initial_bearing = radians_to_degrees(initial_bearing);
    const compass_bearing = (initial_bearing + 360) % 360;

    return compass_bearing;
}