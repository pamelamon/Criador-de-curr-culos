<?php
require __DIR__ . '/../src/bootstrap.php';

$page = (string)($_GET['page'] ?? 'dashboard');
$allowed = ['dashboard', 'tutores', 'animais', 'consultas'];
if (!in_array($page, $allowed, true)) {
    $page = 'dashboard';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $action = postString('action');
    try {
        if ($action === 'save_tutor') {
            $id = (int)($_POST['id'] ?? 0);
            $nome = postString('nome');
            $cpf = postString('cpf') ?: null;
            $telefone = postString('telefone');
            $email = postString('email') ?: null;
            $endereco = postString('endereco') ?: null;
            $observacoes = postString('observacoes') ?: null;
            if ($nome === '' || $telefone === '') {
                throw new RuntimeException('Informe o nome e o telefone do tutor.');
            }
            if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new RuntimeException('Informe um e-mail válido.');
            }
            if ($id > 0) {
                $stmt = $pdo->prepare('UPDATE tutores SET nome=?, cpf=?, telefone=?, email=?, endereco=?, observacoes=? WHERE id=?');
                $stmt->execute([$nome, $cpf, $telefone, $email, $endereco, $observacoes, $id]);
                flash('success', 'Tutor atualizado com sucesso.');
            } else {
                $stmt = $pdo->prepare('INSERT INTO tutores (nome, cpf, telefone, email, endereco, observacoes) VALUES (?,?,?,?,?,?)');
                $stmt->execute([$nome, $cpf, $telefone, $email, $endereco, $observacoes]);
                flash('success', 'Tutor cadastrado com sucesso.');
            }
            redirect('index.php?page=tutores');
        }
        if ($action === 'delete_tutor') {
            $id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare('DELETE FROM tutores WHERE id=?');
            $stmt->execute([$id]);
            flash('success', 'Tutor excluído.');
            redirect('index.php?page=tutores');
        }
        if ($action === 'save_animal') {
            $id = (int)($_POST['id'] ?? 0);
            $tutorId = (int)($_POST['tutor_id'] ?? 0);
            $nome = postString('nome');
            $especie = postString('especie');
            $raca = postString('raca') ?: null;
            $sexo = postString('sexo') ?: 'Não informado';
            $nascimento = postString('data_nascimento') ?: null;
            $peso = postString('peso');
            $peso = $peso !== '' ? (float)str_replace(',', '.', $peso) : null;
            $cor = postString('cor') ?: null;
            $obs = postString('observacoes') ?: null;
            if ($tutorId < 1 || $nome === '' || $especie === '') {
                throw new RuntimeException('Informe o tutor, o nome e a espécie do animal.');
            }
            if ($peso !== null && $peso <= 0) {
                throw new RuntimeException('O peso deve ser maior que zero.');
            }
            if ($id > 0) {
                $stmt = $pdo->prepare('UPDATE animais SET tutor_id=?, nome=?, especie=?, raca=?, sexo=?, data_nascimento=?, peso=?, cor=?, observacoes=? WHERE id=?');
                $stmt->execute([$tutorId, $nome, $especie, $raca, $sexo, $nascimento, $peso, $cor, $obs, $id]);
                flash('success', 'Animal atualizado com sucesso.');
            } else {
                $stmt = $pdo->prepare('INSERT INTO animais (tutor_id,nome,especie,raca,sexo,data_nascimento,peso,cor,observacoes) VALUES (?,?,?,?,?,?,?,?,?)');
                $stmt->execute([$tutorId, $nome, $especie, $raca, $sexo, $nascimento, $peso, $cor, $obs]);
                flash('success', 'Animal cadastrado com sucesso.');
            }
            redirect('index.php?page=animais');
        }
        if ($action === 'delete_animal') {
            $stmt = $pdo->prepare('DELETE FROM animais WHERE id=?');
            $stmt->execute([(int)($_POST['id'] ?? 0)]);
            flash('success', 'Animal excluído.');
            redirect('index.php?page=animais');
        }
        if ($action === 'save_consulta') {
            $id = (int)($_POST['id'] ?? 0);
            $animalId = (int)($_POST['animal_id'] ?? 0);
            $dataHora = str_replace('T', ' ', postString('data_hora'));
            if (strlen($dataHora) === 16) $dataHora .= ':00';
            $motivo = postString('motivo');
            $status = postString('status') ?: 'Agendada';
            $sintomas = postString('sintomas') ?: null;
            $diagnostico = postString('diagnostico') ?: null;
            $tratamento = postString('tratamento') ?: null;
            $obs = postString('observacoes') ?: null;
            $statuses = ['Agendada','Em atendimento','Concluída','Cancelada'];
            if ($animalId < 1 || $dataHora === '' || $motivo === '') {
                throw new RuntimeException('Informe o animal, a data/hora e o motivo da consulta.');
            }
            if (!in_array($status, $statuses, true)) throw new RuntimeException('Status de consulta inválido.');
            if ($id > 0) {
                $stmt = $pdo->prepare('UPDATE consultas SET animal_id=?, data_hora=?, motivo=?, status=?, sintomas=?, diagnostico=?, tratamento=?, observacoes=? WHERE id=?');
                $stmt->execute([$animalId,$dataHora,$motivo,$status,$sintomas,$diagnostico,$tratamento,$obs,$id]);
                flash('success', 'Consulta atualizada com sucesso.');
            } else {
                $stmt = $pdo->prepare('INSERT INTO consultas (animal_id,data_hora,motivo,status,sintomas,diagnostico,tratamento,observacoes) VALUES (?,?,?,?,?,?,?,?)');
                $stmt->execute([$animalId,$dataHora,$motivo,$status,$sintomas,$diagnostico,$tratamento,$obs]);
                flash('success', 'Consulta agendada com sucesso.');
            }
            redirect('index.php?page=consultas');
        }
        if ($action === 'delete_consulta') {
            $stmt = $pdo->prepare('DELETE FROM consultas WHERE id=?');
            $stmt->execute([(int)($_POST['id'] ?? 0)]);
            flash('success', 'Consulta excluída.');
            redirect('index.php?page=consultas');
        }
    } catch (PDOException $ex) {
        if ($ex->getCode() === '23000') {
            flash('error', 'Não foi possível concluir: verifique CPF duplicado ou se o registro está vinculado a outro cadastro.');
        } else {
            flash('error', 'O banco de dados não conseguiu concluir a operação. Confira os dados informados.');
        }
        redirect('index.php?page=' . $page);
    } catch (RuntimeException $ex) {
        flash('error', $ex->getMessage());
        redirect('index.php?page=' . $page);
    }
}

