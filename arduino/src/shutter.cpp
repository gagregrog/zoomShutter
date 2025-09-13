#include "shutter.h"

Servo _servo;
SHUTTER_STATE _state = SHUTTER_STATE_UNKNOWN;

unsigned long _last_operation = millis();

// *************
// ***PRIVATE***
// *************

void _servoWrite(uint8_t angle) {
  if (!_servo.attached()) {
    _servo.attach(SERVO_PIN);
    delay(100);
  }
  _servo.write(angle);
  _last_operation = millis();
  if (angle == 0) {
    _state = SHUTTER_STATE_CLOSED;
  } else {
    _state = SHUTTER_STATE_OPEN;
  }
}

void _servoOpen() { _servoWrite(180); }

void _servoClose() { _servoWrite(0); }

// ************
// ***PUBLIC***
// ************

void shutterInit() {
  _servoClose();
}

void shutterHandle(uint8_t command) {
  if (command == SHUTTER_COMMAND_OPEN && _state != SHUTTER_STATE_OPEN) {
    _servoOpen();
  } else if (command == SHUTTER_COMMAND_CLOSE && _state != SHUTTER_STATE_CLOSED) {
    _servoClose();
  }

  switch (command) {
  case SHUTTER_COMMAND_OPEN:
  case SHUTTER_COMMAND_CLOSE:
  case SHUTTER_COMMAND_STATE:
    shutterState();
    break;
  }
}

void shutterLoop() {
  if (!_servo.attached()) {
    return;
  }

  unsigned long now = millis();
  if (now - _last_operation >= SERVO_TIMEOUT_MS) {
    _servo.detach();
  }
}

SHUTTER_STATE shutterState(void) {
  Serial.print("SHUTTER::");
  switch (_state)
  {
  case SHUTTER_STATE_OPEN:
    Serial.println("OPEN");
    break;
  case SHUTTER_STATE_CLOSED:
    Serial.println("CLOSED");
    break;
  default:
    Serial.println("UNKNOWN");
    break;
  }
  return _state;
}
