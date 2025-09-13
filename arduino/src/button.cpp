#include "button.h"
#include "shutter.h"

EasierButton btn(BUTTON_PIN);

void onPress(void) {
  shutterToggle();
  shutterState();
}

void buttonInit(void) {
  btn.setOnPressed(onPress);
  btn.begin();
}

void buttonLoop(void) {
  btn.update();
}
