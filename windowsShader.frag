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
uniform vec4 totals;
float pixel;

float getPan(float inA, float inB, float normal){
    return pow(1.0 - abs(inA - normal) * (1.0 - abs(inA - 0.5)) * inB, inB);
}

float getAmplitude(float pan, float inA, float inB){
    return pow(pow(pan, inA), 1.0 / inB);
}

float processA(float pre){
    return normalizedAdd(pow(pre, 2.0) * pow(pre, 0.125), 0.0625);
}

vec2 unipolar(vec2 signal){
    return signal * 0.5 + 0.5;
}

float averageThree(float inA, float inB, float inC){
    return (inA + inB + inC) / 3.0;
}

float normalizedAdd(float inA, float inB){
    return (inA + inB) / (1.0 + inB);
}

vec3 normalizedAdd(vec3 inA, vec3 inB){
    return (inA + inB) / (1.0 + inB);
}

float processB(float pre){
    return normalizedAdd(pow(pre, 1.5) * pow(pre, 0.33), (1.0 / 9.0));
}

void main()
{
    pixel = window.x * window.y;
    vec2 normalized = gl_FragCoord.xy / window;
    vec2 center = 2.0 * abs(0.5 - normalized);
    float panX = getPan(mainParameters[2][1], mainParameters[2][3], normalized.x);
    float panY = getPan(mainParameters[2][0], mainParameters[2][2], normalized.y);
    float pan = panX * panY;
    float redPan = getPan(mainParameters[3][0], mainParameters[3][2], pan);
    float bluePan = getPan(mainParameters[3][1], mainParameters[3][3], pan);
    float amplitudeX = getAmplitude(pan, mainParameters[1][1], mainParameters[1][3]);
    float amplitudeY = getAmplitude(pan, mainParameters[1][0], mainParameters[1][2]);
    float newGreen = amplitudeX * amplitudeY;
    float newRed = getAmplitude(pow(redPan * newGreen, 0.5), mainParameters[0][0], mainParameters[0][2]);
    float newBlue = getAmplitude(pow(bluePan * newGreen, 0.5), mainParameters[0][1], mainParameters[0][3]);
    vec4 redFeedback = texture2DRect(tex0, texCoordVarying * vec2(newRed) * center);
    vec4 greenFeedback = texture2DRect(tex0, texCoordVarying * vec2(newGreen) * center);
    vec4 blueFeedback = texture2DRect(tex0, texCoordVarying * vec2(newBlue) * center);
    vec3 lowPass = vec3(redFeedback.r, greenFeedback.g, blueFeedback.b);
    vec3 highPass = 1.0 - lowPass;
    vec3 filterColor = mix(highPass * lowPass, mix(highPass, lowPass, extraParameters.x), extraParameters.y);
    vec3 newColor = vec3(newRed, newGreen, newBlue);
    vec3 preProcessed = mix(newColor, filterColor, 1.0 - extraParameters.z);
    vec3 synthesized = vec3(processA(preProcessed.r), processA(preProcessed.g), processA(preProcessed.b));
    vec4 filterFeedback = texture2DRect(tex0, texCoordVarying * center * noise1(1.0 - totals.x) + (noise1(1.0 - totals.z) * window));
    vec4 filterResize = texture2DRect(tex0, mix(texCoordVarying, window - texCoordVarying, totals.z) * unipolar(sin((noise1(totals.z) / noise1(totals.w)) * center * TWO_PI)));
    vec3 lowPassFilter = filterResize.rgb * filterFeedback.rgb;
    vec3 highPassFilter = 1.0 - lowPassFilter;
    vec3 filtered = mix(synthesized, mix(lowPassFilter * highPassFilter * 2.0, mix(lowPassFilter, highPassFilter, pow(1.0 - totals.w, 2.0)), 1.0 - totals.w), 1.0 - totals.z);
    float yellow = filtered.r * filtered.g;
    float magenta = filtered.r * filtered.b;
    float cyan = filtered.g * filtered.b;
    float white = filtered.r * filtered.g * filtered.b;
    float nonwhite = 1.0 - white;
    float secondary = averageThree(yellow, magenta, cyan) * nonwhite;
    float nonsecondary = 1.0 - secondary;
    float primary = nonwhite * nonsecondary;
    float colorShade = normalizedAdd(primary * totals.x, secondary * totals.y);
    vec3 preShaded = filtered * colorShade;
    vec3 layerColor = vec3(0.0);
    for(float a = 1.0; a < pixel; a++){
        for(float b = 0.0; b < a; b++){
            vec4 layer = texture2DRect(tex0, (texCoordVarying / a) + (b * window / a));
            vec3 layerColor = mix(layer.rgb * layerColor, normalizedAdd(layer.rgb, layerColor), b / a);
        }
    }
    vec3 shaded = mix(preShaded, preShaded * layerColor, 0.25);
    outputColor = vec4(processB(shaded.r), processB(shaded.g), processB(shaded.b), 1.0);
}