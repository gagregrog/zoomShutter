#include <Arduino.h>
#include "shutter.h"

#ifndef LED_h
#define LED_h

#define LED_PIN 8

enum LED_COMMAND {
  LED_COMMAND_ON = SHUTTER_COMMAND_END,
  LED_COMMAND_OFF,
};

void ledInit(void);
void ledHandle(uint8_t command);

#endif
