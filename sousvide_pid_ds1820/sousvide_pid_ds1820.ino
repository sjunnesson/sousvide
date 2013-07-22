/*
Sous vide controller:
Switches a solid state relay on and off tightly
controlling the temperature of the water bath. 
Test runs has given a +-1 degrees Celsius precision over multiple hours
using a slowcooker as heat source.

PID library from: 
Brett Beauregard <br3ttb@gmail.com>
https://github.com/br3ttb/Arduino-PID-Library/

DS1820 implementation from:
bildr 
http://bildr.org/2011/07/ds18b20-arduino/ 
*/


#include <PID_v1.h>
#include <OneWire.h> 
#define RelayPin 2

// DEBUG VARIABLES
unsigned long serialMillis=0;
int serialFreq=600;

int DS18S20_Pin = 6; //DS18S20 Signal pin on digital 6
OneWire ds(DS18S20_Pin); 


//Define Variables we'll be connecting to
double Setpoint, Input, Output;

//Specify the links and initial tuning parameters
PID myPID(&Input, &Output, &Setpoint,2,5,1, DIRECT);

int WindowSize = 500;
unsigned long windowStartTime;
void setup()
{
  Serial.begin(9600);

  windowStartTime = millis();

  // what temperature are we aiming for
  Setpoint = 56;

  myPID.SetControllerDirection(DIRECT);

  //tell the PID to range between 0 and the full window size
  myPID.SetOutputLimits(0, WindowSize);

  //turn the PID on
  myPID.SetMode(AUTOMATIC);
  pinMode(RelayPin,OUTPUT);
}

void loop()
{
  // get the last temperature from sensor
  float temperature = getTemp();
  // set the Input variable to this to be fed into the PID controller
  Input = temperature;
  myPID.Compute();

  /************************************************
   * turn the output pin on/off based on pid output
   ************************************************/
  if(millis() - windowStartTime>WindowSize)
  { //time to shift the Relay Window
    windowStartTime += WindowSize;
  }
  if(Output > millis() - windowStartTime){
    digitalWrite(RelayPin,HIGH);
  }
  else{ 
    digitalWrite(RelayPin,LOW);
  }


  // DEBUG outputs to the serial so that we can view how it goes
  if(serialMillis+serialFreq<millis()){
    Serial.println(Input);
    Serial.println(Output);
    Serial.println(windowStartTime);
    serialMillis=millis();
  }

}


float getTemp(){
  //returns the temperature from one DS18S20 in DEG Celsius

  byte data[12];
  byte addr[8];

  if ( !ds.search(addr)) {
    //no more sensors on chain, reset search
    ds.reset_search();
    return -1000;
  }

  if ( OneWire::crc8( addr, 7) != addr[7]) {
    Serial.println("CRC is not valid!");
    return -1000;
  }

  if ( addr[0] != 0x10 && addr[0] != 0x28) {
    Serial.print("Device is not recognized");
    return -1000;
  }

  ds.reset();
  ds.select(addr);
  ds.write(0x44,1); // start conversion, with parasite power on at the end

  byte present = ds.reset();
  ds.select(addr);    
  ds.write(0xBE); // Read Scratchpad


  for (int i = 0; i < 9; i++) { // we need 9 bytes
    data[i] = ds.read();
  }

  ds.reset_search();

  byte MSB = data[1];
  byte LSB = data[0];

  float tempRead = ((MSB << 8) | LSB); //using two's compliment
  float TemperatureSum = tempRead / 16;

  return TemperatureSum;

}





