const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTA = 3000;
const PASTA_PUBLIC = path.join(__dirname, 'public');

// Lê um arquivo HTML da pasta public e troca os marcadores {{chave}} pelos valores informados
function enviarPagina(res, status, arquivo, valores = {}) {
  fs.readFile(path.join(PASTA_PUBLIC, arquivo), 'utf-8', (erro, conteudo) => {
    if (erro) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Erro interno ao carregar a página.');
      return;
    }

    for (const chave in valores) {
      conteudo = conteudo.split(`{{${chave}}}`).join(valores[chave]);
    }

    res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(conteudo);
  });
}

function enviarErro(res, mensagem) {
  enviarPagina(res, 400, 'erro.html', { mensagem });
}

// Converte o texto recebido na URL em número (aceita "7.5" ou "7,5")
function lerNota(valor) {
  const texto = valor.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(texto)) return NaN;
  return Number(texto);
}

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Método não permitido.');
    return;
  }

  if (url.pathname === '/') {
    enviarPagina(res, 200, 'index.html');
    return;
  }

  if (url.pathname === '/style.css') {
    fs.readFile(path.join(PASTA_PUBLIC, 'style.css'), (erro, conteudo) => {
      res.writeHead(erro ? 404 : 200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end(erro ? '' : conteudo);
    });
    return;
  }

  if (url.pathname === '/media') {
    const p1Texto = url.searchParams.get('p1');
    const p2Texto = url.searchParams.get('p2');

    // Notas não informadas
    if (p1Texto === null || p1Texto.trim() === '' || p2Texto === null || p2Texto.trim() === '') {
      enviarErro(res, 'As notas P1 e P2 devem ser informadas. Exemplo: /media?p1=7.5&amp;p2=5.0');
      return;
    }

    const p1 = lerNota(p1Texto);
    const p2 = lerNota(p2Texto);

    // Valores inválidos (não numéricos ou fora do intervalo 0 a 10)
    if (Number.isNaN(p1) || Number.isNaN(p2)) {
      enviarErro(res, 'As notas devem ser valores numéricos. Exemplo: p1=7.5');
      return;
    }
    if (p1 < 0 || p1 > 10 || p2 < 0 || p2 > 10) {
      enviarErro(res, 'As notas devem estar entre 0 e 10.');
      return;
    }

    const media = (p1 + p2) / 2;
    const aprovado = media >= 6.0;

    enviarPagina(res, 200, aprovado ? 'aprovado.html' : 'reprovado.html', {
      p1: p1.toFixed(1),
      p2: p2.toFixed(1),
      media: media.toFixed(2),
      situacao: aprovado ? 'APROVADO' : 'REPROVADO'
    });
    return;
  }

  // Página inexistente
  enviarPagina(res, 404, '404.html');
});

servidor.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
