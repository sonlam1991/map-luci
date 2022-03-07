var limitSpeeds = {
    "type": "FeatureCollection",
    "features": [
    ]
};


var currentTinhThanhPho = "";
var map = null;
var isUpdate = false;

var displayAll = false;
var pinLayer = null;
var pinStartGocLayer = null;
var pinEndccGocLayer = null;
var typeChonGoc = 0;

var toaDoGoc = {
    start: {
        lat: 0,
        lon: 0
    },
    end: {
        lat: 0,
        lon: 0
    }
};


var gocLechRound = 0;

var pinIcon = L.icon({ iconUrl: 'image/pin.png', iconSize: [25, 70], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var pinIconStart = L.icon({ iconUrl: 'image/pin-start.png', iconSize: [25, 70], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var pinIconEnd = L.icon({ iconUrl: 'image/pin-end.png', iconSize: [25, 70], iconAnchor: [16, 37], popupAnchor: [0, -28] });

$(document).ready(function () {
    // hidden button delete
    $('#btn_delete').hide();
    $('.chon-goc').hide();

    // init map
    map = L.map('map_top_display', {
        attributionControl: false, // để ko hiện watermark nữa, nếu bị liên hệ đòi thì nhớ open nha
        center: [20.999526, 105.796784], // vị trí map mặc định hiện tại
        zoom: 15, // level zoom
    });

    // add tile để map có thể hoạt động, xài free từ OSM
    var urlMap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    // var urlMap = 'http://113.177.27.162:8089/styles/basic-preview/{z}/{x}/{y}.png';
    L.tileLayer(urlMap, {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: 25
    }).addTo(map);

    map.on('click', function (ev) {
        addNewPoint(ev.latlng.lng, ev.latlng.lat);
        addPinPoint(ev.latlng.lat, ev.latlng.lng);
    });

    map.on('zoomend', function(el) {
        console.log("zoomend => ", el);
        console.log("target zoom =>", el.target._zoom)
    });

    $('#displayAll').prop('checked', false);
    $('#displayAll').click(function () {
        if ($("#displayAll").is(':checked')) {
            displayAll = true;
        } else {
            displayAll = false;
            if (layerGeoJson) {
                clear_polyline(layerGeoJson);
            }
        }
        getData();
    });

    getData();


    // change kinh độ vs tọa độ
    $("#lat").change(function () {
        typeChonGoc = 3;
        map.flyTo(new L.LatLng(getValueByIdSelector('lat'), getValueByIdSelector('lon')), 18);
        addPinPoint(getValueByIdSelector('lat'), getValueByIdSelector('lon'));
    });
    $("#lon").change(function () {
        typeChonGoc = 3;
        map.flyTo(new L.LatLng(getValueByIdSelector('lat'), getValueByIdSelector('lon')), 18);
        addPinPoint(getValueByIdSelector('lat'), getValueByIdSelector('lon'));
    });

    $('#changeSpeed').change(function () {
        showOrHideChonGoc($("#changeSpeed").is(':checked'));
    });
});

function showOrHideChonGoc(isDisplay) {
    if (isDisplay) {
        typeChonGoc = 1;
        selectToaDo(typeChonGoc);
        $('.chon-goc').show();
    } else {
        typeChonGoc = 0;
        if (pinStartGocLayer != undefined) {
            map.removeLayer(pinStartGocLayer);
        };
        if (pinEndccGocLayer != undefined) {
            map.removeLayer(pinEndccGocLayer);
        };
        $('.chon-goc').hide();
    }
}

function addPinPoint(lat, lon) {
    if (pinLayer != undefined) {
        map.removeLayer(pinLayer);
    };
    if (typeChonGoc == 3) {
        pinLayer = L.marker([lat, lon], { icon: pinIcon }).addTo(map);
    } else if (typeChonGoc == 1) {
        toaDoGoc.start.lat = lat;
        toaDoGoc.start.lon = lon;
        if (pinStartGocLayer != undefined) {
            map.removeLayer(pinStartGocLayer);
        };
        pinStartGocLayer = L.marker([lat, lon], { icon: pinIconStart }).addTo(map);
    } else if (typeChonGoc == 2) {
        if (pinEndccGocLayer != undefined) {
            map.removeLayer(pinEndccGocLayer);
        };
        toaDoGoc.end.lat = lat;
        toaDoGoc.end.lon = lon;
        pinEndccGocLayer = L.marker([lat, lon], { icon: pinIconEnd }).addTo(map);
    }
    const start = [toaDoGoc.start.lat, toaDoGoc.start.lon];
    const end = [toaDoGoc.end.lat, toaDoGoc.end.lon];
    const gocLech = calculate_initial_compass_bearing(start, end);
    gocLechRound = (Math.round(gocLech * 100) / 100);
    $('#gocToaDo').val(gocLechRound + 'º');
    console.log(toaDoGoc);
}


var limit_20 = L.icon({ iconUrl: 'image/20.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_30 = L.icon({ iconUrl: 'image/30.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_40 = L.icon({ iconUrl: 'image/40.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_50 = L.icon({ iconUrl: 'image/50.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_60 = L.icon({ iconUrl: 'image/60.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_70 = L.icon({ iconUrl: 'image/70.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_80 = L.icon({ iconUrl: 'image/80.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_90 = L.icon({ iconUrl: 'image/90.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_100 = L.icon({ iconUrl: 'image/100.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_110 = L.icon({ iconUrl: 'image/110.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var limit_120 = L.icon({ iconUrl: 'image/120.png', iconSize: [32, 37], iconAnchor: [16, 37], popupAnchor: [0, -28] });

var layerGeoJson = null;
var dataSpeeds = [];
var dataAddress = {};


function whenClicked(e) {
    editData(e.latlng.lat, e.latlng.lng);
}

function onEachFeature(feature, layer) {
    var popupContent = `<h3 class="text-center">${feature.name}</h3>`;
    if (feature.properties && feature.properties.popupContent) {
        popupContent += feature.properties.popupContent;
    }
    layer.on({
        click: whenClicked
    });
    layer.bindPopup(popupContent);
}

async function addNewPoint(lon, lat) {
    const address = await getNameStreet(lat.toFixed(6), lon.toFixed(6));
    $('#id').val(address.id);
    $('#lon').val(lon.toFixed(6));
    $('#lat').val(lat.toFixed(6));
    $('#name').val(address.name);
    $('#address').val(address.address);
    const speed = getDataById(address.id);
    currentTinhThanhPho = await createTinhThanhPho(address.dataAddress);
    dataAddress = address.dataAddress;
    getData();
    if (speed) {
        showOrHideChonGoc(speed.changeSpeed);
        $('#btn_delete').show();
        $('#changeSpeed').prop('checked', speed.changeSpeed ? true : false);
    } else {
        $('#btn_delete').hide();
        if (typeChonGoc == 0) {
            $('#changeSpeed').prop('checked', false);
            showOrHideChonGoc(false);
        }
    }
}


async function editData(lat, lon) {
    const dataSpeed = getDataByLatLon(lat, lon);
    if (dataSpeed) {
        $('#btn_delete').show();
        $('#_id').val(dataSpeed._id);
        $('#id').val(dataSpeed.id);
        $('#lon').val(dataSpeed.lon);
        $('#lat').val(dataSpeed.lat);
        $('#name').val(dataSpeed.name);
        $('#gocToaDo').val(dataSpeed.gocHuong);
        $('#address').val(dataSpeed.address);
        $('#minSpeed').val(dataSpeed.minSpeed);
        $('#maxSpeed').val(dataSpeed.maxSpeed);
        $('#changeSpeed').prop('checked', dataSpeed.changeSpeed ? true : false);
        showOrHideChonGoc(dataSpeed.changeSpeed);
        currentTinhThanhPho = dataSpeed.tinhThanhPho ? dataSpeed.tinhThanhPho : '';
        dataAddress = dataSpeed.dataAddress ? dataSpeed.dataAddress : {};
        // getData();
        isUpdate = true;
    } else {
        $('#btn_delete').hide();
        isUpdate = false;
    }
}

async function getData() {
    dataSpeeds = [];
    for (let page = 0; page < 1000; page++) {
        let query = {};
        if (displayAll) {
            query = { page: page };
        } else {
            query = { page: page, tinhThanhPho: currentTinhThanhPho };
        }
        let speeds = await requestPromisePOST('/speed_list', query);
        if (speeds.status == 200) {
            // console.log(speeds);
            if (speeds.data) {
                limitSpeeds.features = [];
                dataSpeeds = dataSpeeds.concat(speeds.data);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    if (dataSpeeds && dataSpeeds.length > 0) {
        generatePointOnMap(dataSpeeds);
    }

}

function generatePointOnMap(speeds) {
    speeds.forEach(item => {
        var temp = {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    item.lon, item.lat
                ],
            },
            "maxSpeed": item.maxSpeed,
            "minSpeed": item.minSpeed,
            "name": item.name,
            "type": "Feature",
            "properties": {
                "popupContent": `<p style="margin: 0;">Địa chỉ:<b> ${item.address}</b></p> <p style="margin: 0;">Max Speed: <b> ${item.maxSpeed}(km/h)</b></p><p style="margin: 0;"">Min Speed: <b> ${item.minSpeed}(km/h) </b></p>`
            },
            "id": item.id
        };
        limitSpeeds.features.push(temp);
    });

    if (layerGeoJson) {
        clear_polyline(layerGeoJson);
    }

    layerGeoJson = L.geoJSON(limitSpeeds, {
        pointToLayer: function (feature, latlng) {
            if (feature.maxSpeed == 20) {
                return L.marker(latlng, { icon: limit_20 });
            } else if (feature.maxSpeed == 30) {
                return L.marker(latlng, { icon: limit_30 });
            } else if (feature.maxSpeed == 40) {
                return L.marker(latlng, { icon: limit_40 });
            } else if (feature.maxSpeed == 50) {
                return L.marker(latlng, { icon: limit_50 });
            } else if (feature.maxSpeed == 60) {
                return L.marker(latlng, { icon: limit_60 });
            } else if (feature.maxSpeed == 70) {
                return L.marker(latlng, { icon: limit_70 });
            } else if (feature.maxSpeed == 80) {
                return L.marker(latlng, { icon: limit_80 });
            } else if (feature.maxSpeed == 90) {
                return L.marker(latlng, { icon: limit_90 });
            } else if (feature.maxSpeed == 100) {
                return L.marker(latlng, { icon: limit_100 });
            } else if (feature.maxSpeed == 110) {
                return L.marker(latlng, { icon: limit_110 });
            } else if (feature.maxSpeed == 120) {
                return L.marker(latlng, { icon: limit_120 });
            }
        },
        onEachFeature: onEachFeature
    }).addTo(map);
}

async function saveData() {
    var data = {
        id: getValueByIdSelector('id'),
        lon: getValueByIdSelector('lon'),
        lat: getValueByIdSelector('lat'),
        name: getValueByIdSelector('name'),
        address: getValueByIdSelector('address'),
        changeSpeed: $("#changeSpeed").is(':checked'),
        minSpeed: getValueByIdSelector('minSpeed'),
        maxSpeed: getValueByIdSelector('maxSpeed'),
        tinhThanhPho: currentTinhThanhPho,
        dataAddres: dataAddress,
        gocHuong: gocLechRound,
    };
    if (data.changeSpeed) {
        // add start
        data.lat = toaDoGoc.start.lat;
        data.lon = toaDoGoc.start.lon;
        
        var result = await requestPromisePOST('/speed', data);

        // add end
        data.lat = toaDoGoc.end.lat;
        data.lon = toaDoGoc.end.lon;
        result = await requestPromisePOST('/speed', data);
        if (result.status == 200) {
            alert("Thêm tốc độ vào đường thành công!!");
            getData();
        } else {
            // alert(result.message);
        }

    } else {
        var result = await requestPromisePOST('/speed', data);
        if (result.status == 200) {
            alert("Thêm tốc độ vào đường thành công!!");
            getData();
        } else {
            // alert(result.message);
        }
    }


}

async function deleteData() {
    var data = {
        id: getValueByIdSelector('_id'),
    };
    if (!data.id) {
        alert("Chỉ xóa được tốc độ tồn tại!");
        return;
    }

    var result = await requestPromisePOST('/speed_delete', data);
    if (result.status == 200) {
        alert("Xóa tốc độ vào đường thành công!!");
        getData();
    } else {
        // alert(result.message);
    }
}

function selectToaDo(type) {
    typeChonGoc = type;
    $("#btn_start").removeClass("btn-warning");
    $("#btn_end").removeClass("btn-warning");
    if (typeChonGoc == 1) {
        $("#btn_start").addClass("btn-warning");
    } else if (typeChonGoc == 2) {
        $("#btn_end").addClass("btn-warning");
    }
}

function clear_polyline(clearLayer) {
    map.removeLayer(clearLayer);
}

function getDataById(id) {
    for (const speed of dataSpeeds) {
        if (speed.id == id) {
            return speed;
        }
    }

    return null;
}

function getDataByLatLon(lat, lon) {
    for (const speed of dataSpeeds) {
        if ((speed.lat == lat) && (speed.lon == lon)) {
            return speed;
        }
    }

    return null;
}