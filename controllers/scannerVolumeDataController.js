const ScannerVolume = require('../models/scannerVolumeModel');
const fs = require('fs');
const scannerVolumeDataPath = './data/scannervolumes/';


exports.createScannerVolumeData = async (req, res) => {
    try {
        // check if scanner volume exists in database
        const scannerVolume = await ScannerVolume.findOne({name: req.params.name});
        if (!scannerVolume) {
            throw 'database does not contain scanner volume ' + req.params.name;
        }

        // write data to file
        await fs.writeFileSync(scannerVolumeDataPath + scannerVolume.dataFileName, req.body);

        res.status(200).json({
            status: 'succeeded to write data to file for scanner volume ' + req.params.name
        });

    } catch (err) {
        res.status(400).json({
            status: 'failed to write data to file for scanner volume ' + req.params.name,
            message: err
        });
    }
};


exports.getScannerVolumeData = async (req, res) => {
    try {

        // check if scanner volume exists in database
        const scannerVolume = await ScannerVolume.findOne({name: req.params.name});
        if (!scannerVolume) {
            throw new Error('database does not contain scanner volume ' + req.params.name);
        }

        const data = fs.readFileSync(scannerVolumeDataPath + scannerVolume.dataFileName);

        res.status(200).send(data);
    } catch (err) {
        res.status(404).json({
            status: 'failed to read data from file for scanner volume ' + req.params.name,
            message: err.message
        });
    }
};


exports.deleteScannerVolumeData = async (req, res) => {
    try {
        // check if scanner volume exists in database
        const scannerVolume = await ScannerVolume.findOne({name: req.params.name});
        if (!scannerVolume) {
            throw 'database does not contain scanner volume ' + req.params.name;
        }

        // delete data from file
        await fs.unlinkSync(scannerVolumeDataPath + scannerVolume.dataFileName);

        res.status(200).json({
            status: 'succeeded to delete data from file for scanner volume ' + req.params.name
        });

    } catch (err) {
        res.status(404).json({
            status: 'failed to delete data from file for scanner volume ' + req.params.name,
            message: err
        });
    }
};


