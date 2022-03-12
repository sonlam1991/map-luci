var displayDataMaps = {
    "type": "FeatureCollection",
    "features": [
    ]
};
var LAYER = {
    TRAFFIC_LIGHT: 'layer_traffic_light',
    TREE: 'layer_tree',
    ELECTRICAL_CABINET: 'layer_electrical_cabinet',
    CAMERA: 'layer_camera',
};
var currentLayer = LAYER.TRAFFIC_LIGHT;

var map = null;
var isUpdate = false;
var pinLayer = null;

var layerGeoJson = null;
var dataMaps = [];
var dataAddress = {};
var currentZoomLevel = 15;
var levelDisplay = 15;

/////////// ICON //////////////
var cameraIcon = L.icon({ iconUrl: 'image/camera.png', iconSize: [50, 30], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var trafficLightOnIcon = L.icon({ iconUrl: 'image/traffic-light-on.png', iconSize: [40, 50], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var trafficLightOffIcon = L.icon({ iconUrl: 'image/traffic-light-off.png', iconSize: [40, 50], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var treeIcon = L.icon({ iconUrl: 'image/tree.png', iconSize: [25, 50], iconAnchor: [16, 37], popupAnchor: [0, -28] });
var electricalCabinetIcon = L.icon({ iconUrl: 'image/electrical-cabinet.png', iconSize: [25, 50], iconAnchor: [16, 37], popupAnchor: [0, -28] });

//////////////// function ///////////////
var currentDeviceId;
var currentStatus;
var countGetStatus = 0;

function convertIdDevice(deviceId) {
    return deviceId.replace(/:/g, "_");
}
async function updateStatusDevice() {
    countGetStatus++;
    if (currentDeviceId) {
        const data = {
            deviceIds: [currentDeviceId]
        };
        const result = await requestPromisePOST('/map_get_status', data);
        if (result.status == 200) {
            const resultData = result.data;
            if (resultData) {
                const deviceId = resultData.deviceId;
                const deviceIdConvert = convertIdDevice(deviceId);
                const status = resultData.status;

                if (status) {
                    $("#status_" + deviceIdConvert).html(`Trạng Thái Hiện Tại: <img class="icon-light"  src="/image/light-on.png" alt="ligth on">`);
                    $("#btn_" + deviceIdConvert).html(`<button class="btn-secondany" 
                                            onclick="controlTrafficLight('${deviceId}', false)" 
                                            style="margin: 0;"> TURN OFF
                                        </button>`);
                } else {
                    $("#status_" + deviceIdConvert).html(`Trạng Thái Hiện Tại: <img class="icon-light"  src="/image/light-off.png" alt="ligth on">`);
                    $("#btn_" + deviceIdConvert).html(`<button class="btn-success" 
                                            onclick="controlTrafficLight('${deviceId}', true)" 
                                            style="margin: 0;"> TURN ON
                                        </button>`);
                    console.log('status offf');
                }
            }
            console.log({ resultData });
        }
    }
}

function showLayer(layer) {
    $('#' + LAYER.CAMERA).hide();
    $('#' + LAYER.ELECTRICAL_CABINET).hide();
    $('#' + LAYER.TREE).hide();
    $('#' + LAYER.TRAFFIC_LIGHT).hide();
    $('#' + layer).show();
}

function resetForm(layer) {
    switch (layer) {
        case LAYER.CAMERA:
            $('#' + layer + '_address').val('');
            $('#' + layer + '_name').val('');
            $('#' + layer + '_link_stream').val('');
            break;
        case LAYER.TRAFFIC_LIGHT:
            $('#' + layer + '_id').val('');
            $('#' + layer + '_name').val('');
            break;
        case LAYER.ELECTRICAL_CABINET:
            $('#' + layer + '_name').val('');
            $('#' + layer + '_address').val('');
            $('#' + layer + '_link_document').val('');
            break;
        case LAYER.TREE:
            $('#' + layer + '_name').val('');
            break;
        default:
            break;
    }
}

function getFeatureIcon(latlng, layer, data) {
    switch (layer) {
        case LAYER.CAMERA:
            return L.marker(latlng, { icon: cameraIcon });
        case LAYER.TRAFFIC_LIGHT:
            if (data.status) {
                return L.marker(latlng, { icon: trafficLightOnIcon });
            } else {
                return L.marker(latlng, { icon: trafficLightOffIcon });
            }

        case LAYER.ELECTRICAL_CABINET:
            return L.marker(latlng, { icon: electricalCabinetIcon });
        case LAYER.TREE:
            return L.marker(latlng, { icon: treeIcon });
        default:
            return null;;
    }
}

function addDataUpdate(layer, data) {
    console.log(layer, ' ', data.id);
    switch (layer) {
        case LAYER.CAMERA:
            $('#' + layer + '_address').val(data.address);
            $('#' + layer + '_name').val(data.name);
            $('#' + layer + '_link_stream').val(data.link_stream);
            break;
        case LAYER.TRAFFIC_LIGHT:
            $('#' + layer + '_id').val(data.id);
            $('#' + layer + '_name').val(data.name);
            break;
        case LAYER.ELECTRICAL_CABINET:
            $('#' + layer + '_name').val(data.name);
            $('#' + layer + '_address').val(data.address);
            $('#' + layer + '_link_document').val(data.link_document);
            break;
        case LAYER.TREE:
            $('#' + layer + '_name').val(data.name);
            break;
        default:
            return null;;
    }
}

function getSaveData(layer) {
    switch (layer) {
        case LAYER.CAMERA:
            return {
                address: $('#' + layer + '_address').val(),
                name: $('#' + layer + '_name').val(),
                link_stream: $('#' + layer + '_link_stream').val(),
            };
        case LAYER.TRAFFIC_LIGHT:
            return {
                id: $('#' + layer + '_id').val(),
                name: $('#' + layer + '_name').val(),
                status: false,
            };
        case LAYER.ELECTRICAL_CABINET:
            return {
                name: $('#' + layer + '_name').val(),
                address: $('#' + layer + '_address').val(),
                link_document: $('#' + layer + '_link_document').val(),
            };
        case LAYER.TREE:
            return {
                name: $('#' + layer + '_name').val(),
            };
        default:
            return null;;
    }
}

/////////////// END function //////////////////

$(document).ready(function () {

    /////// INIT MAP DISPLAY ////////////
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


    ////////// EVENT ON MAP ///////////////
    map.on('click', function (ev) {
        addNewPoint(ev.latlng.lng, ev.latlng.lat);
        addPinPoint(ev.latlng.lat, ev.latlng.lng);
    });

    map.on('zoomend', function (el) {
        console.log("target zoom =>", el.target._zoom);
        currentZoomLevel = el.target._zoom;
        // currentZoomLevel = 17;
        $('#current_level').text(currentZoomLevel);
        getData();
    });

    /////// EVENT SELECT LAYER
    $('#layer_select').change(function () {
        currentLayer = $(this).val();
        console.log({ currentLayer });
        showLayer(currentLayer);
        getData();
    });

    // SELECT LEVEL DISPLAY
    $('#level_display_select').change(function () {
        levelDisplay = $(this).val();
        getData();
    });


    ////////// 
    getData();


    // change kinh độ vs tọa độ
    $("#" + currentLayer + "_lat").change(function () {
        typeChonGoc = 3;
        const lat = currentLayer + "_lat";
        const lon = currentLayer + "_lon";
        map.flyTo(new L.LatLng(getValueByIdSelector(lat), getValueByIdSelector(lon)), 18);
        addPinPoint(getValueByIdSelector(lat), getValueByIdSelector(lon));
    });
    $("#" + currentLayer + "_lon").change(function () {
        typeChonGoc = 3;
        const lat = currentLayer + "_lat";
        const lon = currentLayer + "_lon";
        map.flyTo(new L.LatLng(getValueByIdSelector(lat), getValueByIdSelector(lon)), 18);
        addPinPoint(getValueByIdSelector(lat), getValueByIdSelector(lon));
    });

    setInterval(function () {
        if ((currentLayer == LAYER.TRAFFIC_LIGHT) && (countGetStatus <= 3)) {
            updateStatusDevice();
        }
    }, 1000);

});


function addPinPoint(lat, lon) {
    if (pinLayer != undefined) {
        map.removeLayer(pinLayer);
    };
    switch (currentLayer) {
        case LAYER.CAMERA:
            pinLayer = L.marker([lat, lon], { icon: cameraIcon }).addTo(map);
            break;
        case LAYER.TRAFFIC_LIGHT:
            pinLayer = L.marker([lat, lon], { icon: trafficLightOnIcon }).addTo(map);
            break;
        case LAYER.ELECTRICAL_CABINET:
            pinLayer = L.marker([lat, lon], { icon: electricalCabinetIcon }).addTo(map);
            break;
        case LAYER.TREE:
            pinLayer = L.marker([lat, lon], { icon: treeIcon }).addTo(map);
            break;
        default:
            break;
    }
}


function whenClicked(e) {
    editData(e.latlng.lat, e.latlng.lng);
}

function onEachFeature(feature, layer) {
    var popupContent = `<h3 class="text-center">${feature.featureName}</h3>`;
    if (feature.properties && feature.properties.popupContent) {
        popupContent += feature.properties.popupContent;
    }
    layer.on({
        click: whenClicked
    });
    layer.bindPopup(popupContent);
}

async function addNewPoint(lon, lat) {
    $('#' + currentLayer + '_lon').val(lon.toFixed(6));
    $('#' + currentLayer + '_lat').val(lat.toFixed(6));
    console.log('reset form');
    resetForm(currentLayer);
    const mapData = getDataOne(lat, lon, currentLayer);
    console.log(mapData);
    if (mapData) {
        const dataTemp = mapData.data ? mapData.data : {};
        switch (currentLayer) {
            case LAYER.CAMERA:
                $('#' + currentLayer + '_address').val(dataTemp.address);
                $('#' + currentLayer + '_name').val(dataTemp.name);
                $('#' + currentLayer + '_link_stream').val(dataTemp.link_stream);
                break;
            case LAYER.TRAFFIC_LIGHT:
                $('#' + currentLayer + '_id').val(dataTemp.id);
                $('#' + currentLayer + '_name').val(dataTemp.name);
                break;
            case LAYER.ELECTRICAL_CABINET:
                $('#' + currentLayer + '_name').val(dataTemp.name);
                $('#' + currentLayer + '_address').val(dataTemp.address);
                $('#' + currentLayer + '_link_document').val(dataTemp.link_document);
                break;
            case LAYER.TREE:
                $('#' + currentLayer + '_name').val(dataTemp.name);
                break;
            default:
                break;
        }
        $('#btn_' + currentLayer + '_delete').show();
    } else {
        $('#btn_' + currentLayer + '_delete').hide();
    }
}

async function editData(lat, lon) {
    const dataMap = getDataOne(lat, lon, currentLayer);
    console.log(dataMap);
    if (pinLayer != undefined) {
        map.removeLayer(pinLayer);
    };
    if (dataMap) {
        $('#btn_' + currentLayer + '_delete').show();
        $('#_id').val(dataMap._id);
        $('#' + currentLayer + '_lon').val(dataMap.lon);
        $('#' + currentLayer + '_lat').val(dataMap.lat);
        addDataUpdate(currentLayer, dataMap.data);
        isUpdate = true;
    } else {
        $('#btn_' + currentLayer + '_delete').hide();
        isUpdate = false;
    }
}

async function getData() {
    dataMaps = [];
    for (let page = 0; page < 1000; page++) {
        let query = {
            page,
            type: currentLayer
        };

        let maps = await requestPromisePOST('/map_list', query);
        if (maps.status == 200) {
            // console.log(speeds);
            if (maps.data) {
                displayDataMaps.features = [];
                dataMaps = dataMaps.concat(maps.data);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    if (currentZoomLevel >= levelDisplay) {
        if (dataMaps && dataMaps.length > 0) {
            generatePointOnMap(dataMaps);
        }
    } else if (layerGeoJson) {
        clear_polyline(layerGeoJson);
    }

}

function generatePointOnMap(dataMaps) {
    dataMaps.forEach(item => {
        let popupContent = '';
        let name = '';
        const data = item.data;
        switch (currentLayer) {
            case LAYER.CAMERA:
                name = "CAMERA";
                popupContent = `<p style="margin: 0;">
                                    Địa chỉ Lắp Đặt:<b> ${data.address}</b>
                                </p> 
                                <p style="margin: 0;">
                                    Tên Camera: <b> ${data.name}</b>
                                </p>
                                <iframe id='fp_embed_player' 
                                    src='https://demo.flashphoner.com:8888/embed_player?urlServer=wss://demo.flashphoner.com:8443&streamName=${data.link_stream}&mediaProviders=WebRTC' 
                                    marginwidth='0' marginheight='0' autoplay frameborder='0' width='100%' height='100%' scrolling='no' allowfullscreen='allowfullscreen'>
                                </iframe>
                                `
                break;
            case LAYER.TRAFFIC_LIGHT:
                name = "ĐÈN CHIẾU SÁNG";
                popupContent = `<p style="margin: 0;">
                                    ID Đèn Chiếu Sáng:<b> ${data.id}</b>
                                </p> 
                                <p style="margin: 0;">
                                    Tên Đèn Chiếu Sáng: <b> ${data.name}</b>
                                </p>
                                `;
                const deviceId = convertIdDevice(data.id);
                if (data.status) {
                    popupContent += `
                                        <p  id="status_${deviceId}" style="margin: 0;">
                                            Trạng Thái Hiện Tại: <img class="icon-light" src="/image/light-on.png" alt="ligth on">
                                        </p>
                                        <div id="btn_${deviceId}">
                                            <button  class="btn-secondary" 
                                                onclick="controlTrafficLight('${data.id}', false)" style="margin: 0;">
                                                TURN OFF
                                            </button>
                                        </div>`;

                } else {
                    popupContent += `
                                        <p  id="status_${deviceId}" style="margin: 0;">
                                            Trạng Thái Hiện Tại: <img class="icon-light" id="status_${deviceId}" src="/image/light-off.png" alt="ligth off">
                                        </p>
                                        <div id="btn_${deviceId}">
                                            <button class="btn-success" 
                                                onclick="controlTrafficLight('${data.id}', true)" style="margin: 0;">
                                                TURN ON
                                            </button>
                                        </div>`;
                }
                break;
            case LAYER.ELECTRICAL_CABINET:
                name = "TỦ ĐIỆN";
                popupContent = `<p style="margin: 0;">
                                    Tên Tủ Điện:<b> ${data.name}</b>
                                </p> 
                                <p style="margin: 0;">
                                    Địa Chỉ Lắp: <b> ${data.address}</b>
                                </p>
                                <p style="margin: 0;">
                                    Link Tài Liệu: <a target="_blank" href="${data.link_document}"> ${data.link_document}</a>
                                </p>`;
                break;
            case LAYER.TREE:
                name = "Cây";
                popupContent = `<p style="margin: 0;">
                                    Tên Cây:<b> ${data.name}</b>
                                </p> 
                            `;
                break;
            default:
                break;
        }
        var temp = {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    item.lon, item.lat
                ],
            },
            "typeLayer": item.type,
            "data": item.data,
            "featureName": name,
            "type": "Feature",
            "properties": {
                "popupContent": popupContent
            },
        };
        displayDataMaps.features.push(temp);
    });

    if (pinLayer != undefined) {
        map.removeLayer(pinLayer);
    };

    if (layerGeoJson) {
        clear_polyline(layerGeoJson);
    }


    layerGeoJson = L.geoJSON(displayDataMaps, {
        pointToLayer: function (feature, latlng) {
            return getFeatureIcon(latlng, feature.typeLayer, feature.data);
        },
        onEachFeature: onEachFeature
    }).addTo(map);
}

async function controlTrafficLight(deviceId, value) {
    countGetStatus = 0;
    const data = {
        deviceId,
        value,
    };
    currentDeviceId = deviceId;
    console.log('control =>', data);
    const result = await requestPromisePOST('/map_control', data);
}

async function saveData(layer) {
    var data = {
        lon: getValueByIdSelector(currentLayer + '_lon'),
        lat: getValueByIdSelector(currentLayer + '_lat'),
        type: currentLayer,
        data: getSaveData(currentLayer),
    };
    console.log("data insert => ", data);

    const result = await requestPromisePOST('/map_add', data);
    if (result.status == 200) {
        if (getValueByIdSelector('_id')) {
            alert("Cập nhật data thành công!!");
        } else {
            alert("Thêm data thành công!!");
        }

        getData();
    } else {
        // alert(result.message);
    }

}

async function deleteData() {

    var data = {
        _id: getValueByIdSelector('_id'),
    };
    if (!data._id) {
        alert("Data không tồn tại!");
        return;
    }

    var result = await requestPromisePOST('/map_delete', data);
    if (result.status == 200) {
        alert("Xóa tốc độ vào đường thành công!!");
        getData();
    } else {
        // alert(result.message);
    }
}

function clear_polyline(clearLayer) {
    map.removeLayer(clearLayer);
}

function getDataOne(lat, lon, type) {
    for (const dataMap of dataMaps) {
        if ((dataMap.type == type) && (dataMap.lat == lat) && (dataMap.lon == lon)) {
            return dataMap;
        }
    }
    return null;
}
