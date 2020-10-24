const mongoose = require('mongoose');


const segmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Segment must have a name'],
            trim: true
        },
        label: {
            type: Number,
            required: [true, 'Segment must have a label'],
            trim: true
        },
        rgbValues: {
            type: [Number],
            required: [true, 'Segment must have rgbValues']
        }
    }
);

const segmentationVolumeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Segmentation volume must have name'],
            unique: true,
            trim: true
        },
        width: {
            type: Number,
            required: [true, 'Segmentation volume must have width']
        },
        height: {
            type: Number,
            required: [true, 'Segmentation volume must have height']
        },
        depth: {
            type: Number,
            required: [true, 'Segmentation volume must have depth']
        },
        segments: {
            type: [segmentSchema],
            required: [true, 'Segmentation volume must have segments']
        },
        dataFileName: {
            type: String,
            required: [true, 'Segmentation volume must have dataFileName']
        }
    }
);


const SegmentationVolume = mongoose.model('SegmentationVolume', segmentationVolumeSchema);

module.exports = SegmentationVolume;
