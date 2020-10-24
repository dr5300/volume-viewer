'use strict';

import {Vector3} from './Vector3.js';
import {Matrix4} from './Matrix4.js';
import {Volume} from './Volume.js';
import {Zlib} from './gunzip.module.min.js';


class NRRDReader {
    constructor() {
        this.crossOrigin = 'anonymous';
        this.path = '';
        this.resourcePath = '';
    }


//// parse functions start

    _scan(type, chunks, _data, _dataPointer, _nativeLittleEndian, _littleEndian) {
        if (chunks === undefined || chunks === null) {
            chunks = 1;
        }

        let _chunkSize = 1;
        let _array_type = Uint8Array;

        switch (type) {

            // 1 byte data types
            case 'uchar':
                break;
            case 'schar':
                _array_type = Int8Array;
                break;
            // 2 byte data types
            case 'ushort':
                _array_type = Uint16Array;
                _chunkSize = 2;
                break;
            case 'sshort':
                _array_type = Int16Array;
                _chunkSize = 2;
                break;
            // 4 byte data types
            case 'uint':
                _array_type = Uint32Array;
                _chunkSize = 4;
                break;
            case 'sint':
                _array_type = Int32Array;
                _chunkSize = 4;
                break;
            case 'float':
                _array_type = Float32Array;
                _chunkSize = 4;
                break;
            case 'complex':
                _array_type = Float64Array;
                _chunkSize = 8;
                break;
            case 'double':
                _array_type = Float64Array;
                _chunkSize = 8;
                break;

        }

        // increase the data pointer in-place
        let _bytes = new _array_type(_data.slice(_dataPointer, _dataPointer += chunks * _chunkSize));

        // if required, flip the endianness of the bytes
        if (_nativeLittleEndian != _littleEndian) {
            // we need to flip here since the format doesn't match the native endianness
            _bytes = this._flipEndianness(_bytes, _chunkSize);
        }

        if (chunks == 1) {
            // if only one chunk was requested, just return one value
            return _bytes[0];
        }

        // return the byte array
        return _bytes;
    }

    //Flips typed array endianness in-place. Based on https://github.com/kig/DataStream.js/blob/master/DataStream.js.
    _flipEndianness(array, chunkSize) {
        let u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
        for (let i = 0; i < array.byteLength; i += chunkSize) {

            for (let j = i + chunkSize - 1, k = i; j > k; j--, k++) {

                let tmp = u8[k];
                u8[k] = u8[j];
                u8[j] = tmp;

            }
        }
        return array;
    }

    //parse the header
    _parseHeader(header, headerObject) {
        let data, field, fn, i, l, lines, m, _i, _len;
        lines = header.split(/\r?\n/);
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
            l = lines[_i];
            if (l.match(/NRRD\d+/)) {
                headerObject.isNrrd = true;
            } else if (l.match(/^#/)) {
            } else if (m = l.match(/(.*):(.*)/)) {
                field = m[1].trim();
                data = m[2].trim();


                if (field === 'type') {
                    this.type(headerObject, data);
                } else if (field === 'endian') {
                    this.endian(headerObject, data);
                } else if (field === 'encoding') {
                    this.encoding(headerObject, data);
                } else if (field === 'dimension') {
                    this.dimension(headerObject, data);
                } else if (field === 'sizes') {
                    this.sizes(headerObject, data);
                } else if (field === 'space') {
                    this.space(headerObject, data);
                } else if (field === 'space origin') {
                    this.space_origin(headerObject, data);
                } else if (field === 'space directions') {
                    this.space_directions(headerObject, data);
                } else if (field === 'spacings') {
                    this.spacings(headerObject, data);
                } else {
                    headerObject[field] = data;
                }
            }

        }
        if (!headerObject.isNrrd) {
            throw new Error('Not an NRRD file');
        }
        if (headerObject.encoding === 'bz2' || headerObject.encoding === 'bzip2') {
            throw new Error('Bzip is not supported');
        }
        if (!headerObject.vectors) {
            //if no space direction is set, let's use the identity
            headerObject.vectors = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
            //apply spacing if defined
            if (headerObject.spacings) {
                for (i = 0; i <= 2; i++) {
                    if (!isNaN(headerObject.spacings[i])) {
                        headerObject.vectors[i].multiplyScalar(headerObject.spacings[i]);
                    }
                }
            }
        }
    }

