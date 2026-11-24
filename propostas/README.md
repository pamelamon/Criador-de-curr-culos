# Três propostas para seu currículo

O fluxo atual está em **`../index.html`**: o criador pede os dados pessoais, permite adicionar informações e oferece quatro modelos e cores no mesmo formulário. Use-o para preparar currículos de outros colaboradores. Estas pastas preservam os estilos e as páginas anteriores como referência local.

Abra **index.html desta pasta** no navegador para ver a galeria. Clique em “Conhecer proposta” para abrir cada versão. Nenhuma instalação é necessária.

| Proposta | Estilo | Arquivo |
| --- | --- | --- |
| 01 · Essencial | Editorial, claro, fonte serifada e divisórias discretas | `01-essencial/index.html` |
| 02 · Horizonte | Coluna lateral azul, apresentação corporativa e conteúdo organizado | `02-horizonte/index.html` |
| 03 · Lavanda | Tons violeta, cabeçalho geométrico e cartões com competências à direita | `03-lavanda/index.html` |

O currículo principal e as três propostas foram adaptados com o mesmo exemplo fictício de experiência como auxiliar de clínica veterinária. As páginas são cópias independentes: novas edições em uma não alteram automaticamente as outras. As iniciais correspondem ao nome atual.

## Personalize

Abra o `index.html` da proposta escolhida no navegador e clique em **Editar currículo**. Altere os textos diretamente na página e clique em **Salvar alterações**. Para descartar a edição atual, use **Cancelar**. Cada proposta guarda suas próprias alterações neste navegador, sem modificar o arquivo original.

O botão **Baixar cópia para compartilhar** gera um único HTML com o visual e os textos atuais, sem controles ou código de edição. O editor aparece apenas na cópia local e em prévias locais; não aparece em um endereço público. Guarde a pasta original para continuar editando. Para editar manualmente, procure por **PREENCHA** no HTML.

Os contatos existentes foram preservados. O número do WhatsApp agora é um link que abre uma conversa em nova aba, sem enviar mensagens automaticamente. Para trocar o número, atualize o texto visível e o endereço `https://wa.me/5533984640379`, usando código do país, DDD e número, apenas com dígitos. As propostas não foram publicadas na internet e não leem o `.env`. Nenhum dado do `.env` foi copiado.

Depois de substituir todos os exemplos e revisar os dados, você pode retirar a indicação “MODELO FICTÍCIO” e o aviso ao final. O guia principal em `../README.md` continua explicando HTML, CSS, privacidade e os desafios de aprendizado.

## Como os arquivos estão organizados

- Cada pasta de proposta tem um `index.html` e um `style.css` próprio.
- O `base.css` desta pasta contém as regras comuns, incluindo a impressão. Cada `style.css` o importa por um caminho local. Ele precisa ser mantido junto com a pasta das propostas.
- A galeria usa `index.html` e `galeria.css`. Suas miniaturas são desenhos ilustrativos feitos com HTML e CSS, sem imagens externas.
- Todos os arquivos funcionam localmente, com HTML, CSS e o editor em JavaScript compartilhado da pasta `../assets/`. Não há fontes externas ou dependências a instalar.

## Celular e impressão

Reduza a janela ou use a visualização de dispositivos do navegador para testar larguras como 375, 768 e 1280 pixels. Em telas pequenas, as versões passam para uma coluna.

Para visualizar uma proposta em PDF, abra a página dela e clique em **Visualizar em PDF**. A prévia de impressão do navegador usa os textos atuais e os estilos de impressão da versão escolhida. Escolha **Salvar como PDF**, papel **A4**, orientação **retrato**, e desative cabeçalhos e rodapés do navegador. Você também pode usar **Ctrl + P**. O número de páginas varia com o texto e as configurações.

Antes de compartilhar ou hospedar uma versão, revise os dados e use **Baixar cópia para compartilhar**. O HTML baixado reúne os textos salvos e os estilos, sem o editor. Guarde a pasta original para continuar editando e nunca envie o `.env`. O `.gitignore` não impede que um arquivo seja enviado manualmente para uma hospedagem.
