#include "led.h"

// *************
// ***PRIVATE***
// *************

void _ledWrite(bool state) {
  digitalWrite(LED_PIN, state ? HIGH : LOW);
}

void _ledOn() { _ledWrite(true); }

void _ledOff() { _ledWrite(false); }

// ************
// ***PUBLIC***
// ************

void ledInit() {
  pinMode(LED_PIN, OUTPUT);
  _ledOff();
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
