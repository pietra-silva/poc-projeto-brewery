CREATE DATABASE poc;
USE poc;

CREATE TABLE ale (
idAle INT PRIMARY KEY AUTO_INCREMENT,
data_hora DATETIME,
processo_lavagem DECIMAL (3,1),
processo_secagem1 DECIMAL (3,1),
processo_secagem2 DECIMAL (3,1),
processo_secagem3 DECIMAL (3,1),
processo_moagem DECIMAL (3,1),
processo_triturar1 DECIMAL (3,1),
processo_triturar2 DECIMAL (3,1),
processo_triturar3 DECIMAL (3,1),
processo_fermentacao DECIMAL (3,1),
processo_resfriamento1 DECIMAL (3,1),
processo_resfriamento2 DECIMAL (3,1),
processo_resfriamento3 DECIMAL (3,1),
processo_maturacao DECIMAL (3,1),
processo_engarrafar DECIMAL (3,1),
processo_consumo DECIMAL (3,1)
);