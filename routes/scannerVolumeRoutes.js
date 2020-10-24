const express = require('express');
const scannerVolumeController = require('../controllers/scannerVolumeController');

const router = express.Router();

router
    .route('/')
    .get(scannerVolumeController.getAllScannerVolumes)
    .post(scannerVolumeController.createScannerVolume);

router
    .route('/:name')
    .get(scannerVolumeController.getScannerVolume)
    .delete(scannerVolumeController.deleteScannerVolume);

module.exports = router;