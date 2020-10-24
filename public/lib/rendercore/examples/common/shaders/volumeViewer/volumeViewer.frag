#version 300 es
precision mediump float;

#if (TEXTURE3D)
precision mediump sampler3D;
#fi



uniform bool uInvert;
uniform float uBrightness;
uniform float uContrast;
uniform bool uSobelOperator;
uniform float uMinThreshold;
uniform float uMaxThreshold;
uniform bool uThreshold;

uniform float uScannerOpacity;
uniform float uSegmentationOpacity;


struct Material {
    vec3 diffuse;
    vec3 specular;
    float shininess;

    #if (TEXTURE3D)
        #for I_TEX in 0 to NUM_TEX
            sampler3D texture##I_TEX;
        #end
    #fi
};


uniform vec3 ambient;
uniform Material material;

#if (TRANSPARENT)
uniform float alpha;
#else
float alpha = 1.0;
#fi


// From vertex shader
in vec3 fragVNorm;
in vec3 fragVPos;



#if (TEXTURE3D)
    in vec3 fragUVW;
#fi



out vec4 color[3];



float truncate(float v) {
    if (v < 0.0) {
        v = 0.0;
    } else if (v > 1.0) {
        v = 1.0;
    }
    return v;
}







void main() {
    #if (TEXTURE3D)
            vec4 scannerColor;
            float scannerAlpha = uScannerOpacity;
            float segmentationValue;
            vec4 segmentationColor;
            float segmentationAlpha = uSegmentationOpacity;


            // Apply all of the textures
            #for I_TEX in 0 to 1
            vec4 scannerRedColor = texture(material.texture##I_TEX, fragUVW);
            float scannerValue = scannerRedColor.r;

            // INVERT
            if (uInvert) {
                scannerValue = 1.0 - scannerValue;
            }

            // BRIGHTNESS
            float b = scannerValue + 1.0 * (uBrightness / 100.0);
            scannerValue = truncate(b);

            // CONTRAST
            float f = (1.015 * (1.0 + (uContrast / 100.0))) / (1.0 * (1.015 - (uContrast / 100.0)));
            float c = f * (scannerValue - 0.5) + 0.5;
            scannerValue = truncate(c);


            // SOBEL OPERATOR
            if (uSobelOperator) {
                ivec3 textureSizes = textureSize(material.texture##I_TEX, 0);
                float textureWidth = float(textureSizes.x);
                float n = textureWidth;
                vec3 p = fragUVW;

                float p0 = (texture(material.texture##I_TEX, (p + vec3(-1.0, -1.0, 0.0) / n))).r;
                float p1 = (texture(material.texture##I_TEX, (p + vec3(0.0, -1.0, 0.0) / n))).r;
                float p2 = (texture(material.texture##I_TEX, (p + vec3(1.0, -1.0, 0.0) / n))).r;

                float p3 = (texture(material.texture##I_TEX, (p + vec3(-1.0, 0.0, 0.0) / n))).r;
                float p5 = (texture(material.texture##I_TEX, (p + vec3(1.0, 0.0, 0.0) / n))).r;

                float p6 = (texture(material.texture##I_TEX, (p + vec3(-1.0, 1.0, 0.0) / n))).r;
                float p7 = (texture(material.texture##I_TEX, (p + vec3(0.0, 1.0, 0.0) / n))).r;
                float p8 = (texture(material.texture##I_TEX, (p + vec3(1.0, 1.0, 0.0) / n))).r;

                float gx = -p0 + p2 - 2.0 * p3 + 2.0 * p5 - p6 + p8;
                float gy = -p0 - 2.0 * p1 - p2 + p6 + 2.0 * p7 + p8;
                float g = length(vec2(gx, gy));

                if (uInvert) {
                    scannerValue = truncate(g);
                } else {
                    scannerValue = 1.0 - truncate(g);
                }
            }


            if(uThreshold) {
                // MIN THRESHOLD
                if (scannerValue <= uMinThreshold) {
                    scannerValue = 0.0;
                }
                // MAX THRESHOLD
                else if (scannerValue > uMaxThreshold) {
                    scannerValue = 0.0;
                } else {
                    scannerValue = 1.0;
                }
            }


            scannerColor = vec4(scannerValue, scannerValue, scannerValue, 1.0);
        #end


        #for I_TEX in 1 to 2
            vec4 segmentationValues = texture(material.texture##I_TEX, fragUVW);
            float segmentationValueR = segmentationValues.r / 255.0;
            float segmentationValueG = segmentationValues.g / 255.0;
            float segmentationValueB = segmentationValues.b / 255.0;

            segmentationValue = segmentationValueR + segmentationValueG + segmentationValueB;
            segmentationColor = vec4(segmentationValueR, segmentationValueG, segmentationValueB, 1.0);
        #end


        if (segmentationValue <= 0.0) {
             segmentationAlpha = 0.0;
        }
        color[0] = segmentationAlpha * segmentationColor + (1.0 - segmentationAlpha) * (scannerColor * scannerAlpha);
    #fi

    vec3 normal = normalize(fragVNorm);
    color[1] = vec4(normal, 1.0);

    color[2] = vec4(abs(fragVPos), 1.0);
}