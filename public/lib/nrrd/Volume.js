'use strict';

import {Matrix3} from './Matrix3.js';

class Volume {

    constructor( xLength, yLength, zLength, type, arrayBuffer ) {

        if ( arguments.length > 0 ) {
            this.xLength = Number( xLength ) || 1;
            this.yLength = Number( yLength ) || 1;
            this.zLength = Number( zLength ) || 1;

            switch ( type ) {
                case 'Uint8' :
                case 'uint8' :
                case 'uchar' :
                case 'unsigned char' :
                case 'uint8_t' :
                    this.data = new Uint8Array( arrayBuffer );
                    break;
                case 'Int8' :
                case 'int8' :
                case 'signed char' :
                case 'int8_t' :
                    this.data = new Int8Array( arrayBuffer );
                    break;
                case 'Int16' :
                case 'int16' :
                case 'short' :
                case 'short int' :
                case 'signed short' :
                case 'signed short int' :
                case 'int16_t' :
                    this.data = new Int16Array( arrayBuffer );
                    break;
                case 'Uint16' :
                case 'uint16' :
                case 'ushort' :
                case 'unsigned short' :
                case 'unsigned short int' :
                case 'uint16_t' :
                    this.data = new Uint16Array( arrayBuffer );
                    break;
                case 'Int32' :
                case 'int32' :
                case 'int' :
                case 'signed int' :
                case 'int32_t' :
                    this.data = new Int32Array( arrayBuffer );
                    break;
                case 'Uint32' :
                case 'uint32' :
                case 'uint' :
                case 'unsigned int' :
                case 'uint32_t' :
                    this.data = new Uint32Array( arrayBuffer );
                    break;
                case 'longlong' :
                case 'long long' :
                case 'long long int' :
                case 'signed long long' :
                case 'signed long long int' :
                case 'int64' :
                case 'int64_t' :
                case 'ulonglong' :
                case 'unsigned long long' :
                case 'unsigned long long int' :
                case 'uint64' :
                case 'uint64_t' :
                    throw 'Error in Volume constructor : this type is not supported in JavaScript';
                    break;
                case 'Float32' :
                case 'float32' :
                case 'float' :
                    this.data = new Float32Array( arrayBuffer );
                    break;
                case 'Float64' :
                case 'float64' :
                case 'double' :
                    this.data = new Float64Array( arrayBuffer );
                    break;
                default :
                    this.data = new Uint8Array( arrayBuffer );

            }

            if ( this.data.length !== this.xLength * this.yLength * this.zLength ) {
                throw 'Error in Volume constructor, lengths are not matching arrayBuffer size';
            }
        }

        this.spacing = [ 1, 1, 1 ];
        this.offset = [ 0, 0, 0 ];
        this.matrix = new Matrix3();
        this.matrix.identity();
    }


    computeMinMax () {
        let min = Infinity;
        let max = - Infinity;

        // buffer the length
        let dataSize = this.data.length;
        for ( let i = 0; i < dataSize; i ++ ) {
            if ( ! isNaN( this.data[ i ] ) ) {
                let value = this.data[ i ];
                min = Math.min( min, value );
                max = Math.max( max, value );
            }
        }
        this.min = min;
        this.max = max;
        return [ min, max ];
    }


}

export { Volume };
