
float lm35Lavagem;
float lm35Secagem1;
float lm35Secagem2;
float lm35Secagem3;
float lm35Moagem ;
float lm35Trituramento1;
float lm35Trituramento2;
float lm35Trituramento3;
float lm35Fermentacao;
float lm35Resfriamento1;
float lm35Resfriamento2;
float lm35Resfriamento3;
float lm35Maturacao;
float lm35Engarrafamento;
float lm35Consumo;

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
lm35Lavagem = temperatura*1.02354145 + 11.9282513;
lm35Secagem1 = temperatura*1.02354145 + 33.9866941;
lm35Secagem2 = temperatura*1.02354145 + 43.98;
lm35Secagem3 = temperatura*1.02354145 + 73.986694;
lm35Moagem = temperatura*1.02354145 + 40.986694;
lm35Trituramento1 = temperatura*1.02354145 +8.9866941;
lm35Trituramento2 = temperatura*1.02354145 + 38.9866941;
lm35Trituramento3 = temperatura*1.02354145 - 8.0133059;
lm35Resfriamento1 =  temperatura*1.02354145 - 13.0133059;
lm35Resfriamento2 = temperatura*1.02354145 - 8.0133059;
lm35Resfriamento3 = temperatura*1.02354145 + 38.9866941;
lm35Maturacao = temperatura*1.02354145 + 38.9866941;
lm35Engarrafamento = temperatura*1.02354145 + 8.9866941;
lm35Consumo = temperatura*1.02354145 - 15.013306;
Serial.print(temperatura);
Serial.println(";");

delay(1000);
}
