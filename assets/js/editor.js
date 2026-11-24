(() => {
  'use strict';

  // A edição pertence à cópia local. A cópia exportada não contém este script.
  const localFile = window.location.protocol === 'file:';
  const localPreview = ['http:', 'https:'].includes(window.location.protocol)
    && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const toolbar = document.querySelector('[data-editor-ui]');
  if ((!localFile && !localPreview) || !toolbar) return;

  const script = document.querySelector('script[data-resume-editor]');
  const variant = script.dataset.variant;
  const storageKey = `curriculo-editor:v1:${window.location.pathname}`;
  const editButton = toolbar.querySelector('[data-action="edit"]');
  const saveButton = toolbar.querySelector('[data-action="save"]');
  const cancelButton = toolbar.querySelector('[data-action="cancel"]');
  const downloadButton = toolbar.querySelector('[data-action="download"]');
  const pdfButton = toolbar.querySelector('[data-action="pdf"]');
  const photoButton = document.querySelector('[data-action="photo"]');
  const changePhotoButton = document.querySelector('[data-action="change-photo"]');
  const removePhotoButton = document.querySelector('[data-action="remove-photo"]');
  const photoInput = document.querySelector('[data-resume-photo-input]');
  const photoControls = document.querySelector('[data-photo-controls]');
  const photoActions = document.querySelector('[data-photo-actions]');
  const photoImage = document.querySelector('[data-resume-photo]');
  const help = toolbar.querySelector('[data-editor-help]');
  const status = toolbar.querySelector('[role="status"]');
  const selectors = [
    'h1', 'h2', 'h3', 'p', '.hero-eyebrow', '.hero-role', '.hero-intro',
    '.location', '.contact-value', '.field-label', '.section-label',
    '.section-subtitle', '.technical-list li > span', '.skill-tags li',
    '.language-list li > span', '.objective-note', '.badge', '.course-status',
    '.footer-name', '.initials > span', '.example-label', '.eyebrow', '.role',
    '.intro', '.contacts .label', '.contacts .value', '.kicker',
    '.skills li > span', '.tags li', '.languages li > span', '.statement',
    '.experience-tasks li', '.resume-footer > span', '.draft'
  ].join(',');
  const candidates = [...document.querySelectorAll(selectors)]
    .filter(element => !element.closest('[data-editor-ui]'));
  const fields = candidates.filter(element => !candidates.some(parent => parent !== element && parent.contains(element)));
  const usedKeys = new Set(fields.map(field => field.dataset.resumeField).filter(Boolean));
  let nextKey = 0;
  for (const field of fields) {
    if (field.dataset.resumeField) continue;
    while (usedKeys.has(`texto-${nextKey}`)) nextKey++;
    field.dataset.resumeField = `texto-${nextKey++}`;
    usedKeys.add(field.dataset.resumeField);
  }
  const editingAttributes = ['contenteditable', 'tabindex', 'role', 'aria-label', 'spellcheck'];
  const originalAttributes = new Map(fields.map(field => [field,
    Object.fromEntries(editingAttributes.map(attribute => [attribute, field.getAttribute(attribute)]))
  ]));
  const allowedTags = new Set(['SPAN', 'STRONG', 'EM', 'B', 'I', 'BR']);
  const allowedClasses = new Set(fields.flatMap(field => [...field.querySelectorAll('[class]')]
    .flatMap(element => [...element.classList])));
  let editing = false;
  let dirty = false;
  let beforeEditing = null;
  let currentPhoto = '';
  let photoRequest = 0;

  function setPhoto(value) {
    if (!photoImage) return;
    currentPhoto = typeof value === 'string' && value.length <= 3000000
      && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(value) ? value : '';
    if (currentPhoto) photoImage.src = currentPhoto;
    else photoImage.removeAttribute('src');
    photoImage.hidden = !currentPhoto;
    const initials = document.querySelector('.initials');
    if (initials) initials.hidden = Boolean(currentPhoto);
    if (photoButton) photoButton.hidden = Boolean(currentPhoto);
    if (changePhotoButton) changePhotoButton.hidden = !currentPhoto;
    if (removePhotoButton) removePhotoButton.hidden = !currentPhoto;
    if (photoActions) photoActions.hidden = !currentPhoto;
    photoImage.closest('.hero-identity')?.classList.toggle('has-photo-actions', Boolean(currentPhoto));
  }

  function photoChanged(message) {
    if (editing) {
      dirty = true;
      status.textContent = `${message} Clique em Salvar alterações para guardar.`;
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(snapshot()));
      status.textContent = `${message} Alteração salva neste navegador e incluída na próxima prévia em PDF.`;
    } catch {
      status.textContent = `${message} O navegador não permitiu guardar. Baixe a cópia atualizada antes de fechar.`;
    }
  }

  // Só texto e a formatação simples já usada no currículo são restaurados.
  function cleanContent(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    function copy(node) {
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
      const fragment = document.createDocumentFragment();
      if (node.nodeType !== Node.ELEMENT_NODE) return fragment;
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'TEMPLATE'].includes(node.tagName)) return fragment;
      const target = allowedTags.has(node.tagName) ? document.createElement(node.tagName.toLowerCase()) : fragment;
      if (target.nodeType === Node.ELEMENT_NODE) {
        const classes = [...node.classList].filter(name => allowedClasses.has(name));
        if (classes.length) target.className = classes.join(' ');
        if (node.getAttribute('aria-hidden') === 'true') target.setAttribute('aria-hidden', 'true');
      }
      for (const child of node.childNodes) target.append(copy(child));
      return target;
    }
    const result = document.createDocumentFragment();
    for (const child of template.content.childNodes) result.append(copy(child));
    return result;
  }

  function snapshot() {
    return { version: 1, fields: Object.fromEntries(fields.map(field => [field.dataset.resumeField, field.innerHTML])), photo: currentPhoto };
  }

  function restore(data) {
    if (data?.version !== 1 || !data.fields || typeof data.fields !== 'object') return;
    for (const field of fields) {
      const value = data.fields[field.dataset.resumeField];
      if (typeof value === 'string' && value.length <= 100000) field.replaceChildren(cleanContent(value));
    }
    setPhoto(data.photo);
    updateContactLinks();
    updatePageDetails();
  }

  function personName() {
    const heading = document.querySelector('h1').cloneNode(true);
    heading.querySelectorAll('.name-period, [aria-hidden="true"]').forEach(element => element.remove());
    return heading.textContent.trim().replace(/\s+/g, ' ');
  }

  function phoneNumber() {
    const link = document.querySelector('.whatsapp-link');
    if (!link) return '';
    let digits = link.textContent.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) digits = '55' + digits;
    return /^55\d{10,11}$/.test(digits) ? digits : null;
  }

  function updateContactLinks() {
    const digits = phoneNumber();
    if (!digits) return;
    for (const link of document.querySelectorAll('a[href^="https://wa.me/"]')) {
      link.href = `https://wa.me/${digits}`;
      link.setAttribute('aria-label', `Conversar com ${personName()} pelo WhatsApp (abre em nova aba)`);
    }
  }

  function updatePageDetails() {
    const name = personName();
    document.title = `${name} | Currículo digital`;
    if (photoImage) photoImage.alt = `Foto de ${name}`;
    const parts = name.split(/\s+/).filter(Boolean);
    const monogram = document.querySelector('.initials, .monogram');
    if (monogram && parts.length) {
      const motto = monogram.querySelector('span');
      monogram.replaceChildren((parts[0][0] + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase());
      if (motto) monogram.append(motto);
    }
    const summary = document.querySelector('#sobre p');
    const description = document.querySelector('meta[name="description"]');
    if (description && summary) description.content = summary.textContent.trim().slice(0, 200);
  }

  function setEditing(value) {
    editing = value;
    toolbar.classList.toggle('is-editing', value);
    editButton.hidden = value;
    saveButton.hidden = !value;
    cancelButton.hidden = !value;
    help.textContent = value
      ? 'Clique em qualquer texto com contorno para editar. Ao terminar, clique em Salvar alterações.'
      : 'As alterações ficam neste navegador. Baixe uma cópia sem o editor para compartilhar.';
    for (const field of fields) {
      if (value) {
        field.setAttribute('contenteditable', 'plaintext-only');
        field.setAttribute('tabindex', '0');
        field.setAttribute('role', 'textbox');
        field.setAttribute('aria-label', `Editar: ${field.textContent.trim().slice(0, 80)}`);
        field.setAttribute('spellcheck', 'true');
      } else {
        for (const attribute of editingAttributes) {
          const original = originalAttributes.get(field)[attribute];
          if (original === null) field.removeAttribute(attribute);
          else field.setAttribute(attribute, original);
        }
      }
    }
  }

  function save() {
    if (!personName()) {
      status.textContent = 'Informe seu nome antes de salvar.';
      document.querySelector('h1').focus();
      return false;
    }
    if (phoneNumber() === null) {
      status.textContent = 'Confira o WhatsApp: informe o DDD e o número completo.';
      document.querySelector('.whatsapp-link')?.focus();
      return false;
    }
    if (fields.some(field => field.textContent.length > 20000)) {
      status.textContent = 'Um dos textos está muito longo. Reduza-o antes de salvar.';
      return false;
    }
    const heading = document.querySelector('h1');
    const headingChanged = beforeEditing && beforeEditing.fields[heading.dataset.resumeField] !== heading.innerHTML;
    for (const field of fields) field.replaceChildren(cleanContent(field.innerHTML));
    if (headingChanged) {
      const name = personName();
      const footer = document.querySelector('.footer-name, .resume-footer > span');
      if (footer) {
        const period = footer.querySelector('.name-period, span');
        const decoration = period?.cloneNode(true);
        footer.textContent = name + (footer.closest('.resume-footer') ? ' · Currículo digital' : '');
        if (decoration) footer.append(decoration);
      }
    }
    updateContactLinks();
    updatePageDetails();
    let stored = true;
    try { window.localStorage.setItem(storageKey, JSON.stringify(snapshot())); } catch { stored = false; }
    setEditing(false);
    updateContactLinks();
    dirty = false;
    beforeEditing = null;
    status.textContent = stored
      ? 'Alterações salvas neste navegador. Baixe a cópia atualizada para compartilhar.'
      : 'O navegador não permitiu guardar as alterações. Baixe a cópia atualizada antes de fechar.';
    editButton.focus();
    return true;
  }

  editButton.addEventListener('click', () => {
    beforeEditing = snapshot();
    dirty = false;
    setEditing(true);
    status.textContent = 'Edição ativada. Os links ficam pausados enquanto você edita.';
    document.querySelector('h1').focus();
  });
  saveButton.addEventListener('click', save);
  photoButton?.addEventListener('click', () => photoInput.click());
  changePhotoButton?.addEventListener('click', () => photoInput.click());
  photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    photoInput.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      status.textContent = 'Escolha uma foto JPG, PNG ou WebP de até 2 MB.';
      return;
    }
    const editSession = beforeEditing;
    const startedEditing = editing;
    const request = ++photoRequest;
    const reader = new FileReader();
    reader.onload = () => {
      if (request !== photoRequest || (startedEditing && (!editing || beforeEditing !== editSession))) return;
      setPhoto(reader.result);
      if (!currentPhoto) {
        status.textContent = 'Não foi possível abrir essa foto. Escolha outra imagem.';
        return;
      }
      photoChanged('Foto atualizada.');
    };
    reader.onerror = () => { status.textContent = 'Não foi possível abrir essa foto. Escolha outra imagem.'; };
    reader.readAsDataURL(file);
  });
  removePhotoButton?.addEventListener('click', () => {
    photoRequest++;
    setPhoto('');
    photoChanged('Foto removida.');
  });
  cancelButton.addEventListener('click', () => {
    photoRequest++;
    restore(beforeEditing);
    beforeEditing = null;
    dirty = false;
    setEditing(false);
    updateContactLinks();
    status.textContent = 'Edição cancelada. Os textos anteriores foram mantidos.';
    editButton.focus();
  });
  document.addEventListener('input', event => {
    if (editing && event.target.closest('[data-resume-field]')) {
      dirty = true;
      status.textContent = 'Você tem alterações para salvar.';
    }
  });
  document.addEventListener('click', event => {
    if (editing && event.target.closest('a')) event.preventDefault();
  }, true);
  document.addEventListener('keydown', event => {
    if (editing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      save();
    }
    if (editing && event.key === 'Escape') cancelButton.click();
  });
  window.addEventListener('beforeunload', event => {
    if (editing && dirty) { event.preventDefault(); event.returnValue = ''; }
  });

  pdfButton?.addEventListener('click', async () => {
    if (editing && !save()) return;
    pdfButton.disabled = true;
    status.textContent = 'Na prévia, escolha Salvar como PDF e papel A4. Ative Gráficos de fundo para manter o azul do modelo.';
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      if (photoImage && !photoImage.hidden && typeof photoImage.decode === 'function') {
        await photoImage.decode().catch(() => {});
      }
      window.print();
    } catch {
      status.textContent = 'Não foi possível abrir a prévia. Use a opção Imprimir do navegador para salvar como PDF.';
    } finally {
      pdfButton.disabled = false;
    }
  });

  downloadButton.addEventListener('click', () => {
    if (editing && !save()) return;
    const styles = window.ResumeExportStyles?.[variant];
    if (!styles) {
      status.textContent = 'Não foi possível preparar a cópia. Mantenha os arquivos da pasta assets junto do currículo.';
      return;
    }
    const copy = document.documentElement.cloneNode(true);
    copy.querySelectorAll('[data-editor-ui], script, link[rel="stylesheet"]').forEach(element => element.remove());
    copy.querySelector('.proposal-bar')?.remove();
    copy.querySelector('[data-resume-photo]')?.removeAttribute('data-resume-photo');
    copy.querySelector('.hero-identity')?.classList.remove('has-photo-actions');
    for (const field of copy.querySelectorAll('[data-resume-field]')) {
      for (const attribute of ['data-resume-field', 'contenteditable', 'spellcheck']) field.removeAttribute(attribute);
    }
    const style = document.createElement('style');
    style.textContent = styles;
    copy.querySelector('head').append(style);
    const file = new Blob(['<!DOCTYPE html>\n' + copy.outerHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    const filename = personName().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    anchor.href = url;
    anchor.download = `curriculo-${filename || 'atualizado'}.html`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = 'Cópia para compartilhar preparada, com os textos atuais e sem o editor.';
  });

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) { restore(JSON.parse(saved)); status.textContent = 'Seus textos salvos foram carregados.'; }
  } catch {
    status.textContent = 'Se o navegador não guardar as alterações, use o botão para baixar uma cópia.';
  }
  setPhoto(currentPhoto);
  if (photoControls) photoControls.hidden = false;
  toolbar.hidden = false;
})();
