
int lm35_pin = A0, leitura_lm35 = 0;
float temperatura;
int switch_pin = 7;
void setup()
{
Serial.begin(9600);
pinMode(switch_pin, INPUT);
}
void loop()
{
leitura_lm35 = analogRead(lm35_pin);
temperatura = leitura_lm35 * (5.0/1023) * 100;
Serial.print(temperatura);
Serial.println(";");

delay(1000);
}
