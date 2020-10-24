'use strict';

class ServerSegmentationVolume {
    constructor(name, width, height, depth, segments, dataFileName) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.segments = !!segments ? segments : [];
        this.dataFileName = dataFileName;
    }
}