//Arthurs: Jingchao Feng, Sanjit Sighn

#include <Keyboard.h>

/*
Rotary Scan codes
First Digit: Alway 2
Second Digit: Analog Pin Number
Third Digit: 0 down 1 up
Example: 201 means pin 0 turned up
		 220 means pin 2 turned down
*/

/*
Button Scan codes
First Digit: Always 2
Second and Third Digit: pin number
Example: 213 means pin 13 is pressed
		 203 means pin 3 is pressed
*/

const int rotarySensorInterval = 100;
const int scanCodeStartPoint = 100;

int rotarySensorValues[6];
bool lastButtonSensorStates[14];

void setup() {
	// put your setup code here, to run once:
	pinMode(A0, INPUT);
	pinMode(A1, INPUT);
	pinMode(A2, INPUT);
	pinMode(A3, INPUT);
	pinMode(A4, INPUT);
	pinMode(A5, INPUT);
	for (size_t i = 2; i < 14; i++)
	{
		pinMode(i, INPUT);
	}

	//Serial.begin(9600);
	//Serial.write("Setup Complete");
	Keyboard.begin();
	for (uint32_t i = 0; i < 6; i++)
	{
		rotarySensorValues[i] = analogRead(i) / rotarySensorInterval;
	}
	for (size_t i = 2; i < 14; i++)
	{
		lastButtonSensorStates[i] = false;
	}
}

void loop() {
	// //Serial.write("Loop executing.");
	doAnalog();
	doDigital();
}

void doAnalog() {
	for (size_t i = 0; i < 6; i++)
		//for (size_t i = 3; i < 4; i++)
	{
		uint32_t value = analogRead(i);
		//Serial.println("Pin " + String(i) + " value is " + String(value));
		int level = value / rotarySensorInterval;
		//Serial.println("Pin " + String(i) + " level is " + String(level));
		int timesToPress = rotarySensorValues[i] - level;
		//Serial.println("Pin " + String(i) + " timesToPress is " + String(timesToPress));
		rotarySensorValues[i] = level;
		int upOrDown = timesToPress > 0;
		//Serial.println("Pin " + String(i) + " state is " + String(upOrDown));
		uint8_t scanCode = scanCodeStartPoint;
		scanCode += (i * 10);
		scanCode += upOrDown;
		int timesToPressActual = abs(timesToPress) * 200;
		//Serial.println("Sending Scancode " + String(scanCode));
		//if(timesToPress != 0)
		for (size_t j = 0; j < timesToPressActual; j++)
		{
			Keyboard.press(scanCode);
			//break;
			//delay(100);
			Keyboard.release(scanCode);
		}
	}
}

void doDigital() {
	for (size_t i = 2; i < 14; i++)
	{
		bool result;
		if (digitalRead(i) == HIGH)
			result = true;
		else
			result = false;
		//Serial.println("Button " + String(i) + " state is " + result);
		if (result != lastButtonSensorStates[i])
		{
			uint8_t scanCode = scanCodeStartPoint;
			scanCode += i;
			if (result) {
				//Serial.println("Sending Scancode " + String(scanCode));
				Keyboard.press(scanCode);
				Keyboard.release(scanCode);
			}
			lastButtonSensorStates[i] = result;
		}
	}
}