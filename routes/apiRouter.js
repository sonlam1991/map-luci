const express = require('express');
const router = express.Router();
const MapController = require('../controller/MapController');
const UploadController = require('../controller/UploadController');
const StreamController = require('../controller/StreamController');


////////////// Upload //////////////
const multer = require('multer');

const fileFilter = (req, file, cb) => {
    cb(null, true);
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

////////////// End Upload //////////////

// make sure logged and check permission
router.post('/map_add', MapController.addOrUpdate);
router.post('/map_list', MapController.mapList);
router.post('/map_delete', MapController.delete);
router.post('/map_control', MapController.mapControl);
router.post('/map_get_status', MapController.mapGetStatusDevice);

router.post('/fileupload', upload.single('file'), UploadController.upload);

router.post('/start_stream', StreamController.startStream);
router.post('/stop_stream', StreamController.stopStream);

module.exports = router;