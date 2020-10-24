const express = require('express');
const scannerVolumeDataController = require('../controllers/scannerVolumeDataController');

const router = express.Router();

router
    .route('/:name')
    .post(scannerVolumeDataController.createScannerVolumeData)
    .get(scannerVolumeDataController.getScannerVolumeData)
    .delete(scannerVolumeDataController.deleteScannerVolumeData);

module.exports = router;