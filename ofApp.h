#pragma once

#include "ofMain.h"
#include "ofxMidi.h"

class ofApp : public ofBaseApp, ofxMidiListener {

public:
	void setup();
	void midiSetup();
	void videoSetup();
	void draw();
	void refresh();
	void updateParameters();
	void setUniforms();
	void newMidiMessage(ofxMidiMessage& message);
	ofxMidiIn midiIn;
	const int port = 0;
	const array<int, 19> controlNumbers = {123, 124, 125, 126, 35, 41, 44, 45, 46, 47, 51, 53, 119, 120, 121, 122, 1, 118, 7};
	array<float, 19> controls;
	ofShader shader;
	ofFbo buffer;
	ofVec2f window;
	float width;
	float height;
	ofMatrix4x4 mainParameters;
	ofVec3f extraParameters;
};