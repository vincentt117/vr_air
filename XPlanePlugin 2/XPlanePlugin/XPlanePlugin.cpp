#include <stdio.h>
#include <string.h>
#include "SDK\CHeaders\XPLM\XPLMDisplay.h"
#include "SDK\CHeaders\XPLM\XPLMGraphics.h"
#include "SDK\CHeaders\XPLM\XPLMProcessing.h"
#include "SDK\CHeaders\XPLM\XPLMDataAccess.h"
#include "Serial.h"
#include <thread>

const char WHO_ARE_YOU_MESSAGE[20] = "WHO_ARE_YOU_MESSAGE";
const char YOKE_DEVICE_MESSAGE[20] = "YOKE_DEVICE_MESSAGE";
Serial* SP = NULL;
char rollValue = 0;

PLUGIN_API int XPluginStart(char* outName, char* outSig, char* outDesc) {
	strcpy(outName, "XPlaneTouchVR");
	strcpy(outSig, "xplanetouchvr");
	strcpy(outDesc, "A plugin that shows a 3D hand from Leap Motion");
	std::thread(SerialReaderLoop);
	//Find out which serial port to use
	for (size_t i = 0; i < 11; i++)
	{
		Serial* sp = new Serial("COM" + i);
		if (sp->IsConnected()) {
			sp->WriteData(WHO_ARE_YOU_MESSAGE, 20);
			char response[20];
			sp->ReadData(response, 20);
			bool thisIsOurDevice = true;
			for (size_t i = 0; i < 20; i++)
			{
				if (response[i] != YOKE_DEVICE_MESSAGE[i])
					thisIsOurDevice = false;
			}
			if (thisIsOurDevice) {
				SP = sp;
			}
		}
	}

	if (SP != NULL)
		XPLMRegisterFlightLoopCallback(DoFlightLoop, -1, NULL);

	return 1;
}

PLUGIN_API void XPluginStop(void) {
}

PLUGIN_API void XPluginDisable(void) {
}

PLUGIN_API int XPluginEnable(void) {
	return 1;
}

PLUGIN_API void XPluginReceiveMessage(
	XPLMPluginID	inFromWho,
	int				inMessage,
	void *			inParam) {
}

float DoFlightLoop(float                inElapsedSinceLastCall,
	float                inElapsedTimeSinceLastFlightLoop,
	int                  inCounter,
	void *               inRefcon) {
	XPLMDataRef rollDataRef = XPLMFindDataRef("sim/flightmodel/controls/lail1def");
	XPLMSetDataf(rollDataRef, ((float)rollValue / 256) * 45);
}

void SerialReaderLoop() {
	if (SP->IsConnected()) {
		char response[1];
		SP->ReadData(response, 1);
		rollValue = response[1];
	}
}