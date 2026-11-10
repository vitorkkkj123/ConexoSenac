# 🧪 Guia Oficial de Teste Cego de Usuário (UX & Fluxo Operacional) — Co.Nexo SENAC (Versão 3)

Bem-vindo(a) ao **Teste Cego de Usabilidade — Versão 3** da plataforma **Co.Nexo SENAC (Fecomércio BA)**.
Este documento reúne o contexto do projeto, as novidades da **Versão 3**, o objetivo da avaliação, as **credenciais de acesso de todos os perfis** e as **missões práticas** para testar o sistema de ponta a ponta sem auxílio externo.

---

## ✨ O que há de novo nesta Versão 3?
1. **Funil Operacional Guiado em 3 Passos (Perfil Max — Atendimento):**
   - **Passo 1 (Captação RD Station):** Importação em lote de planilhas `.CSV` exportadas do RD Station e cadastro manual com suporte a negócios Informais ou MEI Formalizado/Inadimplente (com validação de CNPJ de 14 dígitos).
   - **Passo 2 (1º Encontro & Diagnóstico Inicial):** Registro do diagnóstico inicial com avaliação dos 4 eixos de maturidade e aprovação em 1 clique para a Mentoria.
   - **Passo 3 (Organizar Mentoria com Professores):** Agendamento exclusivo na grade dos consultores/professores (**Aline**), com geração automática do Link Único do Portal do Aluno.
2. **Novo Diário de Mentoria & Controle de Frequência nos 5 Encontros (Perfil Aline — Professora):**
   - Painel visual dos **5 Encontros** no topo da ficha do mentorando com botões rápidos de **`✓ Presente`** e **`✕ Falta`** em todos os encontros.
   - Destravamento de rolagem e **avanço automático** para o próximo encontro pendente da trilha (*"Confirmar Presença e Avançar p/ Encontro X+1 ➔"*).
   - **Envio Instantâneo de Atividades para o Aluno:** Toda tarefa adicionada no Checklist ou material anexado do Kit Rápido SENAC é salvo e liberado instantaneamente no Portal Mobile do Aluno, com botão direto **"Enviar Tarefas no WhatsApp"**.
3. **Portal Mobile do Empreendedor Aprimorado (`agendar.html`):**
   - Card de destaque logo na tela inicial avisando quantas atividades foram enviadas pela consultora, abas **Agendar**, **Minha Trilha** e **Metas & PDFs**, confirmação de presença em 1 toque e checklist interativo sincronizado com a ficha da professora.
4. **Arquitetura Cloud Serverless (Vercel) Estabilizada:**
   - Sincronização automática de estado entre instâncias na Vercel e banco de dados limpo para início imediato dos testes.

---

## 🎯 1. O que é o Teste Cego e qual é o seu Objetivo?

O **Teste Cego de Usuário** consiste em entregar o sistema para os professores e avaliadores do **Co.Nexo SENAC** testarem um fluxo real completo **sem que a equipe de desenvolvimento precise explicar onde clicar**.

### Objetivos desta avaliação:
1. **Validar a Intuitividade Visual (UX/UI):** Verificar se qualquer colaborador do SENAC ou empreendedor compreende o próximo passo apenas pela interface.
2. **Validar o Fluxo Operacional Real de Ponta a Ponta:**
   - **Landing Page ➔ RD Station ➔ Max (Importação CSV) ➔ Max (Convite + 1º Encontro/Diagnóstico) ➔ Max (Agendamento com Professora) ➔ Aline (Mentoria 5 Encontros + Tarefas + Formalização MEI) ➔ Aluno (Portal Mobile) ➔ Regis (Indicadores e Auditoria).**
3. **Validar o Isolamento de Perfis (RBAC):** Garantir que cada perfil visualize apenas suas atribuições reais.

---

## 🔐 2. Links e Credenciais de Acesso

- **Link Público (Vercel):** `https://conexo-senac.vercel.app/login.html` *(ou o link da Vercel compartilhado no e-mail)*
- **URL Local (Desenvolvimento):** `http://localhost:3000/login.html`

