# Boxmoor Barbers App

An Expo/React Native phone prototype with dark green branding and no haircut photos in the service list.

## Preview

Run `npm install` and `npm start`, then open the QR code in Expo Go. For an iPhone-only preview, copy `App.js` into the `App.js` file of an Expo Snack using SDK 54, and add the `@react-native-async-storage/async-storage` dependency at version `2.2.0` if Snack prompts for it.

## What the demo does

- Service, barber, date and time selection, followed by a review screen
- Bookings stored on this device and shown in chronological order
- Cancellation restores a membership cut used by the cancelled booking
- One available haircut at the start of the £50/two-cut demo plan

This is a local prototype. The displayed slots are samples; confirming does not create a real appointment at Boxmoor or Nearcut. There is no customer login, shared calendar, payment collection or monthly renewal yet. The data stays on the device and can be lost when app storage is cleared.
