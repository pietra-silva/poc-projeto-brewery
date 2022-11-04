// não altere!
const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');
const sql = require('mssql');

// não altere!
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

// configure a linha abaixo caso queira que os dados capturados sejam inseridos no banco de dados.
// false -> nao insere
// true -> insere
const HABILITAR_OPERACAO_INSERIR = true;

// altere o valor da variável AMBIENTE para o valor desejado:
// API conectada ao banco de dados remoto, SQL Server -> 'producao'
// API conectada ao banco de dados local, MySQL Workbench - 'desenvolvimento'
const AMBIENTE = 'desenvolvimento';

const serial = async (
    valoresLm35Lavagem,
    valoresLm35Secagem1,
    valoresLm35Secagem2,
    valoresLm35Secagem3,
    valoresLm35Moagem,
    valoresLm35Trituramento1,
    valoresLm35Trituramento2,
    valoresLm35Trituramento3,
    valoresLm35Fermentacao,
    valoresLm35Resfriamento1,
    valoresLm35Resfriamento2,
    valoresLm35Resfriamento3,
    valoresLm35Maturacao,
    valoresLm35Engarrafamento,
    valoresLm35Consumo
) => {
    let poolBancoDados = ''

    if (AMBIENTE == 'desenvolvimento') {
        poolBancoDados = mysql.createPool(
            {
                // altere!
                // CREDENCIAIS DO BANCO LOCAL - MYSQL WORKBENCH
                host: 'localhost',
                user: 'insertGrupo05',
                password: 'insert',
                database: 'poc'
            }
        ).promise();
    } else if (AMBIENTE == 'producao') {
        console.log('Projeto rodando inserindo dados em nuvem. Configure as credenciais abaixo.');
    } else {
        throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
    }


    const portas = await serialport.SerialPort.list();
    const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
    if (!portaArduino) {
        throw new Error('O arduino não foi encontrado em nenhuma porta serial');
    }
    const arduino = new serialport.SerialPort(
        {
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        }
    );
    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });
    arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
        //console.log(data);
        const valores = data.split(';');
        const lm35lavagem = parseFloat(valores[0]);
        const lm35Secagem1 = parseFloat(valores[1]);
        const lm35Secagem2 = parseFloat(valores[2]);
        const lm35Secagem3 = parseFloat(valores[3]);
        const lm35Moagem = parseFloat(valores[4]);
        const lm35Trituramento1 = parseFloat(valores[5]);
        const lm35Trituramento2 = parseFloat(valores[6]);
        const lm35Trituramento3 = parseFloat(valores[7]);
        const lm35Fermentacao = parseFloat(valores[8]);
        const lm35Resfriamento1 = parseFloat(valores[9]);
        const lm35Resfriamento2 = parseFloat(valores[10]);
        const lm35Resfriamento3 = parseFloat(valores[11]);
        const lm35Maturacao = parseFloat(valores[12]);
        const lm35Engarrafamento = parseFloat(valores[13]);
        const lm35Consumo = parseFloat(valores[14]);

        /* .push() */
        valoresLm35Lavagem.push(lm35lavagem);
        valoresLm35Secagem1.push(lm35Secagem1);
        valoresLm35Secagem2.push(lm35Secagem2);
        valoresLm35Secagem3.push(lm35Secagem3);
        valoresLm35Moagem.push(lm35Moagem);
        valoresLm35Trituramento1.push(lm35Trituramento1);
        valoresLm35Trituramento2.push(lm35Trituramento2);
        valoresLm35Trituramento3.push(lm35Trituramento3);
        valoresLm35Fermentacao.push(lm35Fermentacao);
        valoresLm35Resfriamento1.push(lm35Resfriamento1);
        valoresLm35Resfriamento2.push(lm35Resfriamento2);
        valoresLm35Resfriamento3.push(lm35Resfriamento3);
        valoresLm35Maturacao.push(lm35Maturacao);
        valoresLm35Engarrafamento.push(lm35Engarrafamento);
        valoresLm35Consumo.push(lm35Consumo);

        if (HABILITAR_OPERACAO_INSERIR) {
            if (AMBIENTE == 'producao') {
                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> Importante! você deve ter o aquario de id 1 cadastrado.
                sqlquery = `INSERT INTO medida (dht11_umidade, dht11_temperatura, luminosidade, lm35_temperatura, chave, momento, fk_aquario) VALUES (${dht11Umidade}, ${dht11Temperatura}, ${luminosidade}, ${lm35Temperatura}, ${chave}, CURRENT_TIMESTAMP, 1)`;

                // CREDENCIAIS DO BANCO REMOTO - SQL SERVER
                // Importante! você deve ter criado o usuário abaixo com os comandos presentes no arquivo
                // "script-criacao-usuario-sqlserver.sql", presente neste diretório.
                const connStr = "Server=servidor-acquatec.database.windows.net;Database=bd-acquatec;User Id=usuarioParaAPIArduino_datawriter;Password=#Gf_senhaParaAPI;";

                function inserirComando(conn, sqlquery) {
                    conn.query(sqlquery);
                    console.log("valores inseridos no banco: ", dht11Umidade + ", " + dht11Temperatura + ", " + luminosidade + ", " + lm35Temperatura + ", " + chave)
                }

                sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery))
                    .catch(err => console.log("erro! " + err));

            } else if (AMBIENTE == 'desenvolvimento') {

                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> você deve ter o aquario de id 1 cadastrado.
                await poolBancoDados.execute(
                    'INSERT INTO ale (data_hora, processo_lavagem, processo_secagem1, processo_secagem2, processo_secagem3, processo_moagem, processo_triturar1, processo_triturar2, processo_triturar3, processo_fermentacao, processo_resfriamento1, processo_resfriamento2, processo_resfriamento3, processo_maturacao, processo_engarrafar, processo_consumo) VALUES (now(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        lm35lavagem, 
                        lm35Secagem1, lm35Secagem2, lm35Secagem3, 
                        lm35Moagem, 
                        lm35Trituramento1, lm35Trituramento2, lm35Trituramento3, 
                        lm35Fermentacao, 
                        lm35Resfriamento1, lm35Resfriamento2, lm35Resfriamento3, 
                        lm35Maturacao, lm35Engarrafamento, lm35Consumo
                    ]
                );
                console.log("valores inseridos no banco: ", lm35lavagem + ", " + lm35Secagem1 + ", " + lm35Secagem2 + ", " + lm35Secagem3 + ", " + lm35Moagem + ", " + lm35Trituramento1 + ", " + lm35Trituramento2 + ", " + lm35Trituramento3 + ", " + lm35Fermentacao + ", " + lm35Resfriamento1 + ", " + lm35Resfriamento2 + ", " + lm35Resfriamento3 + ", " + lm35Maturacao + ", " + lm35Engarrafamento + ", " + lm35Consumo + " ")

            } else {
                throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
            }
        }
    });
    arduino.on('error', (mensagem) => {
        console.error(`Erro no arduino (Mensagem: ${mensagem}`)
    });
}


