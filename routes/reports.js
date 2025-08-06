const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Task = require('../models/Task');
const Device = require('../models/Device');
const moment = require('moment');

// Programa de 21 dias de aquecimento
const WARMUP_PROGRAM = {
  1: {
    day: 1,
    title: "Configuração Inicial",
    tasks: [
      "Inserir uma Foto 70% Feminina 30% Masculina",
      "Trocar o Metadados da imagem",
      "Colocar nome e sobrenome comum de pessoa",
      "Inserir uma mensagem na descrição",
      "Ativar verificação de duas etapas",
      "Preenche todos os dados solicitados",
      "Não realizar mais nada",
      "Se possível deixar 24 ou 48 horas sem uso"
    ]
  },
  2: {
    day: 2,
    title: "Primeiros Contatos",
    tasks: [
      "Entrar em 2 grupos de Whatsapp",
      "Receber 2 msg na manhã",
      "Receber 3 msg na tarde",
      "Receber 4 áudios na manhã",
      "Receber 1 áudios na tarde",
      "Receber 3 img na manhã",
      "Receber 2 img na tarde",
      "Receber 1 vídeo na manhã",
      "Receber 1 vídeo na tarde",
      "Apagar uma mensagem em 2 conversas diferentes"
    ]
  },
  3: {
    day: 3,
    title: "Expansão de Contatos",
    tasks: [
      "Conversar com 2 contatos na manhã",
      "Conversar com 3 contatos na tarde (mais os contatos do dia anterior)",
      "Receber 4 msg na manhã",
      "Receber 3 msg na tarde",
      "Receber 3 áudios na manhã",
      "Receber 4 áudios na tarde",
      "Receber 3 img na manhã",
      "Receber 2 img na tarde",
      "Receber 2 vídeo na manhã",
      "Receber 3 vídeo na tarde",
      "Criar um grupo e colocar 3 pessoas",
      "Interagir em grupo criado no dia",
      "Entrar em 2 grupos de Whatsapp",
      "Enviar 4 msg de áudio nos grupos",
      "Encaminhar 3 mensagens",
      "Apagar 3 mensagens em conversas diferentes",
      "Enviar figurinha para 3 contatos",
      "Enviar emoji para 5 conversas",
      "Enviar 2 img para contatos diferentes",
      "Enviar 1 pdf para contatos diferentes",
      "Dar um toque ligando pra alguém e desligar",
      "Marcar uma conversa como não lida",
      "Postar 3 status"
    ]
  },
  4: {
    day: 4,
    title: "Atividade Intensificada",
    tasks: [
      "Conversar com 8 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 6 msg na manhã",
      "Receber 5 msg na tarde",
      "Receber 4 áudios na manhã",
      "Receber 4 áudios na tarde",
      "Receber 6 img na manhã",
      "Receber 3 img na tarde",
      "Receber 3 vídeo na manhã",
      "Receber 2 vídeo na tarde",
      "Adicionar 6 Vcard",
      "Fixar 1 contato",
      "Entrar em 2 grupos de Whatsapp",
      "Fazer 1 ligação de áudio na manhã 10min",
      "Fazer uma chamada de vídeo à tarde 5min",
      "Receber 2 ligações de audio 8 min ao longo do dia",
      "Receber 2 ligação de vídeo 10 min ao longo do dia",
      "Enviar 12 imagem temporária manhã para 36 contatos diferentes",
      "Enviar 11 imagem temporária tarde para 29 contatos diferentes",
      "Enviar 7 áudios",
      "Encaminhar 5 mensagens",
      "Apagar 5 mensagens em conversas diferentes",
      "Arquivar 2 conversas",
      "Favoritar 5 mensagens",
      "Postar 5 status"
    ]
  },
  5: {
    day: 5,
    title: "Consolidação",
    tasks: [
      "Conversar com 17 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 10 msg na manhã",
      "Receber 6 msg na tarde",
      "Receber 8 áudios na manhã",
      "Receber 6 áudios na tarde",
      "Receber 6 img na manhã",
      "Receber 5 img na tarde",
      "Receber 4 vídeo na manhã",
      "Receber 5 vídeo na tarde",
      "Adicionar 2 Vcard",
      "Trocar foto do perfil",
      "Fazer 2 ligações de áudio na manhã 15min",
      "Fazer 1 chamada de vídeo à tarde 10min",
      "Receber 2 ligações de audio 8 min ao longo do dia",
      "Receber 2 ligação de vídeo 10 min ao longo do dia",
      "Enviar 12 imagem temporária manhã para 36 contatos diferentes",
      "Enviar 11 imagem temporária tarde para 29 contatos diferentes",
      "Sair de 3 grupos",
      "Entrar em 1 grupo",
      "Enviar 10 áudios",
      "Encaminhar 1 mensagem",
      "Apagar 3 mensagens em conversas diferentes",
      "Compartilhar 2 contatos",
      "Limpar 2 conversas",
      "Postar 12 status"
    ]
  },
  6: {
    day: 6,
    title: "Expansão Avançada",
    tasks: [
      "Conversar com 21 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 14 msg na manhã",
      "Receber 9 msg na tarde",
      "Receber 6 áudios na manhã",
      "Receber 4 áudios na tarde",
      "Receber 5 img na manhã",
      "Receber 9 img na tarde",
      "Receber 6 vídeo na manhã",
      "Receber 3 vídeo na tarde",
      "Adicionar 4 Vcard",
      "Ter contato salvo em 3 contas de whats",
      "Apagar 4 conversas",
      "Fazer 3 ligações de áudio na manhã 15min",
      "Fazer 1 chamada de vídeo à tarde 10min",
      "Receber 2 ligações de audio 8 min ao longo do dia",
      "Receber 2 ligação de vídeo 10 min ao longo do dia",
      "Enviar 12 imagem temporária manhã para 36 contatos diferentes",
      "Enviar 11 imagem temporária tarde para 29 contatos diferentes",
      "Receber 4 ligações de audio 5 min",
      "Receber 2 ligações de vídeo 8 min",
      "Entrar em 2 grupo",
      "Enviar figurinha para 5 conversas",
      "Enviar emoji para 3 conversas",
      "Enviar 8 áudios",
      "Encaminhar 4 mensagens",
      "Apagar 4 mensagens em conversas diferentes",
      "Reagir à 10 mensagens",
      "Enviar 2 documentos",
      "Enviar 3 imagens",
      "Postar 28 status"
    ]
  },
  7: {
    day: 7,
    title: "Atividade Completa",
    tasks: [
      "Conversar com 25 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 14 msg na manhã",
      "Receber 9 msg na tarde",
      "Receber 6 áudios na manhã",
      "Receber 4 áudios na tarde",
      "Receber 5 img na manhã",
      "Receber 9 img na tarde",
      "Receber 6 vídeo na manhã",
      "Receber 3 vídeo na tarde",
      "Adicionar 6 Vcard",
      "Ter contato salvo em 6 contas de whats",
      "Criar um grupo e colocar 3 pessoas - interagir no grupo",
      "Entrar em 6 grupos de Whatsapp",
      "Silenciar 1 grupo",
      "Fazer 5 ligações de áudio na manhã 4 min",
      "Fazer 1 chamada de vídeo à tarde 3 min",
      "Receber 2 ligações de audio 8 min ao longo do dia",
      "Receber 2 ligação de vídeo 10 min ao longo do dia",
      "Enviar 12 imagem temporária manhã para 36 contatos diferentes",
      "Enviar 11 imagem temporária tarde para 29 contatos diferentes",
      "Enviar 10 áudios",
      "Enviar 5 imagem temporária manhã",
      "Enviar 4 imagem temporária tarde",
      "Apagar 2 mensagens em conversas diferentes",
      "Enviar figurinha para 10 conversas",
      "Enviar emoji para 5 conversas",
      "Compartilhar 6 contatos",
      "Arquivar 1 conversa",
      "Silenciar notificações de 3 grupos",
      "Postar 64 status"
    ]
  },
  8: {
    day: 8,
    title: "Intensificação",
    tasks: [
      "Conversar com 32 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 18 msg na manhã",
      "Receber 12 msg na tarde",
      "Receber 12 áudios na manhã",
      "Receber 6 áudios na tarde",
      "Receber 8 img na manhã",
      "Receber 13 img na tarde",
      "Receber 9 vídeo na manhã",
      "Receber 1 vídeo na tarde",
      "Adicionar 5 Vcard",
      "Ter contato salvo em 4 contas de whats",
      "Enviar 2 msg com link",
      "Fazer 2 ligações de áudio na manhã 5 min",
      "Fazer 1 chamada de vídeo à tarde 8 min",
      "Receber 2 ligações de audio 8 min ao longo do dia",
      "Receber 2 ligação de vídeo 10 min ao longo do dia",
      "Enviar 12 imagem temporária manhã para 36 contatos diferentes",
      "Enviar 11 imagem temporária tarde para 29 contatos diferentes",
      "Enviar 5 áudios",
      "Encaminhar 5 mensagens",
      "Enviar um gif para 6 conversas",
      "Enviar 2 documentos",
      "Enviar 6 fotos",
      "Arquivar 5 conversas",
      "Favoritar 2 mensagens",
      "Postar 96 status"
    ]
  },
  9: {
    day: 9,
    title: "Expansão Massiva",
    tasks: [
      "Conversar com 39 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 23 msg na manhã",
      "Receber 16 msg na tarde",
      "Receber 16 áudios na manhã",
      "Receber 6 áudios na tarde",
      "Receber 12 img na manhã",
      "Receber 9 img na tarde",
      "Receber 12 vídeo na manhã",
      "Receber 9 vídeo na tarde",
      "Receber 1 ligações de audio 3 min ao longo do dia",
      "Receber 2 ligação de vídeo 12 min ao longo do dia",
      "Fazer 6 ligações de áudio na manhã 5 min",
      "Fazer 1 chamada de vídeo à tarde 1 min",
      "Enviar 12 imagem temporária manhã para 36 contatos diferentes",
      "Enviar 11 imagem temporária tarde para 29 contatos diferentes",
      "Adicionar 11 Vcard",
      "Ter contato salvo em 8 contas de whats",
      "Entrar em 3 grupos de Whatsapp",
      "Silenciar 1 grupo",
      "Enviar 12 áudios",
      "Encaminhar 6 mensagens",
      "Apagar 8 mensagens em conversas diferentes",
      "Enviar figurinha para 11 conversas",
      "Enviar emoji para 12 conversas",
      "Enviar 8 gifs para conversas diferentes",
      "Dar um toque ligando para 3 contatos e desligar",
      "Sair de um grupo",
      "Reagir 15 mensagens",
      "Postar 121 status"
    ]
  },
  10: {
    day: 10,
    title: "Consolidação Avançada",
    tasks: [
      "Conversar com 42 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 28 msg na manhã",
      "Receber 20 msg na tarde",
      "Receber 19 áudios na manhã",
      "Receber 4 áudios na tarde",
      "Receber 16 img na manhã",
      "Receber 16 img na tarde",
      "Receber 14 vídeo na manhã",
      "Receber 8 vídeo na tarde",
      "Adicionar 16 Vcard",
      "Ter contato salvo em 12 contas de whats",
      "Reagir à 20 mensagens",
      "Fazer 1 ligações de áudio na manhã 12min",
      "Fazer 1 chamada de vídeo à tarde 8 min",
      "Receber 2 ligações de audio 8 min ao longo do dia",
      "Receber 2 ligação de vídeo 10 min ao longo do dia",
      "Enviar 12 imagem temporária manhã para 36 contatos diferentes",
      "Enviar 11 imagem temporária tarde para 29 contatos diferentes",
      "Sair de 2 grupos",
      "Apagar 5 conversas",
      "Enviar 15 áudios",
      "Encaminhar 5 mensagens",
      "Apagar 3 mensagens em conversas diferentes",
      "Enviar figurinhas para 12 conversas",
      "Enviar emoji para 16 conversas",
      "Enviar 12 gifs para conversas diferentes",
      "Compartilhar 11 fotos",
      "Postar 210 status"
    ]
  },
  11: {
    day: 11,
    title: "Atividade Intensa",
    tasks: [
      "Conversar com 46 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 32 msg na manhã",
      "Receber 21 msg na tarde",
      "Receber 23 áudios na manhã",
      "Receber 3 áudios na tarde",
      "Receber 19 img na manhã",
      "Receber 9 img na tarde",
      "Receber 18 vídeo na manhã",
      "Receber 4 vídeo na tarde",
      "Silenciar notificações de 2 grupos",
      "Adicionar 21 Vcard",
      "Ter contato salvo em 19 contas de whats",
      "Criar um grupo e colocar 8 pessoas - interagir no grupo",
      "Entrar em 1 grupos de Whatsapp",
      "Fazer 2 ligações de áudio na manhã 4 min",
      "Fazer 2 chamada de vídeo à tarde 3 min",
      "Receber 2 ligações de audio 8 min ao longo do dia",
      "Receber 2 ligação de vídeo 10 min ao longo do dia",
      "Enviar 12 imagem temporária manhã para 36 contatos diferentes",
      "Enviar 11 imagem temporária tarde para 29 contatos diferentes",
      "Enviar 10 áudios",
      "Encaminhar 10 mensagens",
      "Apagar 8 mensagens em conversas diferentes",
      "Enviar figurinha para 10 conversas",
      "Enviar emoji para 9 conversas",
      "Enviar 16 gifs para conversas diferentes",
      "Compartilhar 1 contato",
      "Marcar como não lida 5 conversas",
      "Enviar 320 links"
    ]
  },
  12: {
    day: 12,
    title: "Expansão Contínua",
    tasks: [
      "Conversar com 51 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 36 msg na manhã",
      "Receber 12 áudios na tarde",
      "Receber 22 img na manhã",
      "Receber 10 vídeos na tarde",
      "Adicionar 29 Vcard",
      "Ter contato salvo em 16 contas de whats",
      "Fixar 2 conversas",
      "Fazer 3 ligações de áudio na manhã 14 min",
      "Fazer 2 chamada de vídeo à tarde 9 min",
      "Receber 4 ligações de audio 16 min ao longo do dia",
      "Receber 2 ligação de vídeo 30 min ao longo do dia",
      "Enviar 17 imagem temporária manhã para 41 contatos diferentes",
      "Enviar 21 imagem temporária tarde para 36 contatos diferentes",
      "Reagir 12 mensagens",
      "Entrar em 3 grupos",
      "Silenciar 2 grupos",
      "Enviar figurinha para 7 conversas",
      "Enviar emoji para 6 conversas",
      "Enviar 12 gifs para conversas diferentes",
      "Enviar 8 áudios",
      "Encaminhar 4 mensagens",
      "Apagar 6 mensagens em conversas diferentes",
      "Enviar 2 documentos",
      "Postar 360 status"
    ]
  },
  13: {
    day: 13,
    title: "Consolidação Final",
    tasks: [
      "Conversar com 56 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 42 msg na manhã",
      "Receber 33 msg na tarde",
      "Receber 31 áudios na manhã",
      "Receber 16 áudios na tarde",
      "Receber 28 img na manhã",
      "Receber 29 img na tarde",
      "Receber 16 vídeos na manhã",
      "Receber 12 vídeos na tarde",
      "Adicionar 26 Vcard",
      "Ter contato salvo em 32 contas de whats",
      "Sair de 1 grupo",
      "Entrar em 2 grupos de Whatsapp",
      "Fazer 2 ligações de áudio na manhã 4 min",
      "Fazer 2 chamada de vídeo à tarde 3 min",
      "Receber 2 ligações de audio 20 min ao longo do dia",
      "Receber 1 ligação de vídeo 25 min ao longo do dia",
      "Enviar 21 imagem temporária manhã para 44 contatos diferentes",
      "Enviar 16 imagem temporária tarde para 39 contatos diferentes",
      "Enviar 10 áudios",
      "Encaminhar 5 mensagens",
      "Enviar uma figurinha para 8 conversas",
      "Enviar 5 fotos",
      "Favoritar 10 mensagens",
      "Marcar 5 conversas como não lida",
      "Postar 410 status"
    ]
  },
  14: {
    day: 14,
    title: "Manutenção Ativa",
    tasks: [
      "Conversar com 59 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 46 msg na manhã",
      "Receber 39 msg na tarde",
      "Receber 26 áudios na manhã",
      "Receber 18 áudios na tarde",
      "Receber 32 img na manhã",
      "Receber 22 img na tarde",
      "Receber 12 vídeos na manhã",
      "Receber 11 vídeos na tarde",
      "Silenciar notificações de 3 grupos",
      "Fixar 1 conversas",
      "Fazer 4 ligações de áudio na manhã 12 min",
      "Fazer 3 chamada de vídeo à tarde 2 min",
      "Receber 3 ligações de audio 8 min ao longo do dia",
      "Receber 2 ligação de vídeo 6 min ao longo do dia",
      "Enviar 5 imagem temporária manhã para 49 contatos diferentes",
      "Enviar 8 imagem temporária tarde para 44 contatos diferentes",
      "Enviar figurinha para 5 conversas",
      "Enviar emoji para 4 conversas",
      "Entrar em 2 grupos",
      "Enviar 10 áudios",
      "Encaminhar 8 mensagens",
      "Apagar 2 mensagens em conversas diferentes",
      "Apagar 2 conversas",
      "Postar entre 400 e 600 status (aleatório)"
    ]
  },
  15: {
    day: 15,
    title: "Estabilização",
    tasks: [
      "Conversar com 62 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 58 msg na manhã",
      "Receber 44 msg na tarde",
      "Receber 26 áudios na manhã",
      "Receber 16 áudios na tarde",
      "Receber 33 img na manhã",
      "Receber 29 img na tarde",
      "Receber 16 vídeos na manhã",
      "Receber 15 vídeos na tarde",
      "Adicionar 15 Vcard",
      "Ter contato salvo em 68 contas de whats",
      "Trocar foto do perfil de Whatsapp",
      "Sair de 1 grupos",
      "Enviar 10 áudios",
      "Encaminhar 1 mensagem",
      "Apagar 5 mensagens em conversas diferentes",
      "Enviar figurinha para 16 conversas",
      "Enviar emoji para 14 conversas",
      "Enviar 6 gifs para conversas diferentes",
      "Compartilhar 3 contatos",
      "Limpar 2 conversas",
      "Fazer 6 ligações de áudio na manhã 5 min",
      "Fazer 1 chamada de vídeo à tarde 1 min",
      "Receber 1 ligações de audio 1 min ao longo do dia",
      "Receber 2 ligação de vídeo 2 min ao longo do dia",
      "Enviar 5 imagem temporária manhã para 49 contatos diferentes",
      "Enviar 8 imagem temporária tarde para 44 contatos diferentes",
      "Postar entre 400 e 600 status (aleatório)"
    ]
  },
  16: {
    day: 16,
    title: "Otimização",
    tasks: [
      "Conversar com 66 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 64 msg na manhã",
      "Receber 51 msg na tarde",
      "Receber 32 áudios na manhã",
      "Receber 22 áudios na tarde",
      "Receber 36 img na manhã",
      "Receber 19 img na tarde",
      "Receber 22 vídeos na manhã",
      "Receber 16 vídeos na tarde",
      "Trocar foto do perfil de Whatsapp",
      "Postar 4 status durante o dia",
      "Entrar em 2 grupos",
      "Silenciar 1 grupo",
      "Limpar 10 conversas",
      "Gravar 10 áudios",
      "Enviar figurinha para 21 conversas",
      "Enviar emoji para 18 conversas",
      "Enviar 9 gifs para conversas diferentes",
      "Excluir 4 contatos",
      "Enviar 5 fotos durante o dia",
      "Fazer 1 ligações de áudio na manhã 5 min",
      "Fazer 1 chamada de vídeo à tarde 2 min",
      "Receber 3 ligações de audio 12 min ao longo do dia",
      "Receber 2 ligação de vídeo 4 min ao longo do dia",
      "Enviar 3 imagem temporária manhã para 50 contatos diferentes",
      "Enviar 3 imagem temporária tarde para 48 contatos diferentes",
      "Postar entre 400 e 600 status (aleatório)"
    ]
  },
  17: {
    day: 17,
    title: "Manutenção Avançada",
    tasks: [
      "Conversar com 69 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 72 msg na manhã",
      "Receber 64 msg na tarde",
      "Receber 41 áudios na manhã",
      "Receber 36 áudios na tarde",
      "Receber 48 img na manhã",
      "Receber 23 img na tarde",
      "Receber 29 vídeos na manhã",
      "Receber 25 vídeos na tarde",
      "Sair de 3 grupos",
      "Silenciar 1 grupo",
      "Postar 3 status durante o dia",
      "Limpar conversas de 3 grupos",
      "Entrar em 2 grupos",
      "Fazer 8 ligações de áudio na manhã 14 min",
      "Fazer 5 chamada de vídeo à tarde 9 min",
      "Receber 4 ligações de audio 12 min ao longo do dia",
      "Receber 1 ligação de vídeo 4 min ao longo do dia",
      "Enviar 3 imagem temporária manhã para 52 contatos diferentes",
      "Enviar 3 imagem temporária tarde para 49 contatos diferentes",
      "Enviar 5 áudios",
      "Enviar emoji para 4 grupos",
      "Enviar figurinha para 21 conversas",
      "Enviar emoji para 14 conversas",
      "Enviar 6 gifs para conversas diferentes",
      "Bloquear 2 contatos",
      "Enviar 2 documentos",
      "Postar entre 400 e 600 status (aleatório)"
    ]
  },
  18: {
    day: 18,
    title: "Consolidação Final",
    tasks: [
      "Conversar com 72 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 81 msg na manhã",
      "Receber 72 msg na tarde",
      "Receber 44 áudios na manhã",
      "Receber 39 áudios na tarde",
      "Receber 56 img na manhã",
      "Receber 35 img na tarde",
      "Receber 32 vídeos na manhã",
      "Receber 29 vídeos na tarde",
      "Adicionar 29 Vcard",
      "Ter contato salvo em 34 contas de whats",
      "Enviar figurinhas para 3 grupos",
      "Limpar 10 conversas",
      "Arquivar 5 conversas",
      "Fazer 3 ligações de áudio na manhã 16 min",
      "Fazer 2 chamada de vídeo à tarde 3 min",
      "Receber 4 ligações de audio 5 min ao longo do dia",
      "Receber 2 ligações de vídeo 9 min ao longo do dia",
      "Enviar 4 imagem temporária manhã para 56 contatos diferentes",
      "Enviar 2 imagem temporária tarde para 51 contatos diferentes",
      "Compartilhar 3 contatos",
      "Enviar 5 fotos",
      "Enviar 3 links",
      "Enviar 4 áudios",
      "Enviar 3 vídeos",
      "Enviar 7 gifs para conversas diferentes",
      "Apagar 5 conversas",
      "Postar entre 400 e 600 status (aleatório)"
    ]
  },
  19: {
    day: 19,
    title: "Atividade Completa",
    tasks: [
      "Conversar com 78 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 96 msg na manhã",
      "Receber 94 msg na tarde",
      "Receber 58 áudios na manhã",
      "Receber 40 áudios na tarde",
      "Receber 62 img na manhã",
      "Receber 38 img na tarde",
      "Receber 36 vídeos na manhã",
      "Receber 18 vídeos na tarde",
      "Reagir à 20 mensagens durante o dia",
      "Adicionar 36 Vcard",
      "Ter contato salvo em 44 contas de whats",
      "Entrar em 2 grupos",
      "Fazer 5 ligações de áudio na manhã 10 min",
      "Fazer 5 chamada de vídeo à tarde 5 min",
      "Enviar 10 fotos para contatos diferentes, 2 para cada contato",
      "Receber 3 ligações no WhatsApp e recusar",
      "Receber 8 ligações de audio 7 min ao longo do dia",
      "Receber 3 ligações de vídeo 3 min ao longo do dia",
      "Enviar 2 imagem temporária manhã para 60 contatos diferentes",
      "Enviar 3 imagem temporária tarde para 55 contatos diferentes",
      "Enviar 3 documentos",
      "Enviar 6 áudios",
      "Enviar 8 links",
      "Arquivar 2 conversas",
      "Sair e excluir 2 grupos",
      "Postar entre 400 e 600 status (aleatório)"
    ]
  },
  20: {
    day: 20,
    title: "Pré-Finalização",
    tasks: [
      "Conversar com 82 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 104 msg na manhã",
      "Receber 98 msg na tarde",
      "Receber 63 áudios na manhã",
      "Receber 48 áudios na tarde",
      "Receber 79 img na manhã",
      "Receber 49 img na tarde",
      "Receber 65 vídeos na manhã",
      "Receber 29 vídeos na tarde",
      "Receber 1 ligação de 3min",
      "Adicionar 42 Vcard",
      "Ter contato salvo em 55 contas de whats",
      "Silenciar notificações de 1 grupo",
      "Compartilhar 2 contatos",
      "Fazer 6 ligações de áudio na manhã 12 min",
      "Fazer 5 chamada de vídeo à tarde 6 min",
      "Receber 5 ligações e recusar",
      "Receber 5 ligações de audio 4 min ao longo do dia",
      "Receber 1 ligações de vídeo 3 min ao longo do dia",
      "Enviar 1 imagem temporária manhã para 64 contatos diferentes",
      "Enviar 2 imagem temporária tarde para 58 contatos diferentes",
      "Encaminhar 5 mensagens",
      "Enviar 1 documento",
      "Enviar 18 áudios",
      "Enviar 16 links",
      "Ligar para 4 contatos",
      "Enviar 10 áudios",
      "Postar entre 400 e 600 status (aleatório)"
    ]
  },
  21: {
    day: 21,
    title: "Finalização",
    tasks: [
      "Conversar com 86 novos contatos ao longo do dia (mais os contatos dos dias anteriores)",
      "Receber 112 msg na manhã",
      "Receber 98 msg na tarde",
      "Receber 73 áudios na manhã",
      "Receber 54 áudios na tarde",
      "Receber 86 img na manhã",
      "Receber 58 img na tarde",
      "Receber 75 vídeos na manhã",
      "Receber 30 vídeos na tarde",
      "Mudar a mensagem do recado",
      "Encaminhar 3 mensagens",
      "Adicionar 54 Vcard",
      "Ter contato salvo em 68 contas de whats",
      "Entrar em 3 grupos",
      "Fazer 5 ligações de áudio na manhã 14 min",
      "Fazer 2 chamada de vídeo à tarde 8 min",
      "Receber 8 ligações de audio 10 min ao longo do dia",
      "Receber 10 ligações de vídeo 8 min ao longo do dia",
      "Enviar 2 imagem temporária manhã para 68 contatos diferentes",
      "Enviar 3 imagem temporária tarde para 60 contatos diferentes",
      "Apagar 5 mensagens em conversas diferentes",
      "Enviar 3 fotos",
      "Enviar 10 áudios",
      "Enviar 24 links",
      "Criar um grupo e colocar 4 pessoas - interagir no grupo",
      "Enviar figurinha para 32 contatos",
      "Enviar 1 emoji para 36 contatos",
      "Enviar 7 gifs para conversas diferentes",
      "Postar entre 400 e 600 status (aleatório)"
    ]
  }
};

