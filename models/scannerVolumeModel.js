const mongoose = require('mongoose');

const scannerVolumeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Scanner volume must have name'],
            unique: true,
            trim: true
        },
        width: {
            type: Number,
            required: [true, 'Scanner volume must have width']
        },
        height: {
            type: Number,
            required: [true, 'Scanner volume must have height']
        },
        depth: {
            type: Number,
            required: [true, 'Scanner volume must have depth']
        },
        dataFileName: {
            type: String,
            required: [true, 'Scanner volume must have dataFileName']
        }
    }
);


const ScannerVolume = mongoose.model('ScannerVolume', scannerVolumeSchema);

module.exports = ScannerVolume;