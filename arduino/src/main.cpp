#include <Arduino.h>
#include "communicate.h"
#include "shutter.h"
#include "led.h"

void setup() {
  communicateInit();
  shutterInit();
  ledInit();
}

void loop() {
  communicateHandle();
  shutterLoop();
  delay(5);
}
