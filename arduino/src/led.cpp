#include "led.h"

// *************
// ***PRIVATE***
// *************

void _ledWrite(bool state) {
  digitalWrite(LED_PIN, state ? HIGH : LOW);
}

void _ledOn() { _ledWrite(true); }

void _ledOff() { _ledWrite(false); }

void _ledFormatCommand(LED_COMMAND command, const char* description) {
  Serial.print("  ");
  Serial.print(command);
  Serial.print(" - ");
  Serial.println(description);
}

// ************
// ***PUBLIC***
// ************

void ledInit() {
  pinMode(LED_PIN, OUTPUT);
  _ledOff();
  ledCommands();
}

void ledHandle(uint8_t command) {
  switch (command) {
  case LED_COMMAND_ON:
    _ledOn();
    break;
  case LED_COMMAND_OFF:
    _ledOff();
    break;
  }
}

void ledCommands(void) {
  Serial.println();
  Serial.println("LED Commands:");
  _ledFormatCommand(LED_COMMAND_ON, "Turn On");
  _ledFormatCommand(LED_COMMAND_OFF, "Turn Off");
  Serial.println("");
}