// GET /api/reports/whatsapp/21days - Programa de 21 dias
router.get('/whatsapp/21days', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        title: "Programa de Aquecimento WhatsApp - 21 Dias",
        description: "Programa completo para aquecimento seguro de números WhatsApp",
        totalDays: 21,
        program: WARMUP_PROGRAM,
        summary: {
          totalTasks: Object.values(WARMUP_PROGRAM).reduce((sum, day) => sum + day.tasks.length, 0),
          averageTasksPerDay: Math.round(Object.values(WARMUP_PROGRAM).reduce((sum, day) => sum + day.tasks.length, 0) / 21),
          progression: "Crescimento gradual de atividade ao longo dos 21 dias"
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao obter programa de 21 dias'
    });
  }
});

// GET /api/reports/whatsapp/numbers - Listar todos os números
router.get('/whatsapp/numbers', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      type: { $in: ['whatsapp_message', 'whatsapp_media', 'whatsapp_group'] }
    }).populate('deviceId');

    // Extrair números únicos dos parâmetros das tarefas
    const phoneNumbers = new Set();
    const numberDetails = {};

    tasks.forEach(task => {
      if (task.parameters && task.parameters.phone) {
        const phone = task.parameters.phone;
        phoneNumbers.add(phone);
        
        if (!numberDetails[phone]) {
          numberDetails[phone] = {
            phone,
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            lastActivity: null,
            devices: new Set(),
            taskTypes: new Set()
          };
        }

        numberDetails[phone].totalTasks++;
        if (task.status === 'completed') numberDetails[phone].completedTasks++;
        if (task.status === 'failed') numberDetails[phone].failedTasks++;
        
        if (task.deviceId) {
          numberDetails[phone].devices.add(task.deviceId.deviceName);
        }
        
        numberDetails[phone].taskTypes.add(task.type);
        
        if (!numberDetails[phone].lastActivity || task.updatedAt > numberDetails[phone].lastActivity) {
          numberDetails[phone].lastActivity = task.updatedAt;
        }
      }
    });

    const numbers = Object.values(numberDetails).map(detail => ({
      ...detail,
      devices: Array.from(detail.devices),
      taskTypes: Array.from(detail.taskTypes),
      successRate: detail.totalTasks > 0 ? ((detail.completedTasks / detail.totalTasks) * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: {
        totalNumbers: numbers.length,
        numbers: numbers.sort((a, b) => b.totalTasks - a.totalTasks)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao obter números WhatsApp'
    });
  }
});