// não altere!
const servidor = (
    valoresLm35Lavagem,
    valoresLm35Secagem1,
    valoresLm35Secagem2,
    valoresLm35Secagem3,
    valoresLm35Moagem,
    valoresLm35Trituramento1,
    valoresLm35Trituramento2,
    valoresLm35Trituramento3,
    valoresLm35Fermentacao,
    valoresLm35Resfriamento1,
    valoresLm35Resfriamento2,
    valoresLm35Resfriamento3,
    valoresLm35Maturacao,
    valoresLm35Engarrafamento,
    valoresLm35Consumo
) => {
    const app = express();
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });
    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });
    
    app.get('/sensores/lm35/lavagem', (_, response) => {
        return response.json(valoresLm35Lavagem);
    });
    app.get('/sensores/lm35/secagem1', (_, response) => {
        return response.json(valoresLm35Secagem1);
    });
    app.get('/sensores/lm35/secagem2', (_, response) => {
        return response.json(valoresLm35Secagem2);
    });
    app.get('/sensores/lm35/secagem3', (_, response) => {
        return response.json(valoresLm35Secagem3);
    });
    app.get('/sensores/lm35/moagem', (_, response) => {
        return response.json(valoresLm35Moagem);
    });
    app.get('/sensores/lm35/trituramento1', (_, response) => {
        return response.json(valoresLm35Trituramento1);
    });
    app.get('/sensores/lm35/trituramento2', (_, response) => {
        return response.json(valoresLm35Trituramento2);
    });
    app.get('/sensores/lm35/trituramento3', (_, response) => {
        return response.json(valoresLm35Trituramento3);
    });
    app.get('/sensores/lm35/fermentacao', (_, response) => {
        return response.json(valoresLm35Fermentacao);
    });
    app.get('/sensores/lm35/resfriamento1', (_, response) => {
        return response.json(valoresLm35Resfriamento1);
    });
    app.get('/sensores/lm35/resfriamento2', (_, response) => {
        return response.json(valoresLm35Resfriamento2);
    });
    app.get('/sensores/lm35/resfriamento3', (_, response) => {
        return response.json(valoresLm35Resfriamento3);
    });
    app.get('/sensores/lm35/maturacao', (_, response) => {
        return response.json(valoresLm35Maturacao);
    });
    app.get('/sensores/lm35/engarrafamento', (_, response) => {
        return response.json(valoresLm35Engarrafamento);
    });
    app.get('/sensores/lm35/consumo', (_, response) => {
        return response.json(valoresLm35Consumo);
    });
}

(async () => {
        const valoresLm35Lavagem = [];
        const valoresLm35Secagem1 = [];
        const valoresLm35Secagem2 = [];
        const valoresLm35Secagem3 = [];
        const valoresLm35Moagem = [];
        const valoresLm35Trituramento1 = [];
        const valoresLm35Trituramento2 = [];
        const valoresLm35Trituramento3 = [];
        const valoresLm35Fermentacao = [];
        const valoresLm35Resfriamento1 = [];
        const valoresLm35Resfriamento2 = [];
        const valoresLm35Resfriamento3 = [];
        const valoresLm35Maturacao = [];
        const valoresLm35Engarrafamento = [];
        const valoresLm35Consumo = [];

        await serial(
            valoresLm35Lavagem,
            valoresLm35Secagem1,
            valoresLm35Secagem2,
            valoresLm35Secagem3,
            valoresLm35Moagem,
            valoresLm35Trituramento1,
            valoresLm35Trituramento2,
            valoresLm35Trituramento3,
            valoresLm35Fermentacao,
            valoresLm35Resfriamento1,
            valoresLm35Resfriamento2,
            valoresLm35Resfriamento3,
            valoresLm35Maturacao,
            valoresLm35Engarrafamento,
            valoresLm35Consumo
        );
        servidor(
            valoresLm35Lavagem,
            valoresLm35Secagem1,
            valoresLm35Secagem2,
            valoresLm35Secagem3,
            valoresLm35Moagem,
            valoresLm35Trituramento1,
            valoresLm35Trituramento2,
            valoresLm35Trituramento3,
            valoresLm35Fermentacao,
            valoresLm35Resfriamento1,
            valoresLm35Resfriamento2,
            valoresLm35Resfriamento3,
            valoresLm35Maturacao,
            valoresLm35Engarrafamento,
            valoresLm35Consumo
        );
    }
)
();
