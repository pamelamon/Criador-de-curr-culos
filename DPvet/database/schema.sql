CREATE DATABASE IF NOT EXISTS dpvet
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dpvet;

CREATE TABLE IF NOT EXISTS tutores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NULL,
    telefone VARCHAR(25) NOT NULL,
    email VARCHAR(150) NULL,
    endereco VARCHAR(255) NULL,
    observacoes TEXT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_tutores_cpf (cpf),
    KEY idx_tutores_nome (nome),
    KEY idx_tutores_telefone (telefone)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS animais (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT UNSIGNED NOT NULL,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(80) NULL,
    sexo ENUM('Macho','Fêmea','Não informado') NOT NULL DEFAULT 'Não informado',
    data_nascimento DATE NULL,
    peso DECIMAL(6,2) NULL,
    cor VARCHAR(60) NULL,
    observacoes TEXT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_animais_tutor FOREIGN KEY (tutor_id) REFERENCES tutores(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    KEY idx_animais_nome (nome),
    KEY idx_animais_tutor (tutor_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS consultas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    animal_id INT UNSIGNED NOT NULL,
    data_hora DATETIME NOT NULL,
    motivo VARCHAR(180) NOT NULL,
    status ENUM('Agendada','Em atendimento','Concluída','Cancelada') NOT NULL DEFAULT 'Agendada',
    sintomas TEXT NULL,
    diagnostico TEXT NULL,
    tratamento TEXT NULL,
    observacoes TEXT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_consultas_animal FOREIGN KEY (animal_id) REFERENCES animais(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    KEY idx_consultas_data (data_hora),
    KEY idx_consultas_status (status),
    KEY idx_consultas_animal (animal_id)
) ENGINE=InnoDB;
