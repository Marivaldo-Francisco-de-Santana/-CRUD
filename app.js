const express = require('express');
const db = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// ================= CPF =================
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0, resto;

    for (let i = 1; i <= 9; i++)
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++)
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpf.substring(10, 11));
}

// ================= CNPJ =================
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);

    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho++;
    numeros = cnpj.substring(0, tamanho);

    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return resultado === parseInt(digitos.charAt(1));
}

// ================= HOME =================
app.get('/', (req, res) => {

    const nome = req.query.nome || '';

    let sql = 'SELECT * FROM clientes';
    let params = [];

    if (nome) {
        sql += ' WHERE nome LIKE ?';
        params.push(`%${nome}%`);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Erro ao buscar clientes");
        }

        res.render('index', {
            clientes: results,
            nome: nome
        });
    });
});

// ================= LISTAR CLIENTES =================
app.get('/clientes', (req, res) => {

    const nome = req.query.nome || '';

    let sql = 'SELECT * FROM clientes';
    let params = [];

    if (nome) {
        sql += ' WHERE nome LIKE ?';
        params.push(`%${nome}%`);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Erro ao buscar clientes");
        }

        res.render('clientes', {
            clientes: results,
            nome: nome   // 🔥 ESSENCIAL
        });
    });
});

// ================= NOVO =================
app.get('/clientes/novo', (req, res) => {
    res.render('cliente_novo');
});

// ================= SALVAR =================
app.post('/clientes/salvar', (req, res) => {

    const { nome, email, telefone, cpf, cnpj } = req.body;

    if (cpf && !validarCPF(cpf)) {
        return res.send('<script>alert("CPF inválido!");history.back();</script>');
    }

    if (cnpj && !validarCNPJ(cnpj)) {
        return res.send('<script>alert("CNPJ inválido!");history.back();</script>');
    }

    db.query(
        'INSERT INTO clientes (nome,email,telefone,cpf,cnpj) VALUES (?,?,?,?,?)',
        [nome, email, telefone, cpf, cnpj],
        (err) => {
            if (err) {
                console.log(err);
                return res.send("Erro ao salvar cliente");
            }
            res.redirect('/clientes');
        }
    );
});

// ================= VER =================
app.get('/clientes/ver/:id', (req, res) => {

    db.query(
        'SELECT * FROM clientes WHERE id = ?',
        [req.params.id],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.send("Erro ao buscar cliente");
            }

            if (!results.length) {
                return res.send("Cliente não encontrado");
            }

            res.render('cliente_ver', {
                cliente: results[0]
            });
        }
    );
});

// ================= EDITAR =================
app.get('/clientes/editar/:id', (req, res) => {

    db.query(
        'SELECT * FROM clientes WHERE id = ?',
        [req.params.id],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.send("Erro ao buscar cliente");
            }

            res.render('cliente_editar', {
                cliente: results[0]
            });
        }
    );
});

// ================= ATUALIZAR =================
app.post('/clientes/atualizar/:id', (req, res) => {

    const { nome, email, telefone, cpf, cnpj } = req.body;

    if (cpf && !validarCPF(cpf)) {
        return res.send('<script>alert("CPF inválido!");history.back();</script>');
    }

    if (cnpj && !validarCNPJ(cnpj)) {
        return res.send('<script>alert("CNPJ inválido!");history.back();</script>');
    }

    db.query(
        'UPDATE clientes SET nome=?,email=?,telefone=?,cpf=?,cnpj=? WHERE id=?',
        [nome, email, telefone, cpf, cnpj, req.params.id],
        (err) => {
            if (err) {
                console.log(err);
                return res.send("Erro ao atualizar cliente");
            }
            res.redirect('/clientes');
        }
    );
});

// ================= EXCLUIR =================
app.get('/clientes/excluir/:id', (req, res) => {

    db.query(
        'DELETE FROM clientes WHERE id=?',
        [req.params.id],
        (err) => {
            if (err) {
                console.log(err);
                return res.send("Erro ao excluir cliente");
            }
            res.redirect('/clientes');
        }
    );
});

// ================= SERVER =================
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor rodando em http://localhost:3000');
});