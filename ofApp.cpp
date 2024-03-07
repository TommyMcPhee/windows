#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup() {
	midiSetup();
	videoSetup();
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
void ofApp::draw() {
	refresh();
	updateParameters();
	buffer.begin();
	shader.begin();
	setUniforms();
	buffer.draw(0.0, 0.0);
	shader.end();
	buffer.end();
	buffer.draw(0.0, 0.0);
}

void ofApp::refresh() {
	width = (float)ofGetWidth();
	height = (float)ofGetHeight();
	buffer.allocate(width, height);
	window.set(width, height);
	ofClear(0, 0, 0, 255);
}

void ofApp::updateParameters() {
	mainParameters.set(controls[0], controls[1], controls[2], controls[3], controls[4], controls[5], controls[6], controls[7],
		controls[8], controls[9], controls[10], controls[11], controls[12], controls[13], controls[14], controls[15]);
	extraParameters.set(controls[16], controls[17], controls[18]);
	//distribution.set
}

void ofApp::setUniforms() {
	shader.setUniform2f("window", window);
	shader.setUniformMatrix4f("mainParameters", mainParameters);
	shader.setUniform3f("extraParameters", extraParameters);
	shader.setUniform1f("seed", ofRandomf());
}

//--------------------------------------------------------------
void ofApp::newMidiMessage(ofxMidiMessage& message) {
	if (message.status == MIDI_CONTROL_CHANGE) {
		int control = message.control;
		for (int a = 0; a < controlNumbers.size(); a++) {
			if (control == controlNumbers[a]) {
				int controlIndex = a;
				controls[controlIndex] = (float)(message.value + 1) / 128.0;
			}
		}
	}
}