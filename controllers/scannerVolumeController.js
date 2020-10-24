const ScannerVolume = require('../models/scannerVolumeModel');
const fs = require('fs');

exports.getAllScannerVolumes = async (req, res) => {
    try {
        const scannerVolumes = await ScannerVolume.find();
        res.status(200).json({
            status: 'succeeded to get all scanner volumes',
            count: scannerVolumes.length,
            data: {
                scannerVolumes
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'failed to get all scanner volumes',
            message: err
        });
    }
};


exports.createScannerVolume = async (req, res) => {
    try {
        const newScannerVolume = await ScannerVolume.create(req.body);
        res.status(200).json({
            status: 'succeeded to create new scanner volume ' + req.body.name,
            data: {
                newScannerVolume
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'failed to create new scanner volume ' + req.body.name,
            message: err
        });
    }
};


exports.getScannerVolume = async (req, res) => {
    try {
        const scannerVolume = await ScannerVolume.findOne({name: req.params.name});
        res.status(200).json({
            status: 'succeeded to get scanner volume ' + req.params.name,
            data: {
                scannerVolume
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'failed to get scanner volume ' + req.params.name,
            message: err
        });
    }
};

exports.deleteScannerVolume = async (req, res) => {
    try {
        await ScannerVolume.findOneAndDelete({name: req.params.name});
        res.status(200).json({
            status: 'succeeded to delete scanner volume ' + req.params.name,
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: 'failed to delete scanner volume ' + req.params.name,
            message: err
        });
    }
};


