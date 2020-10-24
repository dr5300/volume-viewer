const SegmentationVolume = require('../models/segmentationVolumeModel');
const fs = require('fs');


exports.getAllSegmentationVolumes = async (req, res) => {
    try {
        const segmentationVolumes = await SegmentationVolume.find();
        res.status(200).json({
            status: 'succeeded to get all segmentation volumes',
            count: segmentationVolumes.length,
            data: {
                segmentationVolumes
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'failed to get all segmentation volumes',
            message: err
        });
    }
};


exports.createSegmentationVolume = async (req, res) => {
    try {
        const newSegmentationVolume = await SegmentationVolume.create(req.body);
        res.status(200).json({
            status: 'succeeded to create new segmentation volume ' + req.body.name,
            data: {
                newSegmentationVolume
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'failed to create new segmentation volume ' + req.body.name,
            message: err
        });
    }
};


exports.getSegmentationVolume = async (req, res) => {
    try {
        const segmentationVolume = await SegmentationVolume.findOne({name: req.params.name});
        res.status(200).json({
            status: 'succeeded to get segmentation volume ' + req.params.name,
            data: {
                segmentationVolume
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'failed to get segmentation volume ' + req.params.name,
            message: err
        });
    }
};


exports.deleteSegmentationVolume = async (req, res) => {
    try {
        await SegmentationVolume.findOneAndDelete({name: req.params.name});
        res.status(200).json({
            status: 'succeeded to delete segmentation volume ' + req.params.name,
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: 'failed to delete segmentation volume ' + req.params.name,
            message: err
        });
    }
};


