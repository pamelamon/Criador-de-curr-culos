(() => {
  'use strict';
  const M = window.CurriculoTemplates;
  const $ = selector => document.querySelector(selector);
  const form = $('#editor-form');
  const status = $('#app-status');
  const dialog = $('#preview-dialog');
  const storageKey = `curriculo-criador:v1:${window.location.pathname}`;
  const steps = ['personal','experience','education','skills','design'];
  const groupNames = { experience:'Experiência', education:'Formação', courses:'Curso', technical:'Habilidade', languages:'Idioma' };
  const blankGroups = { experience:{role:'',company:'',period:'',activities:''}, education:{course:'',institution:'',status:'Em andamento',period:'',details:''}, courses:{name:'',institution:'',duration:'',status:'Concluído'}, technical:{name:'',level:''}, languages:{name:'',level:''} };
  let library = { version:1, activeId:'', resumes:[] };
  let data;
  let renderTimer;
  let photoRequest = 0;
  let activeStep = 'personal';
  let exporting = false;
  const id = () => window.crypto?.randomUUID?.() || `cv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const e = M.escape;

  function message(text, error = false) { status.textContent = text; status.classList.toggle('is-error',error); }
  function save(announce = true) {
    try {
      window.localStorage.setItem(storageKey,JSON.stringify(library));
      if (announce) message('Alterações salvas neste navegador. O arquivo e o PDF usarão a versão atual.');
      return true;
    } catch {
      message('Não foi possível guardar neste navegador. Baixe seu currículo antes de fechar a página.',true);
      return false;
    }
  }
  function legacyResume() {
    try {
      const old = JSON.parse(window.localStorage.getItem(`curriculo-editor:v1:${window.location.pathname}`));
      if (old?.version !== 1 || !old.fields) return null;
      const text = key => { const template = document.createElement('template'); template.innerHTML = typeof old.fields[key] === 'string' ? old.fields[key] : ''; template.content.querySelectorAll('.name-period').forEach(element=>element.remove()); return [...template.content.childNodes].map(node=>node.textContent||'').join('').trim(); };
      const migrated = M.empty(id());
      migrated.personal = { ...migrated.personal, name:text('texto-1'),role:text('texto-2'),email:text('texto-10'),phone:text('texto-12').replace(/↗/g,'').trim(),city:text('texto-14'),summary:[text('texto-42'),text('texto-43')].filter(Boolean).join('\n\n'),photo:M.photo(old.photo) };
      const meta = text('texto-56').split(/\s*·\s*/);
      if (text('texto-55') || meta.join('')) migrated.experience.push({role:text('texto-55'),company:meta[0]||'',period:meta.slice(1).join(' · '),activities:[57,58,59,60].map(number=>text(`texto-${number}`)).filter(Boolean).join('\n')});
      for (const keys of [[46,48,47,49],[50,52,51,53]]) if (text(`texto-${keys[0]}`)) migrated.education.push({course:text(`texto-${keys[0]}`),institution:text(`texto-${keys[1]}`),status:text(`texto-${keys[2]}`),period:'',details:text(`texto-${keys[3]}`)});
      for (const keys of [[64,65,66],[67,68,69]]) if (text(`texto-${keys[0]}`)) { const detail=text(`texto-${keys[1]}`).split(/\s*·\s*/); migrated.courses.push({name:text(`texto-${keys[0]}`),institution:detail[0]||'',duration:detail.slice(1).join(' · '),status:text(`texto-${keys[2]}`)}); }
      migrated.technical = [[18,19],[20,21],[22,23],[24,25]].map(keys=>({name:text(`texto-${keys[0]}`),level:text(`texto-${keys[1]}`)})).filter(item=>item.name);
      migrated.personalSkillsText = [28,29,30,31,32,33].map(number=>text(`texto-${number}`)).filter(Boolean).join('\n');
      migrated.languages = [[36,37],[38,39]].map(keys=>({name:text(`texto-${keys[0]}`),level:text(`texto-${keys[1]}`)})).filter(item=>item.name);
      return M.normalize(migrated,migrated.id);
    } catch { return null; }
  }
  function load() {
    let recovered = false;
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey));
      if (stored?.version===1 && Array.isArray(stored.resumes)) {
        library.resumes = stored.resumes.map(item=>M.normalize(item,id()));
        library.activeId = stored.activeId;
      }
    } catch { /* O preenchimento continua disponível sem armazenamento. */ }
    if (!library.resumes.length) {
      const migrated = legacyResume();
      library.resumes.push(migrated || M.empty(id()));
      library.activeId = library.resumes[0].id;
      recovered = Boolean(migrated);
    }
    data = library.resumes.find(item=>item.id===library.activeId) || library.resumes[0];
    library.activeId = data.id;
    const requested = new URLSearchParams(window.location.search).get('modelo');
    if (M.templates.some(template=>template.id===requested)) data.theme.template=requested;
    if (recovered) message('Recuperamos os textos do seu currículo anterior. Confira seus dados no formulário.');
  }
  function picker() {
    $('#resume-picker').innerHTML = library.resumes.map((resume,index)=>`<option value="${e(resume.id)}"${resume.id===data.id?' selected':''}>${e(resume.personal.name || `Currículo sem nome ${index+1}`)}</option>`).join('');
  }
  function setStep(step, focus = false, scroll = true) {
    if (!steps.includes(step)) return;
    activeStep=step;
    for (const tab of document.querySelectorAll('[data-step]')) { const selected=tab.dataset.step===step; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex=selected?0:-1; }
    for (const panel of document.querySelectorAll('[data-panel], .form-panel')) panel.hidden=panel.id!==`panel-${step}`;
    if (focus) document.querySelector(`[data-step="${step}"]`).focus();
    if (scroll) $('.editor-panel').scrollIntoView?.({behavior:'auto',block:'start'});
  }
  function get(path) { return path.split('.').reduce((object,key)=>object?.[key],data) ?? ''; }
  function bind(path,value) {
    if (!/^(personal\.(name|birthDate|role|email|phone|city|summary)|personalSkillsText|(experience|education|courses|technical|languages)\.\d+\.(role|company|period|activities|course|institution|status|details|name|duration|level))$/.test(path)) return;
    const keys=path.split('.'); let parent=data;
    for (const key of keys.slice(0,-1)) { if (!Object.prototype.hasOwnProperty.call(parent,key)) return; parent=parent[key]; }
    if (parent && Object.prototype.hasOwnProperty.call(parent,keys.at(-1))) parent[keys.at(-1)]=value;
  }
  const input = (label,path,value,placeholder='') => `<label class="field">${label}<input data-bind="${path}" value="${e(value)}" placeholder="${placeholder}" maxlength="500"></label>`;
  const textarea = (label,path,value,placeholder='') => `<label class="field">${label}<textarea data-bind="${path}" rows="4" maxlength="6000" placeholder="${placeholder}">${e(value)}</textarea></label>`;
  function select(label,path,value,options) {
    const choices=options.includes(value)?options:[value,...options];
    return `<label class="field">${label}<select data-bind="${path}">${choices.map(option=>`<option value="${e(option)}"${option===value?' selected':''}>${e(option||'Selecione')}</option>`).join('')}</select></label>`;
  }
  function renderLists() {
    for (const [group,title] of Object.entries(groupNames)) {
      const list=$(`#${group}-list`);
      list.innerHTML=data[group].length?data[group].map((entry,index)=>{
        const path=`${group}.${index}`;
        let fields='';
        if (group==='experience') fields=input('Cargo ou função',`${path}.role`,entry.role,'Qual função você exerceu?')+input('Empresa ou organização',`${path}.company`,entry.company,'Nome da organização')+input('Período',`${path}.period`,entry.period,'Ex.: Jan. 2024 a out. 2026')+textarea('Atividades e resultados',`${path}.activities`,entry.activities,'Uma atividade por linha.');
        if (group==='education') fields=input('Curso ou formação',`${path}.course`,entry.course,'Nome do curso')+input('Instituição de ensino',`${path}.institution`,entry.institution,'Universidade, escola ou instituição')+select('Situação',`${path}.status`,entry.status,['Em andamento','Concluído','Interrompido'])+input('Período ou conclusão',`${path}.period`,entry.period,'Ex.: Conclusão prevista para 2028')+input('Detalhes',`${path}.details`,entry.details,'Ex.: Bacharelado, curso técnico ou profissionalizante');
        if (group==='courses') fields=input('Nome do curso',`${path}.name`,entry.name,'Qualificação ou curso complementar')+input('Instituição',`${path}.institution`,entry.institution,'Onde você fez o curso?')+input('Carga horária',`${path}.duration`,entry.duration,'Ex.: 40 horas')+select('Situação',`${path}.status`,entry.status,['Concluído','Em andamento']);
        if (group==='technical') fields=input('Habilidade',`${path}.name`,entry.name,'O que você sabe fazer?')+input('Nível ou observação',`${path}.level`,entry.level,'Opcional. Ex.: Intermediário');
        if (group==='languages') fields=input('Idioma',`${path}.name`,entry.name,'Nome do idioma')+select('Nível',`${path}.level`,entry.level,['','Nativo','Fluente','Avançado','Intermediário','Básico']);
        return `<div class="entry-card"><div class="entry-head"><strong>${title}</strong><button class="remove-entry" type="button" data-remove="${group}" data-index="${index}" aria-label="Remover ${title.toLowerCase()} ${index+1}">Remover</button></div>${fields}</div>`;
      }).join(''):`<p class="empty-form">Nenhum item adicionado. Use o botão abaixo para começar.</p>`;
    }
  }
  function syncPhoto() {
    const hasPhoto=Boolean(data.personal.photo);
    const image=$('#personal-photo-image');
    image.hidden=!hasPhoto;
    if (hasPhoto) image.src=data.personal.photo; else image.removeAttribute('src');
    $('#personal-photo-initials').textContent=M.initials(data.personal.name);
    $('#personal-photo-initials').hidden=hasPhoto;
    $('.photo-slot .photo-upload').hidden=hasPhoto;
    $('#personal-photo-actions').hidden=!hasPhoto;
  }
  function syncBirthDate() {
    $('#personal-birth-date').max=M.today();
    const age=M.ageOn(data.personal.birthDate);
    $('#personal-age').value=age===null?'':String(age);
  }
  function design() {
    $('#template-options').innerHTML=M.templates.map(template=>`<button type="button" class="template-card" data-template="${template.id}" aria-pressed="${template.id===data.theme.template}"><span class="mini-resume mini-${template.id}" style="--mini-color:${data.theme.color}" aria-hidden="true"><span class="mini-side"></span><span class="mini-main"><i></i><i></i><i></i><i></i><i></i></span></span><strong>${template.name}</strong><span>${template.description}</span></button>`).join('');
    $('#color-options').innerHTML=M.colors.map(color=>`<button type="button" class="color-swatch" data-color="${color.value}" style="--swatch:${color.value}" aria-label="${color.name}" title="${color.name}" aria-pressed="${color.value===data.theme.color}"></button>`).join('');
    $('#custom-color').value=data.theme.color;
    const template=M.templates.find(item=>item.id===data.theme.template);
    const color=M.colors.find(item=>item.value===data.theme.color);
    $('#preview-caption').textContent=`${template.name} · ${color?.name||'Cor personalizada'}`;
  }
  function fillForm() {
    renderLists();
    for (const field of form.querySelectorAll('[data-bind]')) field.value=get(field.dataset.bind);
    syncPhoto(); syncBirthDate(); design(); picker();
  }
  function fit(frame) {
    try {
      const doc=frame.contentDocument;
      if (!doc?.body) return;
      M.fitPage(doc);
      const width=frame.parentElement.clientWidth;
      if (!width) return;
      const sheet=doc.querySelector('.resume-sheet');
      const pageWidth=sheet?.offsetWidth||794;
      const height=sheet?.offsetHeight||1122;
      const scale=Math.min(width/pageWidth,1);
      frame.style.height=`${height}px`;
      frame.style.transform=`scale(${scale})`;
      frame.parentElement.style.height=`${height*scale}px`;
    } catch { /* A prévia continua disponível mesmo quando o navegador restringe a medição. */ }
  }
  function renderPreview() {
    window.clearTimeout(renderTimer);
    $('#resume-preview').srcdoc=M.build(data,true);
    if (dialog.open) $('#full-preview').srcdoc=M.build(data,false);
  }
  function changed() { syncBirthDate(); save(); window.clearTimeout(renderTimer); renderTimer=window.setTimeout(renderPreview,180); }
  function validate() {
    if (!data.personal.name.trim()) { setStep('personal'); message('Preencha seu nome completo para visualizar, baixar ou exportar o currículo.',true); $('#full-name').focus(); return false; }
    syncBirthDate();
    if (data.personal.birthDate && M.ageOn(data.personal.birthDate)===null) { setStep('personal'); message('Confira a data de nascimento. Informe uma data válida que não esteja no futuro.',true); $('#personal-birth-date').focus(); return false; }
    const email=$('#personal-email');
    if (data.personal.email && email.validity && !email.validity.valid) { setStep('personal'); message('Confira o endereço de e-mail antes de continuar.',true); email.focus(); email.reportValidity?.(); return false; }
    const phone=data.personal.phone.replace(/\D/g,'');
    if (data.personal.phone && (phone.length<10||phone.length>15)) { setStep('personal'); message('Confira o WhatsApp: informe o DDD e o número completo.',true); $('#personal-phone').focus(); return false; }
    return true;
  }
  function view() {
    if (!validate()) return;
    save(false);
    $('#full-preview').srcdoc=M.build(data,false);
    dialog.showModal();
    window.requestAnimationFrame(()=>fit($('#full-preview')));
  }
  async function prepareExport(frame) {
    let timeout, onLoad;
    window.clearTimeout(renderTimer);
    try {
      await new Promise((resolve,reject)=>{
        onLoad=()=>resolve();
        frame.addEventListener('load',onLoad,{once:true});
        timeout=window.setTimeout(()=>reject(new Error('preview-timeout')),10000);
        frame.srcdoc=M.build(data,false);
      });
      const doc=frame.contentDocument;
      if (doc.fonts?.ready) await doc.fonts.ready;
      await Promise.all([...doc.images].map(image=>typeof image.decode==='function'?image.decode().catch(()=>{}):Promise.resolve()));
      M.fitPage(doc);
      fit(frame);
      return doc;
    } finally {
      window.clearTimeout(timeout);
      if (onLoad) frame.removeEventListener('load',onLoad);
    }
  }
  function exportBusy(busy) {
    exporting=busy;
    for (const button of document.querySelectorAll('[data-app-action="download"],[data-app-action="pdf"]')) button.disabled=busy;
  }
  async function download() {
    if (exporting || !validate()) return;
    save(false);
    exportBusy(true);
    try {
      const doc=await prepareExport(dialog.open?$('#full-preview'):$('#resume-preview'));
      const blob=new Blob(['<!DOCTYPE html>'+doc.documentElement.outerHTML],{type:'text/html;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const anchor=document.createElement('a');
      anchor.href=url;
      const slug=data.personal.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      anchor.download=`curriculo-${slug||'atualizado'}.html`;
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),30000);
      message('Currículo preparado para baixar, ajustado para uma folha A4 com os textos e a foto atuais.');
    } catch {
      message('Não foi possível preparar o arquivo. Tente baixar o currículo novamente.',true);
    } finally { exportBusy(false); }
  }
  async function pdf() {
    if (exporting || !validate()) return;
    save(false);
    exportBusy(true);
    const frame=dialog.open?$('#full-preview'):$('#resume-preview');
    message('Currículo ajustado para uma folha. Escolha Salvar como PDF, papel A4, escala 100%, margens Padrão e ative Gráficos de fundo.');
    try {
      await prepareExport(frame);
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch {
      message('Não foi possível abrir a impressão. Use Visualizar e tente Exportar PDF novamente.',true);
    } finally {
      exportBusy(false);
    }
  }
  document.addEventListener('click',event=>{
    const step=event.target.closest('[data-step], [data-go-step]');
    if (step) { setStep(step.dataset.step||step.dataset.goStep); return; }
    const add=event.target.closest('[data-add]');
    if (add && blankGroups[add.dataset.add]) { const group=add.dataset.add; data[group].push({...blankGroups[group]}); renderLists(); changed(); $(`#${group}-list .entry-card:last-child input`)?.focus(); return; }
    const remove=event.target.closest('[data-remove]');
    if (remove && blankGroups[remove.dataset.remove]) { data[remove.dataset.remove].splice(Number(remove.dataset.index),1); renderLists(); changed(); return; }
    const template=event.target.closest('[data-template]');
    if (template && M.templates.some(item=>item.id===template.dataset.template)) { data.theme.template=template.dataset.template; design(); changed(); return; }
    const color=event.target.closest('[data-color]');
    if (color && /^#[a-f\d]{6}$/i.test(color.dataset.color)) { data.theme.color=color.dataset.color; design(); changed(); return; }
    const action=event.target.closest('[data-app-action]')?.dataset.appAction;
    if (!action) return;
    if (action==='view') view();
    if (action==='download') download();
    if (action==='pdf') pdf();
    if (action==='close-preview') dialog.close();
    if (action==='upload-photo') $('#photo-file').click();
    if (action==='remove-photo') { photoRequest++; data.personal.photo=''; syncPhoto(); changed(); }
    if (action==='new') {
      data=M.empty(id()); library.resumes.push(data); library.activeId=data.id; photoRequest++;
      fillForm(); setStep('personal'); changed(); $('#full-name').focus();
      message('Novo currículo criado. Preencha os dados pessoais. Os anteriores continuam no seletor acima.');
    }
  });
  form.addEventListener('submit',event=>{event.preventDefault(); view();});
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='p'){event.preventDefault();pdf();}});
  form.addEventListener('input',event=>{
    if (!event.target.dataset.bind) return;
    bind(event.target.dataset.bind,event.target.value);
    if (event.target.dataset.bind==='personal.name') {syncPhoto(); picker();}
    changed();
  });
  $('#custom-color').addEventListener('input',event=>{data.theme.color=event.target.value;design();changed();});
  $('#resume-picker').addEventListener('change',event=>{
    const selected=library.resumes.find(item=>item.id===event.target.value);
    if (!selected) return;
    data=selected; library.activeId=data.id; photoRequest++; fillForm(); setStep('personal'); changed();
  });
  $('.editor-tabs').addEventListener('keydown',event=>{
    const tab=event.target.closest('[data-step]');
    if (!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const index=steps.indexOf(activeStep);
    const next=event.key==='Home'?0:event.key==='End'?steps.length-1:(index+(event.key==='ArrowRight'?1:-1)+steps.length)%steps.length;
    setStep(steps[next],true);
  });
  $('#photo-file').addEventListener('change',event=>{
    const file=event.target.files?.[0]; event.target.value='';
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024) {message('Escolha uma foto JPG, PNG ou WebP de até 2 MB.',true);return;}
    const request=++photoRequest, resumeId=data.id;
    const reader=new FileReader();
    reader.onload=()=>{
      if (request!==photoRequest||resumeId!==data.id) return;
      const photo=M.photo(reader.result);
      if (!photo) {message('Não foi possível abrir essa imagem. Escolha outra foto.',true);return;}
      data.personal.photo=photo;syncPhoto();changed();
    };
    reader.onerror=()=>message('Não foi possível ler a foto. Escolha outra imagem.',true);
    reader.readAsDataURL(file);
  });
  for (const frame of document.querySelectorAll('.preview-canvas iframe')) frame.addEventListener('load',()=>fit(frame));
  window.addEventListener('resize',()=>{fit($('#resume-preview'));if(dialog.open)fit($('#full-preview'));});
  window.addEventListener('beforeunload',()=>save(false));
  if (typeof ResizeObserver==='function') { const observer=new ResizeObserver(()=>{fit($('#resume-preview'));if(dialog.open)fit($('#full-preview'));}); for(const canvas of document.querySelectorAll('.preview-canvas'))observer.observe(canvas); }
  load(); fillForm(); setStep('personal',false,false); renderPreview();
})();
