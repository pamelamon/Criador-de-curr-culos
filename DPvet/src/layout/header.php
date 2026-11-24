<?php
$pageTitle = $pageTitle ?? 'Painel';
$currentPage = $currentPage ?? 'dashboard';
$flashMessage = getFlash();
?>
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($pageTitle) ?> | DPvet</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="app-shell">
    <aside class="sidebar" id="sidebar">
        <a class="brand" href="index.php" aria-label="DPvet início">
            <span class="brand-mark">✚</span>
            <span class="brand-name">DP<span>vet</span><small>GESTÃO VETERINÁRIA</small></span>
        </a>
        <div class="nav-label">MENU PRINCIPAL</div>
        <nav class="nav-menu">
            <a class="nav-link <?= $currentPage === 'dashboard' ? 'active' : '' ?>" href="index.php"><span class="nav-icon">▦</span><span class="nav-text">Dashboard</span></a>
            <a class="nav-link <?= $currentPage === 'tutores' ? 'active' : '' ?>" href="index.php?page=tutores"><span class="nav-icon">♙</span><span class="nav-text">Tutores</span></a>
            <a class="nav-link <?= $currentPage === 'animais' ? 'active' : '' ?>" href="index.php?page=animais"><span class="nav-icon">♧</span><span class="nav-text">Animais</span></a>
            <a class="nav-link <?= $currentPage === 'consultas' ? 'active' : '' ?>" href="index.php?page=consultas"><span class="nav-icon">▣</span><span class="nav-text">Consultas</span></a>
        </nav>
        <div class="sidebar-bottom">
            <div class="help-card"><span class="help-icon">♡</span><strong>Bem-estar em primeiro lugar</strong><p>Organize a rotina da sua clínica com a DPvet.</p></div>
            <div class="sidebar-version">DPvet · Versão inicial</div>
        </div>
    </aside>

    <main class="main-area">
        <header class="topbar">
            <button class="icon-button menu-toggle" id="menuToggle" type="button" aria-label="Abrir menu">☰</button>
            <div class="breadcrumb"><span>DPvet</span><span class="crumb-separator">/</span><strong><?= e($pageTitle) ?></strong></div>
            <div class="topbar-right"><span class="status-dot"></span><span class="local-status">Ambiente local</span><div class="avatar">DP</div></div>
        </header>
        <div class="page-content">
            <?php if ($flashMessage): ?>
                <div class="alert alert-<?= e($flashMessage['type']) ?>" role="status"><?= e($flashMessage['message']) ?></div>
            <?php endif; ?>