    //parse the data when registred as one of this type : 'text', 'ascii', 'txt'
    _parseDataAsText(data, start, end, headerObject) {
        let number = '';
        start = start || 0;
        end = end || data.length;
        let value;
        //length of the result is the product of the sizes
        let lengthOfTheResult = headerObject.sizes.reduce(function (previous, current) {
            return previous * current;
        }, 1);

        let base = 10;
        if (headerObject.encoding === 'hex') {
            base = 16;
        }

        let result = new headerObject.__array(lengthOfTheResult);
        let resultIndex = 0;
        let parsingFunction = parseInt;

        if (headerObject.__array === Float32Array || headerObject.__array === Float64Array) {
            parsingFunction = parseFloat;
        }

        for (let i = start; i < end; i++) {
            value = data[i];
            //if value is not a space
            if ((value < 9 || value > 13) && value !== 32) {
                number += String.fromCharCode(value);
            } else {
                if (number !== '') {
                    result[resultIndex] = parsingFunction(number, base);
                    resultIndex++;
                }
                number = '';
            }
        }

        if (number !== '') {
            result[resultIndex] = parsingFunction(number, base);
            resultIndex++;
        }
        return result;
    }

//// parse functions end


//// field functions start

    type(obj, data) {
        switch (data) {
            case 'uchar':
            case 'unsigned char':
            case 'uint8':
            case 'uint8_t':
                obj.__array = Uint8Array;
                break;
            case 'signed char':
            case 'int8':
            case 'int8_t':
                obj.__array = Int8Array;
                break;
            case 'short':
            case 'short int':
            case 'signed short':
            case 'signed short int':
            case 'int16':
            case 'int16_t':
                obj.__array = Int16Array;
                break;
            case 'ushort':
            case 'unsigned short':
            case 'unsigned short int':
            case 'uint16':
            case 'uint16_t':
                obj.__array = Uint16Array;
                break;
            case 'int':
            case 'signed int':
            case 'int32':
            case 'int32_t':
                obj.__array = Int32Array;
                break;
            case 'uint':
            case 'unsigned int':
            case 'uint32':
            case 'uint32_t':
                obj.__array = Uint32Array;
                break;
            case 'float':
                obj.__array = Float32Array;
                break;
            case 'double':
                obj.__array = Float64Array;
                break;
            default:
                throw new Error('Unsupported NRRD data type: ' + data);

        }
        return obj.type = data;
    }

    endian(obj, data) {
        return obj.endian = data;
    }

    encoding(obj, data) {
        return obj.encoding = data;
    }

    dimension(obj, data) {
        return obj.dim = parseInt(data, 10);
    }

    sizes(obj, data) {
        return obj.sizes = (function () {
            let _i, _len, _ref, _results;
            _ref = data.split(/\s+/);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                let i = _ref[_i];
                _results.push(parseInt(i, 10));
            }
            return _results;
        })();
    }

    space(obj, data) {
        return obj.space = data;
    }

    space_origin(obj, data) {
        return obj.space_origin = data.split("(")[1].split(")")[0].split(",");
    }

    space_directions(obj, data) {
        let f, parts, v;
        parts = data.match(/\(.*?\)/g);

        return obj.vectors = (function () {
            let _i, _len, _results;
            _results = [];
            for (_i = 0, _len = parts.length; _i < _len; _i++) {
                v = parts[_i];
                _results.push((function () {
                    let _j, _len2, _ref, _results2;
                    _ref = v.slice(1, -1).split(/,/);
                    _results2 = [];
                    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                        f = _ref[_j];
                        _results2.push(parseFloat(f));
                    }
                    return _results2;
                })());
            }
            return _results;
        })();
    }

    spacings(obj, data) {
        let f, parts;
        parts = data.split(/\s+/);

        return obj.spacings = (function () {
            let _i, _len, _results = [];
            for (_i = 0, _len = parts.length; _i < _len; _i++) {
                f = parts[_i];
                _results.push(parseFloat(f));
            }
            return _results;
        })();
    }

