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
vec2 decenterNormalized;
float pixel;
/*
float unipolar(float value){
    return value * 0.5 + 0.5;
}

vec3 unipolar(vec3 value){
    return value * 0.5 + 0.5;
}
*/

vec2 bipolar(vec2 value){
    return (value - 0.5) * 2.0;
}

float oscillateFloat(float phase, float frequency, float amplitude, float tension){
    return mix(TWO_PI * phase * frequency * pixel, step(mod(phase * frequency * pixel, 1.0), 0.5), tension);
    //return 0.0;
}

vec3 oscillate(vec4 cycle, vec4 frequency, float frequencySmooth, float amplitudeSmooth){
    float xModulator = oscillateFloat(decenterNormalized.x, cycle.y, frequency.w, frequencySmooth);
    float yModulator = oscillateFloat(decenterNormalized.y, cycle.x, frequency.z, frequencySmooth);
    float xCarrier = oscillateFloat(decenterNormalized.x, xModulator * frequency.y * pixel, cycle.w, amplitudeSmooth);
    float yCarrier = oscillateFloat(decenterNormalized.y, yModulator * frequency.x * pixel, cycle.z, amplitudeSmooth);
    return vec3(xCarrier * yCarrier);
}

void main()
{
    pixel = window.x * window.y;
    vec2 normalized = gl_FragCoord.xy / window;
    vec2 decenterNormalized = abs(0.5 - normalized) * 2.0;
    vec4 amplitudeColor = texture2DRect(tex0, texCoordVarying * bipolar(vec2(mainParameters[1][1], mainParameters[1][0])) * window);
    vec4 maxAmplitudeColor = amplitudeColor * mainParameters[1][3];
    vec4 minAmplitudeColor = (1.0 - amplitudeColor) * mainParameters[1][2];
    vec4 panColor = texture2DRect(tex0, texCoordVarying + bipolar(vec2(mainParameters[2][1], mainParameters[2][0])) * window);
    vec4 maxPanColor = panColor * mainParameters[2][3];
    vec4 minPanColor = (1.0 - panColor) * mainParameters[2][2];
    vec4 maxFeedbackColor = abs(maxAmplitudeColor - maxPanColor);
    vec4 minFeedbackColor = abs(minAmplitudeColor - maxAmplitudeColor);
    //vec3 oscillation = oscillate(mainParameters[3], mainParameters[0], extraParameters.x, extraParameters.y);
    vec3 oscillation = vec3(0.0, decenterNormalized.x, decenterNormalized.y);
    vec4 newColor = vec4(oscillation, 1.0);
    outputColor = mix(newColor, mix(maxFeedbackColor, minFeedbackColor, 0.5), 1.0 - extraParameters.z);
    //outputColor = mix(newColor, feedbackColor, 0.95);
}