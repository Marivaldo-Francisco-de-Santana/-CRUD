const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root_senha',
  database: process.env.DB_NAME || 'crud_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// QUERY ATUALIZADA: Adicionado cpf e cnpj
const criarTabelaQuery = `
  CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    cpf VARCHAR(14),
    cnpj VARCHAR(18)
  );
`;

db.query(criarTabelaQuery, (err) => {
  if (err) {
    console.error('Erro ao criar/verificar a tabela clientes:', err);
  } else {
    console.log('Banco de dados MySQL pronto e tabela "clientes" verificada!');
  }
});

module.exports = db;

