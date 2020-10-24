/**
 * Created by Denis Rajkovic
 */

import {_Math} from '../math/Math.js';
import * as RC from '../RenderCore.js';

export class Texture3D {

    constructor(level,
                internalFormat,
                width,
                height,
                depth,
                border,
                format,
                type,
                pixels,
                magFilter,
                minFilter,
                wrapS,
                wrapT,
                wrapR) {

        this._level = level ? level : 0;
        this._internalFormat = internalFormat ? internalFormat : RC.Texture.RGBA; // damo kaj drugega za default?
        this._width = width ? width : 0;
        this._height = height ? height : 0;
        this._depth = depth ? depth : 0;
        this._border = border ? border : 0;
        this._format = format ? format : RC.Texture.RGBA; // damo kaj drugega za default?
        this._type = type ? type : RC.Texture.FLOAT;
        this._pixels = pixels ? pixels : null;

        // Filters
        this._magFilter = magFilter ? magFilter : RC.Texture.NearestFilter;
        this._minFilter = minFilter ? minFilter : RC.Texture.NearestFilter;

        // Wrapping
        this._wrapS = wrapS ? wrapS : RC.Texture.ClampToEdgeWrapping;
        this._wrapT = wrapT ? wrapT : RC.Texture.ClampToEdgeWrapping;
        this._wrapR = wrapR ? wrapR : RC.Texture.ClampToEdgeWrapping;

        // other
        this._uuid = _Math.generateUUID();
        this._generateMipmaps = false;
        this._dirty = true;

        this._textureSubImage3D = {};
        this._dirtyTextureSubImage3D = false;
    }

    /////////////////////////
    // GETTERS
    /////////////////////////

    get level() {
        return this._level;
    }

    get internalFormat() {
        return this._internalFormat;
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

    get border() {
        return this._border;
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

    get magFilter() {
        return this._magFilter;
    }

    get minFilter() {
        return this._minFilter;
    }

    get wrapS() {
        return this._wrapS;
    }

    get wrapT() {
        return this._wrapT;
    }

    get wrapR() {
        return this._wrapR;
    }

    get dirty() {
        return this._dirty;
    }

    get textureSubImage3D() {
        return this._textureSubImage3D;
    }

    get dirtyTextureSubImage3D() {
        return this._dirtyTextureSubImage3D;
    }

    /////////////////////////
    // SETTERS
    /////////////////////////

    set level(value) {
        if (value !== this._level) {
            this._level = value;
            this._dirty = true;
        }
    }

    set internalFormat(value) {
        if (value !== this._internalFormat) {
            this._internalFormat = value;
            this._dirty = true;
        }
    }

    set width(value) {
        if (value !== this._width) {
            this._width = value;
            this._dirty = true;
        }
    }

    set height(value) {
        if (value !== this._height) {
            this._height = value;
            this._dirty = true;
        }
    }

    set depth(value) {
        if (value !== this._depth) {
            this._depth = value;
            this._dirty = true;
        }
    }

    set border(value) {
        if (value !== this._border) {
            this._border = value;
            this._dirty = true;
        }
    }

    set format(value) {
        if (value !== this._format) {
            this._format = value;
            this._dirty = true;
        }
    }

    set type(value) {
        if (value !== this._type) {
            this._type = value;
            this._dirty = true;
        }
    }

    set pixels(value) {
        if (value !== this._pixels) {
            this._pixels = value;
            this._dirty = true;
        }
    }

    set magFilter(value) {
        if (value !== this._magFilter) {
            this._magFilter = value;
            this._dirty = true;
        }
    }

    set minFilter(value) {
        if (value !== this._minFilter) {
            this._minFilter = value;
            this._dirty = true;
        }
    }

    set wrapS(value) {
        if (value !== this._wrapS) {
            this._wrapS = value;
            this._dirty = true;
        }
    }

    set wrapT(value) {
        if (value !== this._wrapT) {
            this._wrapT = value;
            this._dirty = true;
        }
    }

    set wrapR(value) {
        if (value !== this._wrapR) {
            this._wrapR = value;
            this._dirty = true;
        }
    }

    set dirty(value) {
        this._dirty = value;
    }


    set textureSubImage3D(value) {
        if (value) {
            this._textureSubImage3D = value;
            this._dirtyTextureSubImage3D = true;
        }
    }

    set dirtyTextureSubImage3D(value) {
        this._dirtyTextureSubImage3D = value;
    }

    applyConfig(texConfig) {
        this.wrapS = texConfig.wrapS;
        this.wrapT = texConfig.wrapT;
        this.minFilter = texConfig.minFilter;
        this.magFilter = texConfig.magFilter;
        this.internalFormat = texConfig.internalFormat;
        this.format = texConfig.format;
        this.type = texConfig.type;
    }
}
