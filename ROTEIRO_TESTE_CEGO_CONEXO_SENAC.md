# 🧪 Guia Oficial de Teste Cego de Usuário (UX & Fluxo Operacional) — Co.Nexo SENAC

Bem-vindo(a) ao **Teste Cego de Usabilidade** da plataforma **Co.Nexo SENAC (Fecomércio BA)**.
Este documento reúne o contexto do projeto, o objetivo da avaliação, as **credenciais de acesso de todos os perfis** e as **missões práticas** que você deve realizar sem ajuda externa para avaliarmos se o sistema é intuitivo por conta própria.

---

## 🎯 1. O que é o Teste Cego e qual é o seu Objetivo?

O **Teste Cego de Usuário** consiste em entregar o sistema para avaliadores testarem um fluxo real de ponta a ponta **sem que os desenvolvedores precisem explicar onde clicar**.

### Objetivos desta avaliação:
1. **Validar a Intuitividade Visual (UX/UI):** Verificar se qualquer colaborador do SENAC ou empreendedor consegue entender qual é o próximo passo apenas olhando para a tela.
2. **Validar o Fluxo Operacional Real (3 Etapas):**
   - **Captação (RD Station):** O empreendedor se cadastra na Landing Page ➔ os dados caem no **RD Station** ➔ o Atendimento (**Max**) importa a planilha CSV do RD Station para o Co.Nexo.
   - **1º Encontro e Diagnóstico Inicial (Com Max):** O **Max** entra em contato pelo WhatsApp, convida o Lead para o 1º encontro, aplica o diagnóstico inicial e **aprova o empreendedor para a Mentoria**, agendando o horário com a professora.
   - **Mentoria de 5 Encontros e Formalização MEI (Com Aline):** A professora/consultora (**Aline**) conduz os 5 encontros da trilha, registra presença/falta, passa tarefas práticas (que aparecem no celular do aluno) e registra a abertura do **CNPJ MEI**.
   - **Visão Executiva e Auditoria (Com Regis):** A coordenação (**Regis**) acompanha em tempo real os gráficos do funil, a taxa de formalização MEI, a assiduidade e exporta relatórios gerenciais.
3. **Validar o Isolamento de Perfis (RBAC):** Garantir que cada profissional veja apenas as ferramentas da sua função (Max = Atendimento/Agendamento, Aline = Mentoria/Diário, Regis = Coordenação/Indicadores).

---

## 🔐 2. Links e Credenciais de Acesso

- **URL Local:** `http://localhost:3000/login.html` *(ou o link público da Vercel enviado pela equipe)*

| Perfil no Sistema | Papel Operacional | E-mail de Login | Senha |
| :--- | :--- | :--- | :--- |
| 👨‍💼 **Max (Atendimento)** | Captação RD Station, 1º Encontro (Diagnóstico) e Agendamento com Professores | `max.atendimento@senac.br` | `senha123456` |
| 👩‍🏫 **Aline (Professora)** | Condução da Mentoria (5 Encontros), Presença/Falta, Diário e Formalização MEI | `aline.consultoria@senac.br` | `senha123456` |
| 📊 **Regis (Coordenação)** | Painel Executivo, Indicadores de BI, Desbloqueio de Faltas e Auditoria | `regis.coordenacao@senac.br` | `senha123456` |
| 📱 **Empreendedor (Cliente)** | Portal Mobile do Aluno (Confirmar presença em 1 toque, reagendar e marcar tarefas) | *Sem senha — acessa pelo Link Único gerado pelo Max ou pela Aline* | — |

---

## 🚀 3. Roteiro de Missões para o Avaliador (Passo a Passo)

Para realizar o teste completo, siga os **4 Atos** abaixo na ordem cronológica real do programa:

---

### ATO 1 — Você é o **MAX (Atendimento & Triagem RD Station)**
**Faça login com:** `max.atendimento@senac.br` | **Senha:** `senha123456`

1. **Missão 1.1 — Importar os Leads do RD Station (.CSV):**
   - Localize o botão **"Importar CSV do RD Station"**.
   - Dentro da janela que abrir, baixe a **Planilha Exemplo do RD Station (.csv)** clicando no botão de download e, em seguida, faça o upload desse mesmo arquivo.
   - Confira a pré-visualização dos leads encontrados e confirme a importação para o **Passo 1 do Funil**.
2. **Missão 1.2 — Cadastrar um Lead Manualmente (Teste de Todos os Campos):**
   - Clique em **"+ Cadastrar Lead Manual"**.
   - Cadastre um empreendedor testando tanto a opção **Informal (Sem CNPJ)** quanto a opção **MEI Formalizado (Com CNPJ de 14 dígitos)**.
3. **Missão 1.3 — Convidar o Lead para o 1º Encontro (Passo 1 ➔ Passo 2):**
   - Na lista do **Passo 1 (Leads RD Station)**, escolha um empreendedor e clique em **"1. Convidar no WhatsApp"**.
   - Observe que o sistema gera a mensagem de convite no WhatsApp e move o empreendedor automaticamente para o **Passo 2 (1º Encontro & Diagnóstico)**.
4. **Missão 1.4 — Realizar o Diagnóstico Inicial e Aprovar para Mentoria (Passo 2 ➔ Passo 3):**
   - Acesse o card **"Passo 2 • 1º Encontro & Diagnóstico"**.
   - Clique em **"2. Aprovar Diagnóstico ➔ Mentoria"**, avalie os 4 eixos iniciais (Finanças, Marketing, Processos e Gestão/MEI), escreva um resumo da dor principal do cliente e aprove.
