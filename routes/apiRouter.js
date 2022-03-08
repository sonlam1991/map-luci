const express = require('express');
const router = express.Router();
const MapController = require('../controller/MapController');

// make sure logged and check permission
router.post('/map_add', MapController.addOrUpdate);
router.post('/map_list', MapController.mapList);
router.post('/map_delete', MapController.delete);
router.post('/map_control', MapController.mapControl);
router.post('/map_get_status', MapController.mapGetStatusDevice);

module.exports = router;