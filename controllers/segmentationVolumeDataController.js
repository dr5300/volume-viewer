const SegmentationVolume = require('../models/segmentationVolumeModel');
const fs = require('fs');
const segmentationVolumeDataPath = './data/segmentationvolumes/';


exports.createSegmentationVolumeData = async (req, res) => {
    try {
        // check if segmentation volume exists in database
        const segmentationVolume = await SegmentationVolume.findOne({name: req.params.name});
        if (!segmentationVolume) {
            throw 'database does not contain segmentation volume ' + req.params.name;
        }

        // write data to file
        await fs.writeFileSync(segmentationVolumeDataPath + segmentationVolume.dataFileName, req.body);

        res.status(200).json({
            status: 'succeeded to write data to file for segmentation volume ' + req.params.name
        });

    } catch (err) {
        res.status(400).json({
            status: 'failed to write data to file for segmentation volume ' + req.params.name,
            message: err
        });
    }
};


exports.getSegmentationVolumeData = async (req, res) => {
    try {

        // check if segmentation volume exists in database
        const segmentationVolume = await SegmentationVolume.findOne({name: req.params.name});
        if (!segmentationVolume) {
            throw 'database does not contain segmentation volume ' + req.params.name;
        }

        // read data from file
        const data = await fs.readFileSync(segmentationVolumeDataPath + segmentationVolume.dataFileName);

        res.status(200).send(data);

    } catch (err) {
        res.status(404).json({
            status: 'failed to read data from file for segmentation volume ' + req.params.name,
            message: err
        });
    }
};


exports.deleteSegmentationVolumeData = async (req, res) => {
    try {
        // check if segmentation volume exists in database
        const segmentationVolume = await SegmentationVolume.findOne({name: req.params.name});
        if (!segmentationVolume) {
            throw 'database does not contain segmentation volume ' + req.params.name;
        }

        // delete data from file
        await fs.unlinkSync(segmentationVolumeDataPath + segmentationVolume.dataFileName);

        res.status(200).json({
            status: 'succeeded to delete data from file for segmentation volume ' + req.params.name
        });

    } catch (err) {
        res.status(404).json({
            status: 'failed to delete data from file for segmentation volume ' + req.params.name,
            message: err
        });
    }
};