$pageTitle = match ($page) {
    'tutores' => 'Tutores',
    'animais' => 'Animais',
    'consultas' => 'Consultas',
    default => 'Dashboard'
};
$currentPage = $page;
require __DIR__ . '/../src/layout/header.php';

if ($page === 'dashboard') {
    $totalTutores = (int)$pdo->query('SELECT COUNT(*) FROM tutores')->fetchColumn();
    $totalAnimais = (int)$pdo->query('SELECT COUNT(*) FROM animais')->fetchColumn();
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM consultas WHERE DATE(data_hora)=CURDATE() AND status <> 'Cancelada'");
    $stmt->execute();
    $consultasHoje = (int)$stmt->fetchColumn();
    $proximas = $pdo->query("SELECT c.id,c.data_hora,c.motivo,c.status,a.nome AS animal,t.nome AS tutor
        FROM consultas c JOIN animais a ON a.id=c.animal_id JOIN tutores t ON t.id=a.tutor_id
        WHERE c.data_hora >= NOW() AND c.status IN ('Agendada','Em atendimento')
        ORDER BY c.data_hora LIMIT 6")->fetchAll();
    ?>
    <section class="welcome-row">
        <div><p class="eyebrow">VISÃO GERAL</p><h1>Olá! Bem-vindo à DPvet <span class="wave">✦</span></h1><p class="muted">Acompanhe a rotina da sua clínica em um só lugar.</p></div>
        <div class="today-chip"><span>◷</span><?= date('d/m/Y') ?></div>
    </section>
    <section class="stats-grid">
        <article class="stat-card"><div class="stat-top"><span class="stat-icon green">♙</span><span class="stat-caption">CADASTRO</span></div><p class="stat-value"><?= $totalTutores ?></p><p class="stat-label">Tutores cadastrados</p><a href="index.php?page=tutores" class="stat-link">Ver tutores <span>→</span></a></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-icon mint">♧</span><span class="stat-caption">CADASTRO</span></div><p class="stat-value"><?= $totalAnimais ?></p><p class="stat-label">Animais cadastrados</p><a href="index.php?page=animais" class="stat-link">Ver animais <span>→</span></a></article>
        <article class="stat-card"><div class="stat-top"><span class="stat-icon amber">▣</span><span class="stat-caption">HOJE</span></div><p class="stat-value"><?= $consultasHoje ?></p><p class="stat-label">Consultas de hoje</p><a href="index.php?page=consultas" class="stat-link">Ver agenda <span>→</span></a></article>
    </section>
    <section class="panel">
        <div class="panel-heading"><div><h2>Próximas consultas</h2><p class="muted">Acompanhe os próximos atendimentos agendados.</p></div><a class="button button-primary button-small" href="index.php?page=consultas&novo=1">＋ Agendar consulta</a></div>
        <?php if (!$proximas): ?><div class="empty-state"><span class="empty-icon">▣</span><strong>Nenhuma consulta próxima</strong><p>Quando você agendar um atendimento, ele aparecerá aqui.</p><a class="button button-secondary button-small" href="index.php?page=consultas&novo=1">Agendar primeira consulta</a></div>
        <?php else: ?><div class="table-wrap"><table><thead><tr><th>DATA E HORA</th><th>ANIMAL</th><th>TUTOR</th><th>MOTIVO</th><th>STATUS</th></tr></thead><tbody>
        <?php foreach ($proximas as $c): ?><tr><td><strong><?= date('d/m/Y', strtotime($c['data_hora'])) ?></strong><small class="table-sub"><?= date('H:i', strtotime($c['data_hora'])) ?></small></td><td><?= e($c['animal']) ?></td><td><?= e($c['tutor']) ?></td><td><?= e($c['motivo']) ?></td><td><span class="badge <?= $c['status']==='Em atendimento'?'badge-blue':'badge-green' ?>"><?= e($c['status']) ?></span></td></tr><?php endforeach; ?>
        </tbody></table></div><?php endif; ?>
    </section>
    <?php
} elseif ($page === 'tutores') {
    $edit = null;
    if (!empty($_GET['editar'])) {
        $stmt = $pdo->prepare('SELECT * FROM tutores WHERE id=?');
        $stmt->execute([(int)$_GET['editar']]);
        $edit = $stmt->fetch() ?: null;
    }
    $q = trim((string)($_GET['q'] ?? ''));
    $stmt = $pdo->prepare('SELECT * FROM tutores WHERE nome LIKE ? OR telefone LIKE ? OR COALESCE(cpf,"") LIKE ? ORDER BY nome LIMIT 200');
    $like = '%' . $q . '%'; $stmt->execute([$like,$like,$like]); $tutores = $stmt->fetchAll();
    ?>
    <div class="page-heading"><div><p class="eyebrow">CADASTROS</p><h1>Tutores</h1><p class="muted">Gerencie os responsáveis pelos animais atendidos.</p></div><a class="button button-primary" href="index.php?page=tutores&novo=1">＋ Novo tutor</a></div>
    <?php if (!empty($_GET['novo']) || $edit): ?>
    <section class="panel form-panel"><div class="panel-heading"><div><h2><?= $edit?'Editar tutor':'Novo tutor' ?></h2><p class="muted">Preencha os dados do responsável.</p></div><a class="close-link" href="index.php?page=tutores">✕</a></div>
    <form method="post" class="form-grid">
        <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>"><input type="hidden" name="action" value="save_tutor"><input type="hidden" name="id" value="<?= (int)($edit['id']??0) ?>">
        <label class="field field-span-2">Nome completo <span>*</span><input required name="nome" maxlength="120" value="<?= e($edit['nome']??'') ?>" placeholder="Nome do tutor"></label>
        <label class="field">CPF<input name="cpf" maxlength="14" value="<?= e($edit['cpf']??'') ?>" placeholder="000.000.000-00"></label>
        <label class="field">Telefone / WhatsApp <span>*</span><input required name="telefone" maxlength="25" value="<?= e($edit['telefone']??'') ?>" placeholder="(00) 00000-0000"></label>
        <label class="field">E-mail<input type="email" name="email" maxlength="150" value="<?= e($edit['email']??'') ?>" placeholder="nome@email.com"></label>
        <label class="field">Endereço<input name="endereco" maxlength="255" value="<?= e($edit['endereco']??'') ?>" placeholder="Rua, número, bairro"></label>
        <label class="field field-span-2">Observações<textarea name="observacoes" rows="3" placeholder="Informações adicionais (opcional)"><?= e($edit['observacoes']??'') ?></textarea></label>
        <div class="form-actions field-span-2"><a class="button button-secondary" href="index.php?page=tutores">Cancelar</a><button class="button button-primary" type="submit">Salvar tutor</button></div>
    </form></section>
    <?php endif; ?>
    <section class="panel"><div class="panel-heading"><div><h2>Todos os tutores <span class="count-pill"><?= count($tutores) ?></span></h2><p class="muted">Lista de responsáveis cadastrados.</p></div><form class="search-form" method="get"><input type="hidden" name="page" value="tutores"><input name="q" value="<?= e($q) ?>" placeholder="Buscar tutor..."><button aria-label="Buscar">⌕</button></form></div>
    <?php if (!$tutores): ?><div class="empty-state"><span class="empty-icon">♙</span><strong><?= $q?'Nenhum resultado encontrado':'Nenhum tutor cadastrado' ?></strong><p><?= $q?'Tente buscar por outro nome, telefone ou CPF.':'Cadastre o primeiro tutor para começar.' ?></p><?php if (!$q): ?><a class="button button-primary button-small" href="index.php?page=tutores&novo=1">＋ Cadastrar tutor</a><?php endif; ?></div>
    <?php else: ?><div class="table-wrap"><table><thead><tr><th>TUTOR</th><th>TELEFONE</th><th>CPF</th><th>E-MAIL</th><th class="align-right">AÇÕES</th></tr></thead><tbody><?php foreach ($tutores as $t): ?><tr><td><div class="person-cell"><span class="person-avatar"><?= e(mb_strtoupper(mb_substr($t['nome'],0,1))) ?></span><strong><?= e($t['nome']) ?></strong></div></td><td><?= e($t['telefone']) ?></td><td><?= e($t['cpf']?:'—') ?></td><td><?= e($t['email']?:'—') ?></td><td class="actions"><a class="action-link" href="index.php?page=tutores&editar=<?= (int)$t['id'] ?>">Editar</a><form method="post" onsubmit="return confirm('Excluir este tutor? Só é possível excluir tutores sem animais vinculados.');"><input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>"><input type="hidden" name="action" value="delete_tutor"><input type="hidden" name="id" value="<?= (int)$t['id'] ?>"><button class="action-link danger" type="submit">Excluir</button></form></td></tr><?php endforeach; ?></tbody></table></div><?php endif; ?></section>
    <?php
} elseif ($page === 'animais') {
    $edit = null;
    if (!empty($_GET['editar'])) { $stmt=$pdo->prepare('SELECT * FROM animais WHERE id=?'); $stmt->execute([(int)$_GET['editar']]); $edit=$stmt->fetch()?:null; }
    $tutores = $pdo->query('SELECT id,nome FROM tutores ORDER BY nome')->fetchAll();
    $q = trim((string)($_GET['q'] ?? ''));
    $stmt=$pdo->prepare('SELECT a.*,t.nome AS tutor_nome FROM animais a JOIN tutores t ON t.id=a.tutor_id WHERE a.nome LIKE ? OR t.nome LIKE ? OR a.especie LIKE ? ORDER BY a.nome LIMIT 200');
    $like='%'.$q.'%';$stmt->execute([$like,$like,$like]);$animais=$stmt->fetchAll();
    ?>
    <div class="page-heading"><div><p class="eyebrow">CADASTROS</p><h1>Animais</h1><p class="muted">Mantenha os dados dos pacientes organizados.</p></div><a class="button button-primary" href="index.php?page=animais&novo=1">＋ Novo animal</a></div>
    <?php if (!empty($_GET['novo'])||$edit): ?>
    <section class="panel form-panel"><div class="panel-heading"><div><h2><?= $edit?'Editar animal':'Novo animal' ?></h2><p class="muted">Vincule o paciente a um tutor.</p></div><a class="close-link" href="index.php?page=animais">✕</a></div>
    <?php if (!$tutores): ?><div class="alert alert-error">Cadastre um tutor antes de cadastrar um animal. <a href="index.php?page=tutores&novo=1">Cadastrar tutor</a></div><?php else: ?>
    <form method="post" class="form-grid"><input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>"><input type="hidden" name="action" value="save_animal"><input type="hidden" name="id" value="<?= (int)($edit['id']??0) ?>">
        <label class="field field-span-2">Tutor responsável <span>*</span><select name="tutor_id" required><option value="">Selecione o tutor</option><?php foreach($tutores as $t): ?><option value="<?= (int)$t['id'] ?>" <?= (int)($edit['tutor_id']??0)===(int)$t['id']?'selected':'' ?>><?= e($t['nome']) ?></option><?php endforeach; ?></select></label>
        <label class="field">Nome do animal <span>*</span><input required name="nome" maxlength="100" value="<?= e($edit['nome']??'') ?>" placeholder="Ex.: Mel"></label>
        <label class="field">Espécie <span>*</span><select required name="especie"><option value="">Selecione</option><?php foreach(['Cão','Gato','Ave','Roedor','Réptil','Outro'] as $s): ?><option <?= ($edit['especie']??'')===$s?'selected':'' ?>><?= e($s) ?></option><?php endforeach; ?></select></label>
        <label class="field">Raça<input name="raca" maxlength="80" value="<?= e($edit['raca']??'') ?>" placeholder="Raça (opcional)"></label>
        <label class="field">Sexo<select name="sexo"><?php foreach(['Não informado','Macho','Fêmea'] as $s): ?><option <?= ($edit['sexo']??'Não informado')===$s?'selected':'' ?>><?= e($s) ?></option><?php endforeach; ?></select></label>
        <label class="field">Data de nascimento<input type="date" name="data_nascimento" value="<?= e($edit['data_nascimento']??'') ?>"></label>
        <label class="field">Peso (kg)<input type="number" name="peso" min="0.01" step="0.01" value="<?= e(isset($edit['peso'])?(string)$edit['peso']:'') ?>" placeholder="Ex.: 8,50"></label>
        <label class="field">Cor<input name="cor" maxlength="60" value="<?= e($edit['cor']??'') ?>"></label>
        <label class="field field-span-2">Observações<textarea name="observacoes" rows="3"><?= e($edit['observacoes']??'') ?></textarea></label>
        <div class="form-actions field-span-2"><a class="button button-secondary" href="index.php?page=animais">Cancelar</a><button class="button button-primary" type="submit">Salvar animal</button></div>
    </form><?php endif; ?></section><?php endif; ?>
    <section class="panel"><div class="panel-heading"><div><h2>Todos os animais <span class="count-pill"><?= count($animais) ?></span></h2><p class="muted">Pacientes cadastrados e seus responsáveis.</p></div><form class="search-form" method="get"><input type="hidden" name="page" value="animais"><input name="q" value="<?= e($q) ?>" placeholder="Buscar animal ou tutor..."><button aria-label="Buscar">⌕</button></form></div>
    <?php if(!$animais): ?><div class="empty-state"><span class="empty-icon">♧</span><strong>Nenhum animal encontrado</strong><p>Cadastre um paciente para começar o acompanhamento.</p><?php if($tutores): ?><a class="button button-primary button-small" href="index.php?page=animais&novo=1">＋ Cadastrar animal</a><?php endif; ?></div>
    <?php else: ?><div class="table-wrap"><table><thead><tr><th>ANIMAL</th><th>ESPÉCIE / RAÇA</th><th>TUTOR</th><th>PESO</th><th class="align-right">AÇÕES</th></tr></thead><tbody><?php foreach($animais as $a): ?><tr><td><div class="person-cell"><span class="pet-avatar">🐾</span><div><strong><?= e($a['nome']) ?></strong><small class="table-sub"><?= e($a['sexo']) ?></small></div></div></td><td><?= e($a['especie']) ?><small class="table-sub"><?= e($a['raca']?:'Raça não informada') ?></small></td><td><?= e($a['tutor_nome']) ?></td><td><?= $a['peso']!==null?e((string)$a['peso']).' kg':'—' ?></td><td class="actions"><a class="action-link" href="index.php?page=animais&editar=<?= (int)$a['id'] ?>">Editar</a><form method="post" onsubmit="return confirm('Excluir este animal? Animais com consultas vinculadas não podem ser excluídos.');"><input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>"><input type="hidden" name="action" value="delete_animal"><input type="hidden" name="id" value="<?= (int)$a['id'] ?>"><button class="action-link danger" type="submit">Excluir</button></form></td></tr><?php endforeach; ?></tbody></table></div><?php endif; ?></section>
    <?php
} elseif ($page === 'consultas') {
    $edit=null;
    if(!empty($_GET['editar'])){$stmt=$pdo->prepare('SELECT * FROM consultas WHERE id=?');$stmt->execute([(int)$_GET['editar']]);$edit=$stmt->fetch()?:null;}
    $animais=$pdo->query('SELECT a.id,a.nome,a.especie,t.nome AS tutor_nome FROM animais a JOIN tutores t ON t.id=a.tutor_id ORDER BY a.nome')->fetchAll();
    $q=trim((string)($_GET['q']??''));
    $stmt=$pdo->prepare('SELECT c.*,a.nome AS animal,a.especie,t.nome AS tutor FROM consultas c JOIN animais a ON a.id=c.animal_id JOIN tutores t ON t.id=a.tutor_id WHERE a.nome LIKE ? OR t.nome LIKE ? OR c.motivo LIKE ? ORDER BY c.data_hora DESC LIMIT 200');
    $like='%'.$q.'%';$stmt->execute([$like,$like,$like]);$consultas=$stmt->fetchAll();
    ?>
    <div class="page-heading"><div><p class="eyebrow">AGENDA E ATENDIMENTO</p><h1>Consultas</h1><p class="muted">Agende e acompanhe os atendimentos da clínica.</p></div><a class="button button-primary" href="index.php?page=consultas&novo=1">＋ Agendar consulta</a></div>
    <?php if(!empty($_GET['novo'])||$edit): ?><section class="panel form-panel"><div class="panel-heading"><div><h2><?= $edit?'Editar consulta':'Agendar consulta' ?></h2><p class="muted">Registre o atendimento e as informações clínicas.</p></div><a class="close-link" href="index.php?page=consultas">✕</a></div>
    <?php if(!$animais): ?><div class="alert alert-error">Cadastre pelo menos um animal antes de agendar uma consulta. <a href="index.php?page=animais&novo=1">Cadastrar animal</a></div><?php else: ?>
    <form method="post" class="form-grid"><input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>"><input type="hidden" name="action" value="save_consulta"><input type="hidden" name="id" value="<?= (int)($edit['id']??0) ?>">
        <label class="field field-span-2">Animal / paciente <span>*</span><select name="animal_id" required><option value="">Selecione o animal</option><?php foreach($animais as $a): ?><option value="<?= (int)$a['id'] ?>" <?= (int)($edit['animal_id']??0)===(int)$a['id']?'selected':'' ?>><?= e($a['nome']) ?> — <?= e($a['especie']) ?> · Tutor: <?= e($a['tutor_nome']) ?></option><?php endforeach; ?></select></label>
        <label class="field">Data e horário <span>*</span><input type="datetime-local" name="data_hora" required value="<?= e(isset($edit['data_hora'])?date('Y-m-d\TH:i',strtotime($edit['data_hora'])):date('Y-m-d\TH:i',ceil(time()/900)*900)) ?>"></label>
        <label class="field">Status<select name="status"><?php foreach(['Agendada','Em atendimento','Concluída','Cancelada'] as $s): ?><option <?= ($edit['status']??'Agendada')===$s?'selected':'' ?>><?= e($s) ?></option><?php endforeach; ?></select></label>
        <label class="field field-span-2">Motivo da consulta <span>*</span><input required name="motivo" maxlength="180" value="<?= e($edit['motivo']??'') ?>" placeholder="Ex.: Consulta de rotina"></label>
        <label class="field field-span-2">Sintomas / queixa<textarea name="sintomas" rows="2"><?= e($edit['sintomas']??'') ?></textarea></label>
        <label class="field field-span-2">Diagnóstico<textarea name="diagnostico" rows="2"><?= e($edit['diagnostico']??'') ?></textarea></label>
        <label class="field field-span-2">Tratamento / conduta<textarea name="tratamento" rows="2"><?= e($edit['tratamento']??'') ?></textarea></label>
        <label class="field field-span-2">Observações<textarea name="observacoes" rows="2"><?= e($edit['observacoes']??'') ?></textarea></label>
        <div class="form-actions field-span-2"><a class="button button-secondary" href="index.php?page=consultas">Cancelar</a><button class="button button-primary" type="submit">Salvar consulta</button></div>
    </form><?php endif; ?></section><?php endif; ?>
    <section class="panel"><div class="panel-heading"><div><h2>Agenda de consultas <span class="count-pill"><?= count($consultas) ?></span></h2><p class="muted">Atendimentos registrados na clínica.</p></div><form class="search-form" method="get"><input type="hidden" name="page" value="consultas"><input name="q" value="<?= e($q) ?>" placeholder="Buscar animal, tutor..."><button aria-label="Buscar">⌕</button></form></div>
    <?php if(!$consultas): ?><div class="empty-state"><span class="empty-icon">▣</span><strong>Nenhuma consulta encontrada</strong><p>Agende um atendimento para vê-lo nesta lista.</p><?php if($animais): ?><a class="button button-primary button-small" href="index.php?page=consultas&novo=1">＋ Agendar consulta</a><?php endif; ?></div>
    <?php else: ?><div class="table-wrap"><table><thead><tr><th>DATA / HORA</th><th>ANIMAL</th><th>TUTOR</th><th>MOTIVO</th><th>STATUS</th><th class="align-right">AÇÕES</th></tr></thead><tbody><?php foreach($consultas as $c): $badge=match($c['status']){'Concluída'=>'badge-green','Cancelada'=>'badge-red','Em atendimento'=>'badge-blue',default=>'badge-amber'}; ?><tr><td><strong><?= date('d/m/Y',strtotime($c['data_hora'])) ?></strong><small class="table-sub"><?= date('H:i',strtotime($c['data_hora'])) ?></small></td><td><strong><?= e($c['animal']) ?></strong><small class="table-sub"><?= e($c['especie']) ?></small></td><td><?= e($c['tutor']) ?></td><td><?= e($c['motivo']) ?></td><td><span class="badge <?= $badge ?>"><?= e($c['status']) ?></span></td><td class="actions"><a class="action-link" href="index.php?page=consultas&editar=<?= (int)$c['id'] ?>">Editar</a><form method="post" onsubmit="return confirm('Excluir esta consulta?');"><input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>"><input type="hidden" name="action" value="delete_consulta"><input type="hidden" name="id" value="<?= (int)$c['id'] ?>"><button class="action-link danger" type="submit">Excluir</button></form></td></tr><?php endforeach; ?></tbody></table></div><?php endif; ?></section>
    <?php
}
require __DIR__ . '/../src/layout/footer.php';
