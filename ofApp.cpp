#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
	midiSetup();
	
}

void ofApp::midiSetup() {
	midiIn.openPort(port);
	midiIn.addListener(this);
}

void ofApp::videoSetup() {
	shader.load("windowsShader");
	buffer.allocate(ofGetScreenWidth(), ofGetScreenHeight());
	buffer.clear();
	buffer.begin();
	ofClear(0, 0, 0, 255);
	buffer.end();
}

//--------------------------------------------------------------
void ofApp::draw(){
	refresh();
	buffer.begin();
	shader.begin();
	setUniforms();
	shader.end();
	buffer.end();
	buffer.draw(0, 0);
}

void ofApp::setUniforms() {

}

//--------------------------------------------------------------
void ofApp::newMidiMessage(ofxMidiMessage& message) {
	if (message.status == MIDI_CONTROL_CHANGE) {
		int control = message.control;
		for (int a = 0; a < controlNumbers.size(); a++) {
			if (control = controlNumbers[a]) {
				int controlIndex = a;
				controls[controlIndex] = (float)(message.value + 1) / 128.0;
			}
		}
	}
}