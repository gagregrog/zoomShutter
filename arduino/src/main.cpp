#include <Arduino.h>
#include <Servo.h>

#define SERVO_PIN 9
#define SERVO_TIMEOUT_MS 1500
Servo servo;

enum {
  UNKNOWN,
  CLOSED,
  OPEN,
};

uint8_t state = UNKNOWN;

unsigned long last_run = millis();

void servoWrite(uint8_t angle) {
  if (!servo.attached()) {
    servo.attach(SERVO_PIN);
    delay(100);
  }
  servo.write(angle);
  last_run = millis();
  if (angle == 0) {
    state = CLOSED;
    Serial.println("CLOSING");
  } else {
    state = OPEN;
    Serial.println("OPENING");
  }
}

void openServo() { servoWrite(180); }

void closeServo() { servoWrite(0); }

void loopServo() {
  if (!servo.attached()) {
    return;
  }

  unsigned long now = millis();
  if (now - last_run >= SERVO_TIMEOUT_MS) {
    servo.detach();
  }
}

void setup() {
  Serial.begin(115200);
  delay(1500);
  closeServo();
  Serial.println("Send 1 to open and 2 to close");
}

void loop() {
  if (Serial.available() > 0) {
    uint8_t num = Serial.parseInt();
    if (num == 1 && state != OPEN) {
      openServo();
    } else if (num == 2 && state != CLOSED) {
      closeServo();
    }
  }
  loopServo();
  delay(5);
}
