#include <Arduino.h>
#include "communicate.h"
#include "shutter.h"
#include "led.h"
#include "button.h"

void setup() {
  communicateInit();
  shutterInit();
  ledInit();
  buttonInit();
}

void loop() {
  communicateHandle();
  shutterLoop();
  buttonLoop();
  delay(5);
}
