<h1 align="center">
  💰 CashFlow
</h1>

<p align="center">
  <strong>Sistema Inteligente de Controle Financeiro Pessoal</strong>
  <br />
  Gerencie sua renda, economias, metas e despesas recorrentes com uma interface moderna e análises profissionais.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Zustand-5-433E38?logo=react&logoColor=white" alt="Zustand 5" />
  <img src="https://img.shields.io/badge/Recharts-3-22B5BF?logo=chartdotjs&logoColor=white" alt="Recharts 3" />
</p>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Execução](#-instalação-e-execução)
- [Modo de Uso](#-modo-de-uso)
- [Capturas de Tela](#-capturas-de-tela)
- [Roadmap](#-roadmap)
- [Licença](#-licença)

---

## 💡 Sobre o Projeto

**CashFlow** é uma aplicação web moderna de finanças pessoais desenvolvida para ajudar pessoas que dividem moradia (repúblicas, amigos, colegas) a organizar suas finanças de forma simples e eficiente.

Diferente de apps financeiros tradicionais que focam em categorizar **gastos** (alimentação, transporte, lazer), o CashFlow foi pensado para o **jovem adulto que ainda mora com colegas** e precisa responder a 4 perguntas essenciais:

1. **Quanto eu recebi?** → Salário líquido mensal
2. **Quanto vou ajudar em casa?** → Contribuição combinada com os colegas
3. **Quanto vou guardar?** → Poupança e investimentos
4. **Quanto vou reservar para imprevistos?** → Reserva de emergência

O sistema oferece **dashboard interativo**, **relatórios profissionais**, **gestão de metas financeiras** e **controle de despesas recorrentes** — tudo em uma interface escura elegante com visualização gráfica de dados.

---

## ✨ Funcionalidades

### 📊 Dashboard Financeiro
- **4 cards principais**: Total Recebido, Ajuda em Casa, Guardar, Imprevistos
- **Indicadores de saúde financeira**: % da renda comprometida, taxa de economia, proporção ajuda/renda
- **Gráfico de pizza**: Distribuição visual da sua renda mensal
- **Gráfico de projeção**: Economia acumulada em 6, 12 e 24 meses
- **Gráfico de barras**: Composição mensal detalhada
- **Projeção de metas**: Reserva de emergência e fundo de investimento baseados nos seus valores reais
- **Card de saldo disponível**: Valor livre após todas as destinações

### 📈 Relatórios Profissionais
- **Relatório de Renda**: Tabela completa com indicadores visuais (✅ Adequado, ⚠️ Alto, 🔴 Crítico) para cada categoria
- **Relatório de Economia**: Gauge interativo (medidor circular) da taxa de economia, projeções e linha do tempo do patrimônio
- **Relatório de Distribuição**: Gráfico de pizza com legendas, barras de progresso individuais e cards de insight
- **Histórico Mensal**: Gráfico de linhas interativo, tabela comparativa mês a mês, estatísticas (média guardada, melhor mês, total acumulado)
- **Exportação de dados** em JSON e **impressão** do relatório
- **Resumo Executivo** no rodapé com status financeiro

### 🎯 Metas Financeiras
- **Dashboard de estatísticas**: Total de metas, acumulado, falta acumular, necessário por mês
- **6 metas sugeridas inteligentes** baseadas no seu salário (Reserva de Emergência, Fundo de Investimento, Viagem, Curso, Casa Própria, Novo Celular)
- **Formulário completo**: Nome, valor alvo, já guardado, data limite, prioridade (4 níveis) e categoria (curto/médio/longo prazo)
- **Filtros**: Todas / Ativas / Concluídas / Emergência
- **Ordenação**: Por prazo, prioridade, progresso ou nome
- **Botões de progresso rápido**: +R$100, +R$500, +R$1000
- **Editor inline** do valor exato do progresso
- **Indicadores visuais**: Metas atrasadas (destaque vermelho), próximas do vencimento, concluídas 🎉
- **Card de economia mensal**: Quanto precisa guardar por mês para atingir a meta + comparação com sua economia atual

### ⚡ Automação de Despesas
- **Dashboard de estatísticas**: Total de despesas, total/mês, % da renda, já pago, pendente
- **Barra de progresso**: % de despesas pagas no mês com gradiente
- **Calendário de vencimentos**: Grid visual de 31 dias com indicadores de pagas/pendentes por dia
- **Formulário completo**: Nome, valor, dia vencimento, categoria (8 opções), despesa essencial
- **Botões de valor rápido**: +R$50, +R$100, +R$200, +R$500
- **Filtros**: Todas / Pagas / Pendentes
- **Busca textual** e **ordenação** por vencimento/valor/nome
- **Editor inline** e **exclusão com confirmação**
- **Indicadores visuais**: "ATRASADA" (vermelho), "PRÓXIMO" (âmbar), "Pago" (verde)
- **Importação CSV**: Formato `Nome,Valor,Dia` + **template copiável**
- **Pagar Todas em lote**
- **Análise Inteligente** com sugestões personalizadas e IA financeira offline

### 🤖 IA Financeira Offline
- Motor de IA 100% no navegador (sem servidor)
- **Regressão linear** para previsão de gastos futuros
- **Detecção de anomalias** (desvio padrão) para alertar gastos fora do comum
- **Análise de tendências** por categoria
- **Sugestões inteligentes** baseadas na sua distribuição de renda

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Versão | Finalidade |
|-----------|--------|------------|
| **React** | 19 | Biblioteca de interface |
| **TypeScript** | 6 | Tipagem estática e segurança |
| **Vite** | 8 | Bundler e dev server |
| **Tailwind CSS** | 4 | Estilização utilitária |
| **Zustand** | 5 | Gerenciamento de estado |
| **Recharts** | 3 | Gráficos e visualizações |
| **Lucide React** | 1 | Ícones |

### Arquitetura
- **Componentes funcionais** com hooks modernos
- **Zustand com persistência** (localStorage) para dados do usuário
- **Cálculos em tempo real** via `useMemo` para performance
- **Design responsivo** (mobile-first) com grid adaptativo
- **Tema escuro** (dark mode) nativo
- **100% offline** — nenhuma requisição externa

---

## 📁 Estrutura do Projeto

```
fincontrol/
├── public/                     # Arquivos estáticos
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                 # Assets estáticos
│   ├── components/             # Componentes React
│   │   ├── AdvancedGoals.tsx    # 🎯 Gestão de metas financeiras
│   │   ├── AIInsightsPanel.tsx  # 🤖 Painel de IA
│   │   ├── CategoryBudgets.tsx  # 📋 Orçamento por categoria
│   │   ├── Dashboard.tsx       # 📊 Dashboard principal
│   │   ├── FinancialForm.tsx   # 📝 Formulário financeiro
│   │   ├── FinancialHeatmap.tsx# 🗺️ Calendário financeiro
│   │   ├── HistoryChart.tsx    # 📈 Gráfico histórico
│   │   ├── Layout.tsx          # 🧭 Layout com navegação
│   │   ├── RecurringAndImport.tsx # ⚡ Automação de despesas
│   │   ├── ReportsPage.tsx     # 📊 Relatórios profissionais
│   │   ├── SnapshotButton.tsx  # 💾 Salvar mês
│   │   ├── SuggestionsPanel.tsx# 💡 Sugestões inteligentes
│   │   └── TopExpensesList.tsx # 🏆 Top despesas
│   ├── hooks/
│   │   └── useBudgetLogic.ts   # 🧮 Lógica de negócio
│   ├── lib/
│   │   ├── aiEngine.ts         # 🤖 Motor de IA offline
│   │   ├── supabase.ts         # 🔌 Conexão Supabase
│   │   └── utils.ts            # 🔧 Utilitários
│   ├── pages/
│   │   └── Home.tsx            # 🏠 Página principal
│   ├── store/
│   │   └── budgetStore.ts      # 🗄️ Estado global (Zustand)
│   ├── types/
│   │   ├── index.ts            # 📐 Definições de tipos
│   │   └── page.ts             # 📐 Tipos de página
│   ├── App.tsx                 # ⚛️ Componente raiz
│   ├── App.css                 # 🎨 Estilos globais
│   ├── index.css               # 🎨 Estilos base
│   └── main.tsx                # 🚀 Entry point
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** 9+ ou **yarn** 1.22+

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/fincontrol.git
cd fincontrol

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse no navegador
# Abra http://localhost:5173
```

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila o projeto para produção |
| `npm run preview` | Visualiza o build de produção |
| `npm run lint` | Executa linter no código |

### Build de Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/` e podem ser servidos por qualquer servidor estático (NGINX, Apache, Vercel, Netlify, etc.).

---

## 💻 Modo de Uso

### 1️⃣ Dashboard Principal
1. Preencha seu **salário líquido** no formulário
2. Defina os valores para **Ajudar em Casa**, **Guardar** e **Imprevistos**
3. Veja instantaneamente os cards, gráficos e indicadores atualizados
4. Use o **botão "Salvar Mês"** para registrar o snapshot mensal no histórico

### 2️⃣ Relatórios
1. Navegue até a aba **Relatórios** no menu lateral
2. Escolha entre: Renda, Economia, Distribuição ou Histórico
3. Use os botões **Exportar Dados** (JSON) ou **Imprimir** para compartilhar
4. Veja o **Resumo Executivo** com status financeiro

### 3️⃣ Metas Financeiras
1. Navegue até **Metas** no menu lateral
2. Clique em **Sugestões** para metas automáticas baseadas no seu salário
3. Ou clique em **Nova Meta** para criar manualmente
4. Acompanhe o progresso com slider, botões rápidos ou editor inline
5. Use os filtros e ordenação para organizar suas metas

### 4️⃣ Automação de Despesas
1. Navegue até **Automação** no menu lateral
2. Adicione despesas recorrentes manualmente ou importe CSV
3. Marque como pagas clicando no checkbox
4. Use **Pagar Todas** para aplicar pagamento em lote
5. Acompanhe o calendário de vencimentos mensal

---

## 🖥️ Capturas de Tela

> *(Adicione aqui screenshots do projeto)*

| Tela | Descrição |
|------|-----------|
| Dashboard | Visão geral com cards, gráficos e indicadores |
| Relatórios | 4 tipos de relatórios com gráficos e tabelas |
| Metas | Gestão completa com sugestões inteligentes |
| Automação | Controle de despesas recorrentes com calendário |

---

## 🗺️ Roadmap

- [x] Dashboard financeiro com 4 métricas principais
- [x] Relatórios profissionais com exportação
- [x] Metas financeiras com sugestões inteligentes
- [x] Automação de despesas recorrentes
- [x] IA financeira offline com previsões
- [ ] Autenticação e multiusuário
- [ ] Sincronização com nuvem (Supabase)
- [ ] Compartilhamento de despesas entre colegas
- [ ] Notificações e lembretes de vencimento
- [ ] Integração bancária via Open Finance
- [ ] Aplicativo mobile (React Native)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com ❤️ para ajudar pessoas a organizarem suas finanças e conquistarem seus objetivos
  <br />
  <strong>CashFlow</strong> — Controle suas finanças, controle sua vida.
</p>