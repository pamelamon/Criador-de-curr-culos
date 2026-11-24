# Criador de currículos

Um template para diferentes colaboradores preencherem seus próprios dados, escolherem o visual e gerarem o currículo. Funciona no navegador, sem instalar dependências ou criar conta. A página começa sem dados pessoais predefinidos.

## Abrir e preencher

1. Abra `index.html` no navegador.
2. Em **Dados pessoais**, informe nome, data de nascimento, cargo ou área, e-mail, WhatsApp com DDD, cidade e resumo profissional. A **idade** é calculada automaticamente pela data de nascimento. Data e idade são opcionais e entram na prévia, no arquivo e no PDF quando preenchidas.
3. Use a seta de upload para escolher uma foto opcional. Depois do envio, os botões **Alterar foto** e **Remover foto** aparecem abaixo da foto. São aceitos JPG, PNG e WebP de até 2 MB.
4. Nas outras abas, adicione experiências, formações, cursos, habilidades e idiomas. Cada grupo permite incluir e remover itens.
5. Em **Modelo e cores**, escolha o modelo e a cor. Os mesmos dados são usados em todos os visuais.

As alterações são salvas automaticamente neste navegador, inclusive foto, modelo e cor. O nome completo é obrigatório para visualizar em tamanho ampliado, baixar ou exportar. Os demais dados são opcionais. Informações não preenchidas não entram no arquivo final.

## Modelos e cores

- **Clássico:** retrato circular, coluna lateral colorida e nome à direita, inspirado no modelo escolhido.
- **Essencial:** composição clara, divisórias discretas e nome em fonte serifada.
- **Horizonte:** apresentação e competências em uma coluna lateral contínua.
- **Contemporâneo:** cartões e formas suaves.

Há seis cores sugeridas e um seletor de cor personalizada. Mudar o visual não apaga o preenchimento.

## Visualizar, baixar e exportar

- **Visualizar** abre uma visualização ampliada do currículo atual, ajustado para uma única folha A4. A prévia usa as mesmas medidas e a mesma tipografia da impressão.
- **Baixar currículo** gera um único arquivo HTML com os textos, a foto, o modelo e as cores atuais, já ajustado para uma folha A4. O arquivo funciona sozinho, sem depender da pasta do projeto, e não inclui o formulário de edição.
- **Exportar PDF** ajusta todo o conteúdo para uma única página, sem remover informações, e abre a impressão do navegador. Escolha **Salvar como PDF**, papel **A4**, orientação **retrato**, escala **100%**, margens **Padrão** e ative **Gráficos de fundo** para preservar as cores. Quanto mais conteúdo, menor será o tamanho dos textos na folha. Os modelos removem as margens automáticas da folha para evitar a data, a hora, o endereço e a paginação do navegador. Se você alterar manualmente as margens de impressão, mantenha **Cabeçalhos e rodapés** desativado.

O PDF é gerado a partir dos dados atuais a cada exportação. Um PDF que já tenha sido salvo no computador permanece como estava; para compartilhar novas alterações, exporte novamente. Não há envio automático a um serviço externo ou impressão automática em papel.

## Mais de um currículo

Use **Novo currículo** para começar outro preenchimento. O currículo anterior continua salvo e pode ser aberto pelo seletor no topo da página. Isso permite usar o mesmo criador para diferentes colaboradores no mesmo navegador.

Os dados ficam no armazenamento deste navegador e deste endereço de arquivo. Trocar de computador, de navegador, mover a pasta ou limpar os dados do navegador pode impedir a recuperação. Guarde os arquivos baixados. Se o armazenamento não estiver disponível ou ficar cheio, a página avisa; você ainda pode baixar e exportar os dados que estão na tela.

O projeto não cria contas nem separa usuários por senha. Pessoas que usam o mesmo perfil de navegador conseguem acessar os currículos guardados nele. Em navegadores ou computadores diferentes, cada preenchimento é independente. Para compartilhar um currículo pronto, envie apenas o HTML baixado ou o PDF.

Se houver um currículo salvo pelo editor anterior no mesmo navegador e no mesmo endereço do `index.html`, o criador tenta recuperar seus textos e sua foto automaticamente. O armazenamento anterior é preservado.

## Arquivos

```text
index.html                       → formulário e interface do criador
assets/css/criador.css            → aparência da interface
assets/js/criador.js              → preenchimento, salvamento, prévia e exportação
assets/js/modelos.js              → dados e geração dos quatro modelos
assets/js/estilos-exportacao.js   → estilos completos para prévias e arquivos
assets/css/style.css             → modelo Clássico
propostas/base.css               → base dos outros modelos
propostas/*/style.css            → estilos Essencial, Horizonte e Contemporâneo
scripts/preparar-exportacao.mjs  → atualização dos estilos para exportação
```

As páginas antigas em `propostas/` e o editor anterior permanecem como referências locais. O fluxo atual de criação e escolha dos quatro modelos está em `index.html`. Não é necessário editar o código para preencher um currículo.

Ao alterar os estilos dos modelos, execute `node scripts/preparar-exportacao.mjs` para atualizar os estilos usados nas prévias e nos arquivos baixados. Para o uso normal do criador, não é necessário executar comandos.

O `.env` não é lido pelo criador e não altera os campos do currículo. Ele deve continuar fora de qualquer compartilhamento ou publicação. Nunca compartilhe a pasta inteira sem revisão: os arquivos antigos podem conter preenchimentos anteriores.