5. **Missão 1.5 — Organizar e Agendar a Mentoria com a Professora Aline (Passo 3):**
   - No **"Passo 3 • Organizar Mentoria (Prof.)"**, clique em **"3. Agendar c/ Professor"**.
   - Verifique que apenas a professora **Aline (Consultoria)** aparece na seleção de consultores.
   - Escolha um horário (ou defina data e hora na hora) e confirme o agendamento.
   - **Importante:** Copie ou abra o **Link do Portal do Aluno (`agendar.html?token=...`)** gerado ao final (ou clique no ícone de compartilhar ao lado do aluno) para usar no Ato 2!
6. **Missão 1.6 — Explorar a Grade dos Professores (`2. Grade dos Professores` no menu lateral):**
   - Abra um **Turno de 4h** ou um **Horário Avulso** para a Professora Aline e veja a aba de **Agendamentos & Presença**.

---

### ATO 2 — Você é o **EMPREENDEDOR / MENTORANDO (Portal Mobile)**
**Acesse pelo link único copiado no passo anterior** (`agendar.html?token=...`)

1. **Missão 2.1 — Confirmar Presença em 1 Toque (Pré-Checkin):**
   - Veja o card com a data e horário da sua próxima mentoria com a Professora Aline e clique em **"Confirmar Minha Presença"**.
2. **Missão 2.2 — Marcar Tarefas de Casa como Concluídas:**
   - Role até a seção de **Checklist / Tarefas da Mentoria** e marque uma tarefa como concluída pelo celular.
3. **Missão 2.3 — Testar Reagendamento / Cancelamento (Opcional):**
   - Verifique a opção de reagendar/cancelar respeitando a regra institucional de antecedência (24h).

---

### ATO 3 — Você é a **ALINE (Professora / Consultora de Mentoria)**
**Faça login com:** `aline.consultoria@senac.br` | **Senha:** `senha123456`

1. **Missão 3.1 — Acessar seus Mentorados:**
   - Observe os indicadores do topo (Sessões Agendadas, Em Mentoria e MEIs Formalizados) e clique em **"Abrir Diário & Mentoria ➔"** no empreendedor aprovado pelo Max.
2. **Missão 3.2 — Atribuir Presença (`✓ Presente`) ou Falta (`✕ Falta`) e Avançar nos 5 Encontros:**
   - Veja que a tela já abre automaticamente no **próximo encontro pendente** (ex: Encontro 2, já que o Encontro 1 foi feito no diagnóstico).
   - No painel superior dos **5 Encontros (1 a 5)**, teste atribuir **`✓ Presente`** ou **`✕ Falta`** em qualquer encontro.
   - No encontro ativo, clique em **"Preencher Roteiro Padrão SENAC"**, adicione uma tarefa prática para o aluno, anexe um material do **Kit Rápido SENAC** e clique no botão verde **"Confirmar Presença e Avançar p/ Próximo Encontro ➔"**.
3. **Missão 3.3 — Atualizar o Termômetro de Maturidade (4 Eixos):**
   - Role até o gráfico Radar (**Evolução de Maturidade do Negócio**), aumente as notas dos 4 eixos e clique em **"Salvar Notas de Maturidade"**.
4. **Missão 3.4 — Formalizar o MEI (CNPJ) e Emitir Certificado SENAC:**
   - Clique no botão laranja **"Formalizar MEI (CNPJ)"** no topo, mude para **MEI Formalizado (CNPJ Ativo)**, informe um CNPJ de 14 dígitos (ex: `12.345.678/0001-99`) e salve.
   - Marque os 5 encontros como **`✓ Presente`** e clique no botão roxo **"Emitir Certificado SENAC"** que será liberado no topo!

---

### ATO 4 — Você é o **REGIS (Coordenação & Gestão Executiva)**
**Faça login com:** `regis.coordenacao@senac.br` | **Senha:** `senha123456`

1. **Missão 4.1 — Analisar os Indicadores e Gráficos Executivos:**
   - Verifique se os 4 KPIs do topo e os 3 gráficos (**Funil das 4 Etapas**, **Proporção MEI Formalizado vs. Informal** e **Radar de Maturidade Média**) refletiram tudo o que foi feito por Max e Aline.
2. **Missão 4.2 — Verificar Alertas de Retenção, Evasão e Trilha de Auditoria:**
   - Confira na coluna direita a **Trilha de Auditoria em Tempo Real** (com o registro de cada ação feita durante o teste), o **Radar de Evasão Silenciosa** e o painel de **Retenções por Assiduidade** (onde o coordenador pode clicar em *"Abonar & Desbloquear"* caso um aluno tenha levado 2 faltas).
3. **Missão 4.3 — Exportar Relatórios:**
   - Teste os botões **"Exportar CSV"** (planilha para Excel) e **"PDF"** no canto superior direito.

---

## 📝 4. Formulário Rápido de Feedback (Para o Avaliador Preencher)

Após concluir o teste, responda de 1 a 5 (sendo 1 = Muito Difícil e 5 = Muito Fácil/Intuitivo):

1. **Clareza do Fluxo do Max (Importar CSV RD Station ➔ Convidar ➔ Diagnóstico ➔ Agendar Mentoria):** `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]`
2. **Clareza do Diário da Professora Aline (Marcar Presença/Falta e avançar entre os 5 encontros):** `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]`
3. **Facilidade de uso do Portal Mobile do Empreendedor (Cliente):** `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]`
4. **Clareza do Painel Executivo da Coordenação (Regis):** `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]`
5. **Houve alguma tela ou botão onde você ficou em dúvida sobre o que fazer? Se sim, qual?**
   - *Resposta:* ___________________________________________________________________
