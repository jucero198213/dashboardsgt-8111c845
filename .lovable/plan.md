
# DETALHAMENTO - FEVEREIRO: Dashboard Financeiro Premium

## Visão Geral
Dashboard financeiro executivo com tema dark SaaS premium, projetado para apresentações de diretoria. Três telas: dashboard principal, detalhamento de contas a receber e detalhamento de contas a pagar.

## Design System
- Tema dark com fundo principal `#0B0E14`, cards em `#12161F` e `#161B26`
- Accent verde-esmeralda para receitas, âmbar/laranja para despesas, azul para saldos
- Tipografia com pesos variados para hierarquia clara
- Cards com bordas sutis, sombras suaves, cantos arredondados (12px)
- Microinterações: hover com brilho sutil, transições de 200ms, cards clicáveis com glow

## Estrutura de Páginas

### 1. Dashboard Principal (`/`)
- **Header**: Título "DETALHAMENTO - FEVEREIRO", subtítulo descritivo, placeholders visuais para filtros futuros (mês, ano, empresa)
- **Seção Contas a Receber**: 3 cards (Valor a Receber, Valor Recebido, Saldo a Receber — clicável → `/contas-a-receber`)
- **Seção Contas a Pagar**: 3 cards (Valor a Pagar, Valor Pago, Saldo a Pagar — clicável → `/contas-a-pagar`)
- **Seção Indicadores**: 7 cards com barras de progresso circulares mostrando % do gasto total (ex: Folha de Pagamento, Impostos, Fornecedores, Logística, Marketing, Infraestrutura, Outros). Layout 4+3 em desktop, responsivo em mobile.

### 2. Detalhamento Contas a Receber (`/contas-a-receber`)
- Breadcrumb + botão voltar
- Tabela elegante com colunas: Documento, Cliente, Vencimento, Valor, Status
- Dados mockados (8-10 registros), paginação visual preparada, estado vazio estilizado

### 3. Detalhamento Contas a Pagar (`/contas-a-pagar`)
- Mesma estrutura da tela acima, adaptada para fornecedores/despesas

## Componentes Reutilizáveis
- `FinancialCard` — card de valor monetário com variantes (receita/despesa/saldo/clicável)
- `IndicatorCard` — card de indicador com anel de progresso e percentual
- `SectionHeader` — título de seção com ícone
- `DataTable` — tabela executiva com status badges
- `DashboardHeader` — header com título e área de filtros
- `PageLayout` — layout base dark com navegação

## Dados Mockados
- Estrutura separada em `src/data/mockData.ts` com tipos TypeScript bem definidos
- Preparado para substituição futura por dados de planilhas de contas a pagar e a receber
- Interfaces claras: `ContaReceber`, `ContaPagar`, `Indicador`, `ResumoFinanceiro`

## Responsividade
- Desktop: layout em grid com cards lado a lado, indicadores 4+3
- Tablet/Notebook: adaptação fluida mantendo legibilidade
- Mobile: cards empilhados verticalmente
