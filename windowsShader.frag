#version 150
#define TWO_PI 6.28318530718

uniform sampler2DRect tex0;
in vec2 texCoordVarying;
out vec4 outputColor;
uniform vec2 window;
uniform mat4 mainParameters;
uniform vec3 extraParameters;
uniform vec4 distribution;
uniform vec3 color;
//vec2 decenterNormalized;
float pixel;
/*
float unipolar(float value){
    return value * 0.5 + 0.5;
}

vec3 unipolar(vec3 value){
    return value * 0.5 + 0.5;
}
*/
float getAmplitude(float inA, float inB, float normal){
    return pow(1.0 - abs(inA - normal) * (1.0 - abs(inA - 0.5)) * inB, inB);
}

vec2 bipolar(vec2 value){
    return (value - 0.5) * 2.0;
}

void main()
{
    pixel = window.x * window.y;
    vec2 normalized = gl_FragCoord.xy / window;
    //vec2 decenterNormalized = abs(0.5 - normalized) * 2.0;
    float amplitudeX = getAmplitude(mainParameters[1][1], mainParameters[1][3], normalized.x);
    float amplitudeY = getAmplitude(mainParameters[1][0], mainParameters[1][2], normalized.y);
    float amplitude = amplitudeX * amplitudeY;
    //properly adjust
    vec4 lowPass = texture2DRect(tex0, texCoordVarying * bipolar(vec2(mainParameters[1][1], mainParameters[1][0])) * window + bipolar(vec2(mainParameters[2][1], mainParameters[2][0])) * window);
    vec4 highPass = 1.0 - lowPass;
    vec4 filterColor = mix(highPass * lowPass, mix(highPass, lowPass, extraParameters.x), extraParameters.y);
    vec4 newColor = vec4(amplitude, amplitude, 0.0, 1.0);
    outputColor = mix(newColor, filterColor, 1.0 - extraParameters.z);
    outputColor = newColor;
}