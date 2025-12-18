// Modelos SQL para o sistema de afiliados

export const createTablesSQL = `
CREATE TABLE IF NOT EXISTS afiliados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  link_unico VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cliques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  afiliado_id INT,
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (afiliado_id) REFERENCES afiliados(id)
);

CREATE TABLE IF NOT EXISTS vendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  afiliado_id INT,
  valor DECIMAL(10,2) NOT NULL,
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pendente','confirmada','paga') DEFAULT 'pendente',
  FOREIGN KEY (afiliado_id) REFERENCES afiliados(id)
);
`;
