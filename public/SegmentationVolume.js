'use strict';

class SegmentationVolume {
    constructor(name, width, height, depth, segments) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.segments = !!segments ? segments : [];
    }
}