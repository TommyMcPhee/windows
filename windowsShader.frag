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

float getPan(float inA, float inB, float normal){
    return pow(1.0 - abs(inA - normal) * (1.0 - abs(inA - 0.5)) * inB, inB);
}

float getAmplitude(float pan, float inA, float inB){
    return pow(pow(pan, inA), 1.0 / inB);
}

float process(float pre){
    return pow(pre, 4.0);
}

void main()
{
    pixel = window.x * window.y;
    vec2 normalized = gl_FragCoord.xy / window;
    //vec2 decenterNormalized = abs(0.5 - normalized) * 2.0;
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
    vec4 redFeedback = texture2DRect(tex0, texCoordVarying * vec2(newRed) * window);
    vec4 greenFeedback = texture2DRect(tex0, texCoordVarying * vec2(newGreen) * window);
    vec4 blueFeedback = texture2DRect(tex0, texCoordVarying * vec2(newBlue) * window);
    vec3 lowPass = vec3(redFeedback.r, greenFeedback.g, blueFeedback.b);
    vec3 highPass = 1.0 - lowPass;
    vec3 filterColor = mix(highPass * lowPass, mix(highPass, lowPass, extraParameters.x), extraParameters.y);
    vec3 newColor = vec3(newRed, newGreen, newBlue);
    vec3 preProcessed = mix(newColor, filterColor, 1.0 - extraParameters.z);
    outputColor = vec4(process(preProcessed.r), process(preProcessed.g), process(preProcessed.b), 1.0);

}