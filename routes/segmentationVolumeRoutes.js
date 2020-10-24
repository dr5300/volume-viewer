const express = require('express');
const segmentationVolumeController = require('../controllers/segmentationVolumeController');

const router = express.Router();

router
    .route('/')
    .get(segmentationVolumeController.getAllSegmentationVolumes)
    .post(segmentationVolumeController.createSegmentationVolume);

router
    .route('/:name')
    .get(segmentationVolumeController.getSegmentationVolume)
    .delete(segmentationVolumeController.deleteSegmentationVolume);

module.exports = router;