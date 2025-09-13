#include <Arduino.h>
#include <Servo.h>

#ifndef SHUTTER_h
#define SHUTTER_h

#define SERVO_PIN 9
#define SERVO_TIMEOUT_MS 1500

enum SHUTTER_STATE {
  SHUTTER_STATE_UNKNOWN,
  SHUTTER_STATE_OPEN,
  SHUTTER_STATE_CLOSED,
};

enum SHUTTER_COMMAND {
  SHUTTER_COMMAND_NOOP,
  SHUTTER_COMMAND_OPEN,
  SHUTTER_COMMAND_CLOSE,
  SHUTTER_COMMAND_STATE,
};

void shutterInit(void);
void shutterCommands(void);
void shutterLoop(void);
void shutterHandle(uint8_t command);
SHUTTER_STATE shutterState(void);

#endif
