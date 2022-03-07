const express = require('express');
const router = express.Router();
const SpeedController = require('../controller/SpeedController');
const RoutingController = require('../controller/RoutingController');

// make sure logged and check permission

router.post('/speed', SpeedController.addOrUpdate);
router.post('/speed_list', SpeedController.speedList);
router.post('/speed_delete', SpeedController.delete);
router.post('/speed_change_delete', SpeedController.deleteSpeedChange);

router.post('/speed/convert', SpeedController.speedConvert);

router.post('/speeds', SpeedController.speeds);

router.post('/routing', RoutingController.routing);

module.exports = router;