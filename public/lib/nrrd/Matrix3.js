'use strict';

class Matrix3 {
    constructor() {
        this.elements = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];

        this.isMatrix3 = true;
    }

    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
        let te = this.elements;
        te[0] = n11;
        te[1] = n21;
        te[2] = n31;
        te[3] = n12;
        te[4] = n22;
        te[5] = n32;
        te[6] = n13;
        te[7] = n23;
        te[8] = n33;
    }

    identity() {
        this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
    }
}

export {Matrix3};
