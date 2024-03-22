#pragma once

#include "ofMain.h"
#include "ofxMidi.h"

class ofApp : public ofBaseApp, ofxMidiListener{

	public:
		void setup();
		void midiSetup();
		void videoSetup();
		void draw();
		void setUniforms();
		void newMidiMessage(ofxMidiMessage& message);
		ofxMidiIn midiIn;
		const int port = 0;
		array<int, 19> controlNumbers;
		array<float, 19> controls;
		ofShader shader;
		ofFbo buffer;

};
