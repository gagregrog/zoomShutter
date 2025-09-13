#include <Arduino.h>
#include "shutter.h"
#include "led.h"

void setup() {
  Serial.begin(115200);
  delay(1500);
  shutterInit();
  ledInit();
}

void loop() {
  if (Serial.available() > 0) {
    uint8_t command = Serial.parseInt();
    shutterHandle(command);
    ledHandle(command);
  }
  shutterLoop();
  delay(5);
}
