# DPvet — Sistema de Gestão Veterinária

Primeira versão local para uma clínica veterinária, usando PHP 8+, MySQL e PDO.

## Funcionalidades
- Dashboard com totais de tutores, animais e consultas do dia.
- Cadastro, listagem, busca, edição e exclusão de tutores.
- Cadastro, listagem, busca, edição e exclusão de animais vinculados a tutores.
- Agendamento e gestão de consultas vinculadas a animais.
- Interface responsiva com identidade visual verde DPvet.
- Consultas SQL preparadas via PDO e validação básica no servidor.

## Requisitos
- PHP 8.1 ou superior, com extensões `pdo_mysql` e `mbstring`.
- MySQL 8+ ou MariaDB compatível.
- Navegador moderno.

## Instalação
1. Crie o banco executando `database/schema.sql` no MySQL Workbench.
2. Copie `config/database.example.php` para `config/database.php`.
3. Ajuste host, nome do banco, usuário e senha em `config/database.php`.
4. No terminal, dentro da pasta do projeto, execute:
   ```bash
   php -S localhost:8000 -t public
   ```
5. Acesse `http://localhost:8000`.

No Windows, também é possível executar `php.bat` com duplo clique.

## Estrutura
- `public/`: ponto de entrada e assets públicos.
- `src/`: conexão, funções e páginas da aplicação.
- `config/`: configuração local do banco.
- `database/`: script SQL inicial.

## Observações
- Não exponha o servidor PHP embutido diretamente à internet.
- `config/database.php` é ignorado pelo Git; não publique credenciais.
- Esta versão ainda não tem autenticação. Use apenas em ambiente local confiável.
- Faça backups regulares do banco antes de atualizações.