//// field functions end


    parse(data) {

        // this parser is largely inspired from the XTK NRRD parser : https://github.com/xtk/X
        let _data = data;
        let _dataPointer = 0;
        let _nativeLittleEndian = new Int8Array(new Int16Array([1]).buffer)[0] > 0;
        let _littleEndian = true;
        let headerObject = {};

        let _bytes = this._scan('uchar', data.byteLength, _data, _dataPointer, _nativeLittleEndian, _littleEndian);
        let _length = _bytes.length;
        let _header = null;
        let _data_start = 0;
        let i;
        for (i = 1; i < _length; i++) {
            if (_bytes[i - 1] == 10 && _bytes[i] == 10) {
                // we found two line breaks in a row
                // now we know what the header is
                _header = this.parseChars(_bytes, 0, i - 2);
                // this is were the data starts
                _data_start = i + 1;
                break;
            }
        }

        // parse the header
        this._parseHeader(_header, headerObject);

        _data = _bytes.subarray(_data_start); // the data without header
        if (headerObject.encoding === 'gzip' || headerObject.encoding === 'gz') {
            // we need to decompress the datastream
            // here we start the unzipping and get a typed Uint8Array back
            let inflate = new Zlib.Gunzip(new Uint8Array(_data)); // eslint-disable-line no-undef
            _data = inflate.decompress();
        } else if (headerObject.encoding === 'ascii' || headerObject.encoding === 'text' || headerObject.encoding === 'txt' || headerObject.encoding === 'hex') {
            _data = this._parseDataAsText(_data);
        } else if (headerObject.encoding === 'raw') {
            //we need to copy the array to create a new array buffer, else we retrieve the original arraybuffer with the header
            let _copy = new Uint8Array(_data.length);
            for (let i = 0; i < _data.length; i++) {
                _copy[i] = _data[i];
            }
            _data = _copy;
        }

        // .. let's use the underlying array buffer
        _data = _data.buffer;

        let volume = new Volume();
        volume.header = headerObject;
        //
        // parse the (unzipped) data to a datastream of the correct type
        //
        volume.data = new headerObject.__array(_data);
        // get the min and max intensities
        let min_max = volume.computeMinMax();
        let min = min_max[0];
        let max = min_max[1];
        // attach the scalar range to the volume
        volume.windowLow = min;
        volume.windowHigh = max;

        // get the image dimensions
        volume.dimensions = [headerObject.sizes[0], headerObject.sizes[1], headerObject.sizes[2]];
        volume.xLength = volume.dimensions[0];
        volume.yLength = volume.dimensions[1];
        volume.zLength = volume.dimensions[2];
        // spacing
        let spacingX = (new Vector3(headerObject.vectors[0][0], headerObject.vectors[0][1],
            headerObject.vectors[0][2])).length();
        let spacingY = (new Vector3(headerObject.vectors[1][0], headerObject.vectors[1][1],
            headerObject.vectors[1][2])).length();
        let spacingZ = (new Vector3(headerObject.vectors[2][0], headerObject.vectors[2][1],
            headerObject.vectors[2][2])).length();
        volume.spacing = [spacingX, spacingY, spacingZ];


        // Create IJKtoRAS matrix
        volume.matrix = new Matrix4();

        let _spaceX = 1;
        let _spaceY = 1;
        let _spaceZ = 1;

        if (headerObject.space == "left-posterior-superior") {
            _spaceX = -1;
            _spaceY = -1;
        } else if (headerObject.space === 'left-anterior-superior') {
            _spaceX = -1;
        }


        if (!headerObject.vectors) {
            volume.matrix.set(
                _spaceX, 0, 0, 0,
                0, _spaceY, 0, 0,
                0, 0, _spaceZ, 0,
                0, 0, 0, 1);
        } else {
            let v = headerObject.vectors;
            volume.matrix.set(
                _spaceX * v[0][0], _spaceX * v[1][0], _spaceX * v[2][0], 0,
                _spaceY * v[0][1], _spaceY * v[1][1], _spaceY * v[2][1], 0,
                _spaceZ * v[0][2], _spaceZ * v[1][2], _spaceZ * v[2][2], 0,
                0, 0, 0, 1);
        }

        volume.inverseMatrix = new Matrix4();
        volume.inverseMatrix.getInverse(volume.matrix);
        volume.RASDimensions = (new Vector3(volume.xLength, volume.yLength, volume.zLength)).applyMatrix4(volume.matrix).round().toArray().map(Math.abs);

        // .. and set the default threshold
        // only if the threshold was not already set
        if (volume.lowerThreshold === -Infinity) {
            volume.lowerThreshold = min;
        }
        if (volume.upperThreshold === Infinity) {
            volume.upperThreshold = max;
        }

        return volume;
    }

    parseChars(array, start, end) {
        // without borders, use the whole array
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = array.length;
        }

        let output = '';
        // create and append the chars
        for (let i = start; i < end; ++i) {
            output += String.fromCharCode(array[i]);
        }

        return output;
    }

    setCrossOrigin(crossOrigin) {
        this.crossOrigin = crossOrigin;
    };

    setPath(path) {
        this.path = path;
    };

    setResourcePath(resourcePath) {
        this.resourcePath = resourcePath;
    }
}

export {NRRDReader};

