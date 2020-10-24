const express = require('express');
const segmentationVolumeDataController = require('../controllers/segmentationVolumeDataController');

const router = express.Router();

router
    .route('/:name')
    .post(segmentationVolumeDataController.createSegmentationVolumeData)
    .get(segmentationVolumeDataController.getSegmentationVolumeData)
    .delete(segmentationVolumeDataController.deleteSegmentationVolumeData);

module.exports = router;