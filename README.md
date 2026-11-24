# currículo.digital

**Crie, personalize e exporte currículos profissionais em poucos passos.**

O currículo.digital é uma ferramenta para criação de currículos diretamente pelo navegador. Permite preencher informações profissionais, adicionar experiências e qualificações, escolher entre diferentes modelos visuais e gerar um documento pronto para compartilhar.

A aplicação funciona localmente, sem necessidade de instalação de dependências, criação de conta ou envio de dados para serviços externos.

## Funcionalidades

- **Preenchimento de dados:** informações pessoais, perfil profissional, experiências, formação acadêmica, cursos, habilidades e idiomas.
- **Quatro modelos visuais:** Clássico, Essencial, Horizonte e Contemporâneo.
- **Personalização:** seis opções de cores e seletor de cor personalizada.
- **Foto de perfil:** envio, alteração e remoção de fotografia.
- **Pré-visualização em tempo real:** acompanhe as alterações enquanto preenche o currículo.
- **Salvamento automático:** os dados ficam armazenados no navegador.
- **Exportação:** gere um arquivo HTML independente ou salve o currículo em PDF.
- **Múltiplos currículos:** mantenha diferentes currículos no mesmo navegador.

## Como utilizar

### 1. Iniciar

Abra o arquivo `index.html` diretamente no navegador.

A página apresenta o editor de currículos, dividido em abas para facilitar o preenchimento.

### 2. Preencher as informações

Na aba **Dados pessoais**, informe:

- Nome completo;
- Data de nascimento;
- Cargo ou área de interesse;
- E-mail;
- WhatsApp;
- Cidade;
- Resumo profissional.

A idade é calculada automaticamente a partir da data de nascimento.

A fotografia é opcional e pode ser adicionada pelo botão de upload. São aceitos arquivos JPG, PNG e WebP de até 2 MB.

### 3. Adicionar informações profissionais

Utilize as demais abas para cadastrar:

- **Experiência:** empresas, cargos, períodos e atividades desenvolvidas.
- **Formação:** escolaridade e formação acadêmica.
- **Competências:** habilidades técnicas e idiomas.

É possível adicionar ou remover itens conforme a trajetória profissional de cada colaborador.

### 4. Escolher o modelo

Na aba **Modelo e cores**, selecione a apresentação visual desejada.

Os dados preenchidos são compartilhados entre os modelos. Assim, você pode experimentar diferentes estilos sem precisar preencher o currículo novamente.

## Modelos disponíveis

Cada modelo possui uma identidade visual própria, mantendo as mesmas informações profissionais.

| Modelo | Características |
|---|---|
| **Clássico** | Fotografia em destaque, coluna lateral colorida e apresentação tradicional. |
| **Essencial** | Layout leve, organização editorial e divisórias discretas. |
| **Horizonte** | Estrutura profissional com coluna lateral contínua. |
| **Contemporâneo** | Cartões, organização em blocos e elementos visuais suaves. |

Além dos modelos, estão disponíveis seis cores sugeridas e uma opção de personalização para escolher uma cor própria.

## Visualização e exportação

O editor disponibiliza três opções para utilizar o currículo finalizado:

### Visualizar
Abre uma versão ampliada do currículo atual, permitindo conferir a apresentação antes de gerar o documento.

### Baixar currículo
Gera um arquivo HTML independente contendo os dados, a fotografia e a identidade visual selecionada.

O arquivo não depende da estrutura original do projeto e não inclui o formulário de edição.

### Exportar PDF
Prepara o currículo para impressão em uma única página A4 e abre a janela de impressão do navegador.

Para preservar a aparência do documento, utilize as seguintes configurações:

- Papel: A4;
- Orientação: Retrato;
- Escala: 100%;
- Margens: Padrão;
- Gráficos de fundo: Ativado;
- Cabeçalhos e rodapés: Desativado.

O conteúdo é ajustado automaticamente para caber em uma página. Quanto maior a quantidade de informações, menor poderá ser o tamanho dos textos.

Cada exportação utiliza os dados preenchidos no momento. Alterações posteriores não modificam arquivos HTML ou PDFs que já tenham sido baixados.

## Gerenciamento de currículos

O botão **Novo currículo** permite iniciar um novo preenchimento sem perder os currículos anteriores.

Os documentos ficam disponíveis no seletor localizado no topo da página, permitindo alternar entre diferentes colaboradores.

O salvamento é realizado automaticamente no armazenamento local do navegador, incluindo:

- Informações pessoais e profissionais;
- Fotografia;
- Modelo selecionado;
- Cor personalizada.

**Importante:** os dados são armazenados no navegador e no endereço utilizado para abrir o projeto. Não existe sincronização entre computadores ou navegadores.

Pessoas que utilizam o mesmo perfil do navegador podem acessar os currículos armazenados nele. Por isso, evite utilizar o sistema em computadores compartilhados sem os devidos cuidados.

Recomenda-se manter cópias dos currículos exportados.

## Estrutura do projeto

```text
curriculo-digital/
│
├── index.html
│
├── assets/
│   ├── css/
│   │   ├── criador.css
│   │   └── style.css
│   │
│   └── js/
│       ├── criador.js
│       ├── modelos.js
│       └── estilos-exportacao.js
│
├── propostas/
│   ├── base.css
│   ├── classico/
│   ├── essencial/
│   ├── horizonte/
│   └── contemporaneo/
│
└── scripts/
    └── preparar-exportacao.mjs
```

### Principais arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura principal e interface do editor. |
| `assets/css/criador.css` | Estilização da interface de preenchimento. |
| `assets/js/criador.js` | Preenchimento, armazenamento, prévia e exportação. |
| `assets/js/modelos.js` | Dados e geração dos modelos de currículo. |
| `assets/js/estilos-exportacao.js` | Estilos utilizados nas prévias e nos arquivos exportados. |
| `assets/css/style.css` | Estilos do modelo Clássico. |
| `propostas/base.css` | Estilos compartilhados pelos demais modelos. |
| `propostas/*/style.css` | Estilos individuais dos modelos. |
| `scripts/preparar-exportacao.mjs` | Atualização dos estilos utilizados na exportação. |

## Manutenção

Quando houver alterações nos estilos dos modelos, execute:

```bash
node scripts/preparar-exportacao.mjs
```

Esse comando atualiza os estilos utilizados nas prévias e nos arquivos exportados.

Para utilizar o criador normalmente, não é necessário instalar dependências ou executar comandos adicionais.

As páginas antigas em `propostas/` e o editor anterior são mantidos como referências locais. O fluxo atual de criação e personalização está concentrado em `index.html`.

## Armazenamento e privacidade

O currículo.digital não exige cadastro, login ou conexão com um servidor para funcionar.

As informações preenchidas permanecem no armazenamento local do navegador. Não há envio automático dos dados para serviços externos.

Algumas situações podem impedir a recuperação dos currículos:

- Limpeza dos dados de navegação;
- Troca de navegador ou computador;
- Mudança do local ou endereço utilizado para abrir o projeto;
- Indisponibilidade ou falta de espaço no armazenamento local.

Caso exista um currículo salvo pelo editor anterior, no mesmo navegador e endereço do `index.html`, o sistema tenta recuperar automaticamente os textos e a fotografia. O armazenamento anterior é preservado.

O arquivo `.env` não é utilizado pelo criador e não interfere no preenchimento ou na exportação. Mantenha-o fora de qualquer compartilhamento ou publicação.

**Recomendação:** antes de compartilhar ou publicar o projeto, revise os arquivos antigos e remova eventuais informações pessoais que possam estar armazenadas neles.
