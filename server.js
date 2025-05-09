const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

const PASTA_ATENDIMENTOS = path.join(__dirname, "atendimentos");

function gerarTabela(titulo, dados, tipo) {
  const filtrados = dados.filter((item) => item.tipo === tipo);

  return `
    <html>
      <head>
        <title>${titulo} | RBF Motos</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background-color: #111;
            color: #f2f2f2;
            padding: 30px;
          }
          h1 {
            text-align: center;
            font-size: 2rem;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background-color: #222;
            box-shadow: 0 0 10px rgba(255, 255, 0, 0.2);
          }
          th, td {
            padding: 12px;
            border: 1px solid #333;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            color: #111;
          }
          tr:nth-child(even) {
            background-color: #1c1c1c;
          }
          .logo {
            display: block;
            margin: 0 auto 20px auto;
            height: 100px;
          }
          a, button {
            color: #f2f2f2;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            background-color: #333;
            padding: 10px 15px;
            border: none;
            cursor: pointer;
            font-size: 1rem;
          }
          button:hover {
            background-color: #555;
          }
        </style>
      </head>
      <body>
        <h1>${titulo}</h1>
        <table>
          <tr>
            <th>Telefone</th>
            <th>Mensagem</th>
            <th>Data</th>
          </tr>
          ${filtrados
            .map(
              (item) => `
            <tr>
              <td>${item.telefone}</td>
              <td>${item.mensagem}</td>
              <td>${new Date(item.criadoEm).toLocaleString()}</td>
            </tr>`
            )
            .join("")}
        </table>
        <div style="text-align: center; margin-top: 20px;">
          <a href="/agendamentos">
            <button>📅 Ver Agendamentos</button>
          </a>
          <a href="/orcamentos">
            <button>💰 Ver Orçamentos</button>
          </a>
        </div>
      </body>
    </html>
  `;
}

app.get("/agendamentos", (req, res) => {
  const arquivos = fs.readdirSync(PASTA_ATENDIMENTOS);
  const dados = arquivos.map((arquivo) => {
    const conteudo = fs.readFileSync(path.join(PASTA_ATENDIMENTOS, arquivo));
    return JSON.parse(conteudo);
  });

  res.send(gerarTabela("📅 Agendamentos RBF Motos", dados, "agendamento"));
});

app.get("/orcamentos", (req, res) => {
  const arquivos = fs.readdirSync(PASTA_ATENDIMENTOS);
  const dados = arquivos.map((arquivo) => {
    const conteudo = fs.readFileSync(path.join(PASTA_ATENDIMENTOS, arquivo));
    return JSON.parse(conteudo);
  });

  res.send(gerarTabela("💰 Orçamentos RBF Motos", dados, "orcamento"));
});

app.listen(PORT, () => {
  console.log(`✅ Painel RBF Motos online em:`);
  console.log(`📅 http://localhost:${PORT}/agendamentos`);
  console.log(`💰 http://localhost:${PORT}/orcamentos`);
});
