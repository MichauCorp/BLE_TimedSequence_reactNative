BLE_TimedSequence is an application to send messeges over BLE using timers. this specific itteration is built to activate an AromaTron device.

since this app uses an EAS build, it cannot work with Expo Go.
in addition, to build this project you must have an active expo account.

Setup:

1. download the project files and open on VScode.

2. to build, enter: "
   eas login,
   eas build:configure (your platform),
   eas build --profile=preview --platform= (your platform) "

Note: this app only scans for aromatron type devices, this can be changed in the 'useBLE.ts' file 

instructions:

1. go to the "App" tab, make sure you have bluetooth enabled
2. connect to your available AromaTron device
3. set the total time of your sequence, click the "+" button to add timePoints where you can activate the pumps.


uses code from https://github.com/friyiajr/BLESampleExpo
