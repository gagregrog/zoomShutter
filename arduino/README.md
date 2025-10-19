# ZoomShutter

## BOM

- [TowerPro SG90 Micro Servo](https://www.adafruit.com/product/169)
  - Note: SG92 is linked
- [12mm Tactile Button](https://www.adafruit.com/product/1119)
- [5mm LED](https://www.adafruit.com/product/4203)
- [150-220 ohm resistor](https://www.adafruit.com/product/2780)
- [Arduino Pro Micro](https://a.co/d/6WW093i)
- [Micro USB (Female) Breakout](https://a.co/d/8bGN940)
- [Micro USB (Male) breakout](https://a.co/d/evz0pTh)
- [100uF 16V Electrolytic Capacitor](https://www.adafruit.com/product/2193)
- [Heat Shrink](https://www.adafruit.com/product/1649)
- [12x M1.7x8mm Self Tapping Screws](https://a.co/d/btNwROB)

## Pinout

- Tactile Button
  - `GND` & `Pin 7`
- LED
  - Cathode to Resistor to `Pin 8`
  - Anode to `GND`
- Servo
  - Yellow (data) to `Pin A3`
  - Orange to `VCC`
  - Brown to `GND`
- Capacitor
  - Place across `VCC` and `GND` where the servo connects to the Arduino (capacitor `GND` has a stripe)
- Micro USB Breakout
  - Connect Female BO `VCC`, `D-`, `D+`, and `GND` to corresponding pads on Male BO and cover with heat shrink
  - Plug Male BO into Arduino

## Flashing

Install PlatformIO CLI and run the following to flash and monitor:

```
pio run --target upload && pio device monitor
```
