const venom = require("venom-bot");
const fs = require("fs");
const path = require("path");

// Estados globais
const estadoUsuario = {};
const timeoutsUsuarios = {};
const TEMPO_INATIVIDADE = 5 * 60 * 1000; // 5 minutos
const PASTA_ATENDIMENTOS = path.join(__dirname, "atendimentos");

if (!fs.existsSync(PASTA_ATENDIMENTOS)) {
  fs.mkdirSync(PASTA_ATENDIMENTOS);
}

// Cria sessão do bot
venom
  .create({ session: "rbf-motos-bot" })
  .then((client) => start(client))
  .catch((err) => console.error("Erro ao iniciar o bot:", err));

// Função principal
function start(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg) return;

    const msg = message.body.trim();
    const sender = message.from;
    const dataAtual = new Date().toISOString();

    iniciarTimeoutInatividade(client, sender);

    // AGENDAMENTO
    if (estadoUsuario[sender] === "aguardando_agendamento") {
      const agendamento = {
        mensagem: msg,
        telefone: sender,
        criadoEm: dataAtual,
        tipo: "agendamento",
      };

      salvarArquivo(agendamento, sender);
      delete estadoUsuario[sender];

      await client.sendText(
        "557192724383@c.us",
        `📅 *Novo agendamento recebido:*\n\n${msg}\n\n📲 Cliente: ${sender}`
      );

      return client.sendText(
        sender,
        "✅ *Seu agendamento foi registrado!*\nEm breve entraremos em contato para confirmar."
      );
    }

    // ORÇAMENTO
    if (estadoUsuario[sender] === "aguardando_orcamento") {
      const orcamento = {
        mensagem: msg,
        telefone: sender,
        criadoEm: dataAtual,
        tipo: "orcamento",
      };

      salvarArquivo(orcamento, sender);
      delete estadoUsuario[sender];

      return client.sendText(
        sender,
        "✅ *Seu pedido de orçamento foi registrado!*\nResponderemos em breve com os detalhes."
      );
    }

    // MENU PRINCIPAL
    switch (msg.toLowerCase()) {
      case "1":
        estadoUsuario[sender] = "aguardando_agendamento";
        return client.sendText(
          sender,
          "📅 *Agendamento de Serviço*\n\nPor favor, envie agora as informações do serviço:\nNome, modelo da moto, serviço desejado e data/hora."
        );

      case "2":
        estadoUsuario[sender] = "aguardando_orcamento";
        return client.sendText(
          sender,
          "💰 *Solicitação de Orçamento*\n\nPor favor, envie agora as informações:\nModelo da moto, serviço desejado e descrição do problema."
        );

      case "3":
        const latitude = -12.701601974992823;
        const longitude = -38.33495505027141;

        await client.sendLocation(
          sender,
          latitude,
          longitude,
          "📍 RBF Motos",
          "RTv. Segunda da Derba, 34 - Camaçari de Dentro, Camaçari - BA, 42804-525"
        );

        return client.sendText(
          sender,
          "🕒 *Horário de atendimento:*\nSegunda a Sexta, das 8h às 18h\n📞 (71) 99272-4383\n📸 Instagram: @rbf.motos"
        );

      case "4":
        return client.sendText(
          sender,
          "🔔 Um atendente foi acionado. Por favor, aguarde..."
        );

      default:
        return client.sendText(
          sender,
          "🏍️ *Bem-vindo à RBF Motos!*\n\nComo podemos te ajudar?\n\n1️⃣ Agendar um serviço\n2️⃣ Solicitar orçamento\n3️⃣ Informações (endereço e horário)\n4️⃣ Falar com um atendente\n\n*Responda com o número da opção.*"
        );
    }
  });
}

// ⏱️ Função de timeout por inatividade
function iniciarTimeoutInatividade(client, sender) {
  if (timeoutsUsuarios[sender]) {
    clearTimeout(timeoutsUsuarios[sender]);
  }

  timeoutsUsuarios[sender] = setTimeout(() => {
    client.sendText(
      sender,
      "⌛ Encerramos esse atendimento por inatividade. Se precisar de mais alguma coisa, estamos à disposição! 👍"
    );
    delete timeoutsUsuarios[sender];
  }, TEMPO_INATIVIDADE);
}

// 💾 Função para salvar agendamentos/orçamentos em JSON
function salvarArquivo(objeto, sender) {
  const nomeArquivo = `${Date.now()}_${sender.replace(/\D/g, "")}.json`;
  const caminho = path.join(PASTA_ATENDIMENTOS, nomeArquivo);

  fs.writeFileSync(caminho, JSON.stringify(objeto, null, 2));
  console.log(`✅ Salvo: ${nomeArquivo}`);
}
