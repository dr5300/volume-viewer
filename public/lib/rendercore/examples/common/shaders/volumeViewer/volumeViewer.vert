#version 300 es
precision mediump float;


uniform mat4 VMat;
uniform mat4 MVMat; // Model View Matrix
uniform mat4 PMat;  // Projection Matrix
uniform mat3 NMat;  // Normal Matrix

in mat4 MMat;
in vec3 VPos;       // Vertex position
in vec3 VNorm;      // Vertex normal



#if (TEXTURE3D)
    in vec3 uvw;                  // Texture coordinate
    uniform vec3 uvwTranslation;
    uniform vec3 uvwScale;
    out vec3 fragUVW;
#fi

// Output transformed vertex position, normal and texture coordinate
out vec3 fragVPos;
out vec3 fragVNorm;

void main() {
    // Model view position
    //vec4 VPos4 = MVMat * vec4(VPos, 1.0); //original (non-instanced)
    #if (!INSTANCED)
    vec4 VPos4 = MVMat * vec4(VPos, 1.0);
    #fi
    #if (INSTANCED)
    vec4 VPos4 = VMat * MMat * vec4(VPos, 1.0);
    #fi

    // Projected position
    gl_Position = PMat * VPos4;
    fragVPos = vec3(VPos4) / VPos4.w;

    // Transform normal
    fragVNorm = vec3(NMat * VNorm);

    #if (TEXTURE3D)
        fragUVW = (uvw * uvwScale) + uvwTranslation;
    #fi
}