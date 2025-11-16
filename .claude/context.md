🧭 Project Context Doc — Sistema de Vacinação Corporativo
🎯 Resumo Executivo

O sistema é voltado para gestão de vacinas de funcionários em um ambiente corporativo (ex: hospitais, clínicas ou empresas com programas internos de vacinação).
O sistema deve permitir cadastro, agendamento, aplicação e acompanhamento de vacinas, com diferentes permissões conforme o papel do usuário.

👥 Perfis e Responsabilidades
👤 EMPLOYEE (Funcionário)

O funcionário utiliza o sistema apenas para gerenciar suas próprias vacinas.

Permissões e funcionalidades:

📅 Agendar vacinas para si mesmo.

📋 Visualizar seu próprio cartão de vacinação (histórico de vacinas aplicadas).

💉 Consultar vacinas disponíveis (com base nas campanhas ou vacinas oferecidas).

🔔 Receber notificações sobre doses pendentes, próximas ou atrasadas.

❌ Não pode aplicar vacinas nem visualizar dados de outros funcionários.

💉 NURSE (Enfermeiro)

O enfermeiro é responsável por aplicar vacinas em funcionários e gerenciar o fluxo de atendimento.

Permissões e funcionalidades:

💉 Registrar aplicação de vacinas (escolhendo lote, data, e vacina).

📊 Visualizar agenda de atendimentos (funcionários agendados para vacinação).

📦 Verificar lotes disponíveis e suas respectivas vacinas.

➕ Possui também todas as funcionalidades do EMPLOYEE (para gerenciar suas próprias vacinas pessoais).
Pode visualizar os cartões de vacinas dos outros usuários, porém não pode gerir nenhum funcionário, como deletar, alterar role ou informações.

🏥 MANAGER (Gestor)

O gestor tem visão administrativa e de configuração do sistema.

Permissões e funcionalidades:

🏥 Gerenciar catálogo de vacinas (cadastrar, editar e remover tipos de vacinas).

📦 Gerenciar lotes de vacinas (criação, validade, fabricante, status).

👥 Gerenciar funcionários (cadastro, edição, ativação/desativação).

📈 Gerar relatórios gerenciais (ex: vacinas aplicadas por período, cobertura vacinal, doses pendentes).

⚙️ Configurar parâmetros do sistema (ex: obrigatoriedade de vacinas, regras de alerta).

📢 Enviar comunicados e avisos gerais aos funcionários.

➕ Possui também todas as funcionalidades do EMPLOYEE (para suas próprias vacinas).

🧩 Entidades principais

Employee (Funcionário) → possui dados pessoais e histórico de vacinas.

Vaccine (Vacina) → tipo de vacina (ex: Hepatite B, Influenza).

VaccineBatch (Lote) → lote vinculado a uma vacina, com número, validade e fabricante.

VaccinationRecord (Registro) → ligação entre funcionário, vacina, lote e data da aplicação.

Appointment (Agendamento) → registro de agendamento de vacinação.

⚙️ Considerações gerais

Cada funcionário pode ter várias vacinas aplicadas e vários agendamentos.

Cada vacina pode ter vários lotes.

O sistema deve registrar quem aplicou a vacina e qual lote foi utilizado.

A autenticação e o controle de acesso serão baseados em papéis (roles).

As notificações são enviadas automaticamente conforme as regras de obrigatoriedade e datas de agendamento.

📘 Objetivo do Documento

Este documento serve como contexto compartilhado para todos os agentes de IA envolvidos no projeto.
Deve ser carregado antes de qualquer conversa técnica sobre modelagem, arquitetura, UX ou implementação.
O objetivo é garantir consistência nas respostas, entendimento de papéis e escopo do sistema.

---

## 🏗️ Arquitetura do Projeto

O projeto segue **Clean Architecture** com separação clara de responsabilidades em camadas.
Para detalhes completos sobre a arquitetura de módulos do backend, consulte [backend-modules.md](backend-modules.md).