| Perfil no Sistema | Papel Operacional | E-mail de Login | Senha |
| :--- | :--- | :--- | :--- |
| 👨‍💼 **Max (Atendimento)** | Captação RD Station, 1º Encontro (Diagnóstico) e Agendamento com Professores | `max.atendimento@senac.br` | `senha123456` |
| 👩‍🏫 **Aline (Professora)** | Condução da Mentoria (5 Encontros), Presença/Falta, Envio de Tarefas e Formalização MEI | `aline.consultoria@senac.br` | `senha123456` |
| 📊 **Regis (Coordenação)** | Painel Executivo, Indicadores de BI, Desbloqueio de Faltas e Auditoria | `regis.coordenacao@senac.br` | `senha123456` |
| 📱 **Empreendedor (Cliente)** | Portal Mobile do Aluno (Confirmar presença em 1 toque, reagendar e marcar tarefas) | *Sem senha — acessa pelo Link Único gerado pelo Max ou pela Aline* | — |

*(Dica: Na tela de login também há botões de **Acesso Rápido em 1 Clique** para alternar entre Regis, Max e Aline durante a avaliação).*

---

## 🚀 3. Roteiro de Missões para o Avaliador (Passo a Passo)

Para realizar o teste completo, siga os **4 Atos** abaixo na ordem cronológica real do programa:

---

### ATO 1 — Você é o **MAX (Atendimento & Triagem RD Station)**
**Faça login com:** `max.atendimento@senac.br` | **Senha:** `senha123456`

1. **Missão 1.1 — Importar os Leads do RD Station (.CSV):**
   - Localize o botão **"Importar CSV do RD Station"**.
   - Na janela que abrir, clique para baixar a **Planilha Exemplo do RD Station (.csv)** e, em seguida, selecione esse arquivo para importação.
   - Confira a pré-visualização dos leads e confirme a importação para o **Passo 1 do Funil**.
2. **Missão 1.2 — Cadastrar um Lead Manualmente (Com ou Sem CNPJ):**
   - Clique em **"+ Cadastrar Lead Manual"**.
   - Cadastre um empreendedor testando a opção **Informal (Sem CNPJ)** ou **MEI Formalizado / Inadimplente (informando um CNPJ de 14 dígitos)**.
3. **Missão 1.3 — Convidar o Lead para o 1º Encontro (Passo 1 ➔ Passo 2):**
   - Na lista do **Passo 1 (Leads RD Station)**, escolha um empreendedor e clique em **"1. Convidar no WhatsApp"**.
   - Observe que o sistema gera o convite para WhatsApp e move o empreendedor para o **Passo 2 (1º Encontro & Diagnóstico)**.
4. **Missão 1.4 — Realizar o Diagnóstico Inicial e Aprovar para Mentoria (Passo 2 ➔ Passo 3):**
   - Acesse a aba **"Passo 2 • 1º Encontro & Diagnóstico"**.
   - Clique em **"2. Aprovar Diagnóstico ➔ Mentoria"**, avalie os 4 eixos iniciais (Finanças, Marketing, Processos e Gestão/MEI), descreva o diagnóstico inicial e clique em **"Aprovar Diagnóstico e Liberar Mentoria"**.
5. **Missão 1.5 — Organizar e Agendar a Mentoria com a Professora Aline (Passo 3):**
   - Na aba **"Passo 3 • Organizar Mentoria (Prof.)"**, clique em **"3. Agendar c/ Professor"**.
   - Verifique que apenas a professora **Aline (Consultoria)** é listada para mentoria.
   - Escolha ou crie um horário na hora e confirme o agendamento.
   - **Importante:** Copie o **Link do Portal do Aluno (`agendar.html?token=...`)** para testar a visão do empreendedor!
6. **Missão 1.6 — Explorar a Grade dos Professores (`2. Grade dos Professores` no menu lateral):**
   - Abra um **Turno de 4h** ou um **Horário Avulso** para a Professora Aline e confira a aba de **Agendamentos & Presença**.

---

### ATO 2 — Você é a **ALINE (Professora / Consultora de Mentoria)**
**Faça login com:** `aline.consultoria@senac.br` | **Senha:** `senha123456`

1. **Missão 2.1 — Acessar seus Mentorados:**
   - Observe os indicadores do topo (Sessões Agendadas, Em Mentoria e MEIs Formalizados) e clique em **"Abrir Diário & Mentoria ➔"** no empreendedor aprovado pelo Max.
2. **Missão 2.2 — Atribuir Presença (`✓ Presente`) ou Falta (`✕ Falta`) e Avançar nos 5 Encontros:**
   - Veja que a tela já abre automaticamente no **próximo encontro pendente** (Encontro 2, pois o Encontro 1 foi concluído no diagnóstico inicial).
   - No painel superior dos **5 Encontros (1 a 5)**, teste atribuir **`✓ Presente`** ou **`✕ Falta`** em qualquer encontro.