// GET /api/reports/whatsapp/numbers/:phone - Relatório detalhado por número
router.get('/whatsapp/numbers/:phone', auth, async (req, res) => {
  try {
    const { phone } = req.params;
    const { period = '30d' } = req.query;

    let startDate;
    switch (period) {
      case '7d':
        startDate = moment().subtract(7, 'days').toDate();
        break;
      case '30d':
        startDate = moment().subtract(30, 'days').toDate();
        break;
      case '90d':
        startDate = moment().subtract(90, 'days').toDate();
        break;
      default:
        startDate = moment().subtract(30, 'days').toDate();
    }

    const tasks = await Task.find({
      'parameters.phone': phone,
      createdAt: { $gte: startDate }
    }).populate('deviceId').sort({ createdAt: -1 });

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Número não encontrado ou sem atividade'
      });
    }

    // Estatísticas gerais
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const runningTasks = tasks.filter(t => t.status === 'running').length;

    // Estatísticas por tipo de tarefa
    const taskTypes = {};
    tasks.forEach(task => {
      if (!taskTypes[task.type]) {
        taskTypes[task.type] = { total: 0, completed: 0, failed: 0 };
      }
      taskTypes[task.type].total++;
      if (task.status === 'completed') taskTypes[task.type].completed++;
      if (task.status === 'failed') taskTypes[task.type].failed++;
    });

    // Estatísticas por dispositivo
    const devices = {};
    tasks.forEach(task => {
      if (task.deviceId) {
        const deviceName = task.deviceId.deviceName;
        if (!devices[deviceName]) {
          devices[deviceName] = { total: 0, completed: 0, failed: 0 };
        }
        devices[deviceName].total++;
        if (task.status === 'completed') devices[deviceName].completed++;
        if (task.status === 'failed') devices[deviceName].failed++;
      }
    });

    // Atividade por dia
    const dailyActivity = {};
    tasks.forEach(task => {
      const date = moment(task.createdAt).format('YYYY-MM-DD');
      if (!dailyActivity[date]) {
        dailyActivity[date] = { total: 0, completed: 0, failed: 0 };
      }
      dailyActivity[date].total++;
      if (task.status === 'completed') dailyActivity[date].completed++;
      if (task.status === 'failed') dailyActivity[date].failed++;
    });

    // Erros mais comuns
    const errors = {};
    tasks.filter(t => t.error).forEach(task => {
      errors[task.error] = (errors[task.error] || 0) + 1;
    });

    // Histórico de tentativas
    const retryHistory = tasks
      .filter(t => t.retryHistory && t.retryHistory.length > 0)
      .map(t => ({
        taskId: t._id,
        type: t.type,
        retryCount: t.retryHistory.length,
        lastRetry: t.retryHistory[t.retryHistory.length - 1]?.timestamp,
        errors: t.retryHistory.map(r => r.error)
      }));

    // Progresso no programa de 21 dias (simulado)
    const currentDay = Math.min(21, Math.ceil(totalTasks / 10)); // Simulação baseada no número de tarefas
    const programProgress = {
      currentDay,
      totalDays: 21,
      progress: ((currentDay / 21) * 100).toFixed(1),
      nextTasks: WARMUP_PROGRAM[currentDay + 1] ? WARMUP_PROGRAM[currentDay + 1].tasks.slice(0, 5) : []
    };

    const report = {
      phone,
      period,
      summary: {
        totalTasks,
        completedTasks,
        failedTasks,
        pendingTasks,
        runningTasks,
        successRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
        averageTasksPerDay: (totalTasks / moment.duration(moment().diff(startDate)).asDays()).toFixed(1)
      },
      taskTypes,
      devices,
      dailyActivity: Object.entries(dailyActivity).map(([date, stats]) => ({
        date,
        ...stats,
        successRate: stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0
      })),
      errors: Object.entries(errors)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      retryHistory,
      programProgress,
      recentTasks: tasks.slice(0, 10).map(t => ({
        id: t._id,
        type: t.type,
        status: t.status,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
        error: t.error,
        device: t.deviceId ? t.deviceId.deviceName : 'N/A'
      }))
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar relatório do número'
    });
  }
});

module.exports = router; 