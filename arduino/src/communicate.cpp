#include "communicate.h"
#include "shutter.h"
#include "led.h"

void _communicateFormatCommand(uint8_t command, const char* description) {
  Serial.print("  ");
  Serial.print(command);
  Serial.print(" - ");
  Serial.println(description);
}

void communicateInit(void) {
  Serial.begin(115200);
  delay(1500);
  communicateShowCommands();
}

void communicateShowCommands(void) {
  Serial.println();
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║              ZoomShutter             ║");
  Serial.println("╚══════════════════════════════════════╝");
  Serial.println();
  Serial.println("Available Commands:");
  
  // Shutter commands
  _communicateFormatCommand(SHUTTER_COMMAND_OPEN, "Open Shutter");
  _communicateFormatCommand(SHUTTER_COMMAND_CLOSE, "Close Shutter");
  _communicateFormatCommand(SHUTTER_COMMAND_TOGGLE, "Toggle Shutter");
  _communicateFormatCommand(SHUTTER_COMMAND_STATE, "Get Shutter State");
  
  // LED commands
  _communicateFormatCommand(LED_COMMAND_ON, "Turn LED On");
  _communicateFormatCommand(LED_COMMAND_OFF, "Turn LED Off");
  
  Serial.println("");
}

void communicateHandle(void) {
  if (Serial.available() > 0) {
    uint8_t command = Serial.parseInt();
    shutterHandle(command);
    ledHandle(command);
  }
}