3. **Missão 2.3 — Enviar Atividades Práticas e Materiais para o Aluno:**
   - No encontro ativo, clique em **"Preencher Roteiro Padrão SENAC"** ou digite uma atividade personalizada no **Checklist de Tarefas do Aluno** e clique em **`+ Adicionar`** (o sistema salva e envia automaticamente para o Portal do Aluno).
   - Anexe uma planilha/guia clicando em um dos botões do **Kit Rápido SENAC**.
   - Clique em **"Confirmar Presença e Avançar p/ Próximo Encontro ➔"** e teste também o botão **"Enviar Tarefas no WhatsApp"** no topo da ficha.
4. **Missão 2.4 — Atualizar o Termômetro de Maturidade, Formalizar MEI e Emitir Certificado:**
   - Role até o gráfico Radar (**Evolução de Maturidade do Negócio**), ajuste as notas dos 4 eixos e salve.
   - Clique no botão laranja **"Formalizar MEI (CNPJ)"** no topo, selecione **MEI Formalizado (CNPJ Ativo)**, informe um CNPJ de 14 dígitos (ex: `12.345.678/0001-99`) e salve.
   - Quando os 5 encontros estiverem marcados como **`✓ Presente`**, clique no botão roxo **"Emitir Certificado SENAC"**.

---

### ATO 3 — Você é o **EMPREENDEDOR / MENTORANDO (Portal Mobile)**
**Acesse pelo Link Único do Aluno** (`agendar.html?token=...`)

1. **Missão 3.1 — Confirmar Presença em 1 Toque (Pré-Checkin):**
   - Na aba inicial (**Agendar**), veja o card com o seu próximo encontro agendado e clique em **"Confirmar Minha Presença em 1 Toque"**.
2. **Missão 3.2 — Visualizar e Concluir as Atividades Enviadas pela Professora Aline:**
   - Clique no card de destaque **"Atividades da Mentoria — Abrir Tarefas"** (ou na aba **"Metas & PDFs"**).
   - Marque o checkbox (`✓`) das atividades enviadas pela Professora Aline e baixe os materiais/PDFs anexados.
   - *(Se voltar na ficha da Professora Aline, verá que a tarefa marcada pelo aluno já aparece concluída para a professora!).*

---

### ATO 4 — Você é o **REGIS (Coordenação & Gestão Executiva)**
**Faça login com:** `regis.coordenacao@senac.br` | **Senha:** `senha123456`

1. **Missão 4.1 — Analisar os Indicadores e Gráficos Executivos:**
   - Confira os 4 KPIs do topo e os 3 gráficos (**Funil das 4 Etapas**, **Proporção MEI Formalizado vs. Informal** e **Radar de Maturidade Média: Marco Zero vs. Atual**).
2. **Missão 4.2 — Verificar Alertas de Retenção, Evasão e Trilha de Auditoria:**
   - Confira a **Trilha de Auditoria em Tempo Real**, o **Radar de Evasão Silenciosa** e o painel de **Retenções por Assiduidade** (com o botão *"Abonar & Desbloquear"*).
3. **Missão 4.3 — Exportar Relatórios:**
   - Teste os botões **"Exportar CSV"** (planilha para Excel) e **"PDF"** no canto superior direito.

---

## 📝 4. Formulário Rápido de Feedback (Para o Avaliador Preencher)

Após concluir o teste, avalie de 1 a 5 (sendo 1 = Muito Difícil e 5 = Muito Fácil/Intuitivo):

1. **Clareza do Funil do Max (Importar CSV RD Station ➔ Convidar ➔ Diagnóstico ➔ Agendar Mentoria):** `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]`
2. **Clareza do Diário da Professora Aline (Presença/Falta, Avanço nos 5 Encontros e Envio de Tarefas):** `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]`
3. **Facilidade de uso do Portal Mobile do Empreendedor (Confirmar Presença e Marcar Tarefas):** `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]`
4. **Clareza do Painel Executivo da Coordenação (Regis):** `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]`
5. **Houve alguma tela ou botão onde você ficou em dúvida sobre o que fazer? Se sim, qual?**
   - *Resposta:* ___________________________________________________________________

---
*Documento de Homologação e Teste Cego — **Co.Nexo SENAC • Versão 3***
