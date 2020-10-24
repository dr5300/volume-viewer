/**
 * Created by Denis Rajkovic
 */

import * as RC from '../RenderCore.js';


export class TextureSubImage3D {

    constructor(level,
                xoffset,
                yoffset,
                zoffset,
                width,
                height,
                depth,
                format,
                type,
                pixels) {

        this._level = level ? level : 0;
        this._xoffset = xoffset ? xoffset : 0;
        this._yoffset = yoffset ? yoffset : 0;
        this._zoffset = zoffset ? zoffset : 0;
        this._width = width ? width : 0;
        this._height = height ? height : 0;
        this._depth = depth ? depth : 0;
        this._format = format ? format : RC.Texture.RGBA;
        this._type = type ? type : RC.Texture.FLOAT;
        this._pixels = pixels ? pixels : null;
    }

    get level() {
        return this._level;
    }

    get xoffset() {
        return this._xoffset;
    }

    get yoffset() {
        return this._yoffset;
    }

    get zoffset() {
        return this._zoffset;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get depth() {
        return this._depth;
    }

    get format() {
        return this._format;
    }

    get type() {
        return this._type;
    }

    get pixels() {
        return this._pixels;
    }
}