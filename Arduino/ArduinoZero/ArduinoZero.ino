#include <Keyboard.h>
const int Button = 2;

void setup() {
  // put your setup code here, to run once:
  pinMode(Button, INPUT);
  pinMode(A0, INPUT);
  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:
  Serial.write("DEBUG");
  if (digitalRead(Button) == HIGH)
  {
    Serial.write(analogRead(A0));
  }
  delay(500);
}
