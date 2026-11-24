(() => {
  'use strict';
  const templates = [
    { id: 'principal', name: 'Clássico', description: 'Foto e coluna lateral' },
    { id: 'essencial', name: 'Essencial', description: 'Leve e editorial' },
    { id: 'horizonte', name: 'Horizonte', description: 'Estruturado e profissional' },
    { id: 'lavanda', name: 'Contemporâneo', description: 'Cartões e formas suaves' }
  ];
  const colors = [
    { value: '#142b49', name: 'Azul-marinho' }, { value: '#245b47', name: 'Verde' },
    { value: '#722e43', name: 'Vinho' }, { value: '#343b46', name: 'Grafite' },
    { value: '#684299', name: 'Roxo' }, { value: '#164e63', name: 'Azul-petróleo' }
  ];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  const string = (value, max = 6000) => typeof value === 'string' ? value.slice(0, max) : '';
  const photo = value => typeof value === 'string' && value.length <= 3000000 && /^data:image\/(png|jpeg|webp);base64,[a-z\d+/=\r\n]+$/i.test(value) ? value : '';
  const lines = value => string(value).split(/\r?\n/).map(item => item.trim()).filter(Boolean);
  const initials = name => { const parts = string(name).trim().split(/\s+/).filter(Boolean); return parts.length ? (parts[0][0] + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase() : 'SN'; };
  function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function dateParts(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const [year,month,day] = match.slice(1).map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year,month-1,day);
    if (year<1 || date.getUTCFullYear()!==year || date.getUTCMonth()!==month-1 || date.getUTCDate()!==day) return null;
    return {year,month,day};
  }
  function ageOn(birthDate, reference = today()) {
    const birth = dateParts(birthDate), current = dateParts(reference);
    if (!birth || !current || birthDate>reference) return null;
    const beforeBirthday = current.month<birth.month || (current.month===birth.month && current.day<birth.day);
    return current.year-birth.year-(beforeBirthday?1:0);
  }
  function formatBirthDate(value) {
    return dateParts(value) ? value.split('-').reverse().join('/') : '';
  }
  function empty(id) {
    return { version: 2, id, personal: { name:'', birthDate:'', role:'', email:'', phone:'', city:'', summary:'', photo:'' }, experience:[], education:[], courses:[], technical:[], languages:[], personalSkillsText:'', theme:{ template:'principal', color:'#142b49' } };
  }
  function normalize(raw, id) {
    const result = empty(string(raw?.id, 100) || id);
    for (const key of Object.keys(result.personal)) result.personal[key] = key === 'photo' ? photo(raw?.personal?.photo) : string(raw?.personal?.[key]);
    result.personal.name = result.personal.name.slice(0,120);
    result.personal.role = result.personal.role.slice(0,150);
    const schemas = { experience:['role','company','period','activities'], education:['course','institution','status','period','details'], courses:['name','institution','duration','status'], technical:['name','level'], languages:['name','level'] };
    for (const [group, keys] of Object.entries(schemas)) {
      if (Array.isArray(raw?.[group])) result[group] = raw[group].map(item => Object.fromEntries(keys.map(key => [key,string(item?.[key])])));
    }
    result.personalSkillsText = string(raw?.personalSkillsText);
    if (templates.some(template => template.id === raw?.theme?.template)) result.theme.template = raw.theme.template;
    if (/^#[a-f\d]{6}$/i.test(raw?.theme?.color)) result.theme.color = raw.theme.color;
    return result;
  }
  function mix(hex, other, amount) {
    const a = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value,16));
    const b = other.match(/[a-f\d]{2}/gi).map(value => parseInt(value,16));
    return '#' + a.map((value,index) => Math.round(value * (1-amount) + b[index]*amount).toString(16).padStart(2,'0')).join('');
  }
  function themeStyles(data) {
    const color = data.theme.color;
    const rgb = color.slice(1).match(/../g).map(value => parseInt(value,16)/255);
    const light = rgb[0]*.2126 + rgb[1]*.7152 + rgb[2]*.0722 > .57;
    const ink = light ? mix(color, '#142b49', .82) : color;
    const on = light ? '#142b49' : '#ffffff';
    const secondary = mix(color, on, .8);
    const soft = mix(color,'#ffffff',.93);
    let css = `:root{--resume-color:${color};--resume-on:${on};--navy:${ink};--sidebar:${color};--blue:${ink};--ink:#263346;--accent:${ink};--soft:${soft};--canvas:#edf0f4;}body{border-inline:0;}h1,h2,h3{overflow-wrap:anywhere}.monogram{overflow:hidden}.monogram img{width:100%;height:100%;object-fit:cover}.empty-note{font-size:12px;line-height:1.7;color:#7d8a9b}.sidebar .empty-note{color:inherit}.resume-footer{display:none}.resume-photo[hidden],[hidden]{display:none!important}`;
    if (data.theme.template === 'principal') css += `.page-width:not(.topbar){grid-template-rows:auto 1fr auto}.hero-content,.hero-identity{min-height:250px}.sidebar h2,.sidebar strong,.contact-value{color:${on}}.sidebar p,.field-label,.objective-note,.level,.language-list li>span:last-child{color:${secondary}}.sidebar h2{border-color:${mix(color,on,.65)}}.technical-list li{border-color:${mix(color,on,.25)}}.skill-tags li::before{color:${secondary}}.portrait{background:${soft}}@media print{.hero-content,.hero-identity{min-height:61mm}}`;
    if (data.theme.template === 'horizonte') css += `.identity,.sidebar{background:${color};color:${on}}.identity h1,.sidebar h2{color:${on}}.identity .role,.identity .intro,.identity .location,.sidebar .contacts .label,.sidebar .level,.sidebar .kicker,.identity .eyebrow{color:${secondary}}.sidebar .tags li{background:${mix(color,on,.08)};border-color:${mix(color,on,.3)}}.sidebar{--line:${mix(color,on,.24)}}.monogram{border-color:${secondary};color:${on}}`;
    if (data.theme.template === 'essencial') css += `.monogram{border-color:${ink};color:${ink}}.statement{border-color:${ink}}.identity h1,.trajectory h2,.sidebar h2{color:${ink}}.identity,.trajectory>section+section{border-color:${mix(color,'#ffffff',.7)}}`;
    if (data.theme.template === 'lavanda') css += `.identity{background:${mix(color,'#ffffff',.88)};border-color:${mix(color,'#ffffff',.7)}}.identity::after{border-color:${mix(color,'#ffffff',.5)};box-shadow:0 0 0 32px ${mix(color,'#ffffff',.88)},0 0 0 33px ${mix(color,'#ffffff',.6)},0 0 0 65px ${mix(color,'#ffffff',.88)},0 0 0 66px ${mix(color,'#ffffff',.7)}}.eyebrow,.sidebar .kicker{color:${ink}}.intro,.draft{color:#5f6e80}.monogram{background:${color};color:${on}}.tags li{background:${soft}}`;
    return css;
  }
  function stripPrint(css) {
    css = css.replace(/@page\s*\{[^}]*\}/g,'');
    let match;
    while ((match = /@media\s+print\s*\{/.exec(css))) {
      let end = match.index + match[0].length, depth = 1;
      while (end < css.length && depth) { if (css[end] === '{') depth++; else if (css[end] === '}') depth--; end++; }
      css = css.slice(0,match.index) + css.slice(end);
    }
    return css;
  }
  function printLayout(css) {
    let result = '', match;
    const media = /@media\s+print\s*\{/g;
    while ((match = media.exec(css))) {
      const start = media.lastIndex;
      let end = start, depth = 1;
      while (end < css.length && depth) { if (css[end] === '{') depth++; else if (css[end] === '}') depth--; end++; }
      result += css.slice(start,end-1);
      media.lastIndex = end;
    }
    return result;
  }
  function fitPage(doc) {
    const sheet = doc.querySelector('.resume-sheet'), content = doc.querySelector('.resume-content');
    if (!sheet || !content || !sheet.clientHeight || !content.offsetHeight) return 1;
    const style = doc.documentElement.style;
    const bounds = sheet.getBoundingClientRect();
    const height = bounds.height-2;
    const setScale = scale => style.setProperty('--resume-scale',String(scale));
    doc.documentElement.classList.remove('resume-compact');
    style.setProperty('--resume-min-height','0px');
    setScale(1);
    const fits = () => {
      const rect = content.getBoundingClientRect();
      return rect.height<=height && rect.width<=bounds.width+1;
    };
    let scale = 1;
    if (!fits()) doc.documentElement.classList.add('resume-compact');
    if (!fits()) {
      // A largura se expande antes da redução, fazendo o texto ocupar toda a folha.
      // Busca a maior escala que comporte o conteúdo, sem eliminar informações.
      let low = 0, high = 1;
      for (let step=0;step<16;step++) {
        const middle = (low+high)/2;
        setScale(middle);
        if (fits()) low=middle; else high=middle;
      }
      scale = low || 1/65536;
      setScale(scale);
    }
    style.setProperty('--resume-min-height',`${height/scale}px`);
    return scale;
  }
  function printStyles(template) {
    if (template === 'principal') return '';
    // Sem margens da folha, o navegador não acrescenta data, título, URL ou paginação.
    // O próprio currículo mantém o espaço interno da folha.
    let css = `@page{size:A4;margin:0}@media print{html,body{margin:0;padding:0;background:white;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-size:9pt}.resume{display:grid;width:100%;max-width:none;margin:0;padding:10mm;box-decoration-break:clone;-webkit-box-decoration-break:clone;border:0;border-radius:0;box-shadow:none;overflow:visible}.identity{padding:7mm!important}.identity h1{font-size:27pt!important}.sidebar{display:block!important;padding:6mm!important}.sidebar section+section{margin-top:6mm}.trajectory{padding:7mm!important}.trajectory>section+section{margin-top:6mm;padding-top:4mm}.heading h2,.sidebar h2{font-size:12pt}.trajectory h3{font-size:10pt}.trajectory p,.contacts .value,.skills li,.languages li,.tags li{font-size:8pt}.heading{margin-bottom:3mm;padding-bottom:2mm}.monogram{width:22mm;height:22mm;font-size:21pt;top:10mm;right:8mm}.identity .role,.identity .location{margin-top:2mm}.sidebar section,.trajectory>section,.education,.experience,.course{break-inside:avoid}.resume-footer{display:none}`;
    if (template === 'horizonte') css += `.resume{grid-template-columns:62mm minmax(0,1fr)}.identity h1{font-size:23pt!important}.identity{padding-bottom:4mm!important}.sidebar{padding-top:0!important}.monogram{position:static;width:16mm;height:16mm;font-size:14pt;margin-bottom:5mm}`;
    if (template === 'essencial') css += `.resume{grid-template-columns:60mm minmax(0,1fr)}.identity h1{max-width:calc(100% - 28mm)}.sidebar{background:#f9faf7}.trajectory>section+section{border-top:1px solid #dce2da}`;
    if (template === 'lavanda') css += `.resume{grid-template-columns:minmax(0,1fr) 59mm;gap:0 4mm}.identity{margin-bottom:5mm;border-radius:3mm}.identity h1{max-width:72%}.monogram{position:absolute;width:23mm;height:28mm;top:50%;right:8mm}.trajectory{padding:0!important}.trajectory>section{padding:5mm;border-radius:2mm}.sidebar{padding:0!important}.sidebar section{padding:4mm;border-radius:2mm}.sidebar section+section{margin-top:4mm}`;
    return css + '}';
  }
  function build(raw, draft = true) {
    const data = normalize(raw, 'curriculo');
    const classic = data.theme.template === 'principal';
    const p = data.personal;
    const value = (text, fallback = '') => escape(text || (draft ? fallback : ''));
    const section = (id, title, content, extra = '') => `<section class="${classic?'card':'section'} ${extra}" id="${id}" aria-labelledby="title-${id}"><div class="${classic?'section-heading':'heading'}"><h2 id="title-${id}">${title}</h2></div>${content}</section>`;
    const contentSection = (id,title,items,fallback,extra) => items || draft ? section(id,title,items || `<p class="empty-note">${fallback}</p>`,extra) : '';
    const contacts = [];
    const age = ageOn(p.birthDate);
    if (age!==null) {
      contacts.push(`<li><div><span class="field-label label">Data de nascimento</span><span class="contact-value value">${formatBirthDate(p.birthDate)}</span></div></li>`);
      contacts.push(`<li><div><span class="field-label label">Idade</span><span class="contact-value value">${age} ${age===1?'ano':'anos'}</span></div></li>`);
    }
    if (p.email) contacts.push(`<li><div><span class="field-label label">E-mail</span><a class="contact-value value" href="mailto:${escape(p.email)}">${escape(p.email)}</a></div></li>`);
    if (p.phone) { let phone = p.phone.replace(/\D/g,''); if (phone.length===10||phone.length===11) phone='55'+phone; contacts.push(`<li><div><span class="field-label label">WhatsApp</span><a class="contact-value value whatsapp-link" href="https://wa.me/${phone}" target="_blank" rel="noopener noreferrer">${escape(p.phone)}</a></div></li>`); }
    if (p.city) contacts.push(`<li><div><span class="field-label label">Localização</span><span class="contact-value value">${escape(p.city)}</span></div></li>`);
    const contactSection = contentSection('contato',age!==null?'Dados pessoais':'Contato',contacts.length?`<ul class="contact-list contacts">${contacts.join('')}</ul>`:'','Seus contatos aparecerão aqui.','contact-card');
    const about = contentSection('sobre','Perfil profissional',p.summary?`<p>${escape(p.summary).replace(/\n/g,'<br>')}</p>`:'','Seu resumo profissional aparecerá aqui.','objective-card');
    const technical = data.technical.filter(item=>item.name.trim()).map(item=>`<li><span>${escape(item.name)}</span><span class="level">${escape(item.level)}</span></li>`).join('');
    const techSection = contentSection('habilidades','Habilidades técnicas',technical?`<ul class="technical-list skills">${technical}</ul>`:'','Inclua suas habilidades no formulário.');
    const personal = lines(data.personalSkillsText).map(item=>`<li>${escape(item)}</li>`).join('');
    const personalSection = personal ? section('pessoais','Habilidades pessoais',`<ul class="skill-tags tags">${personal}</ul>`) : '';
    const languages = data.languages.filter(item=>item.name.trim()).map(item=>`<li><span>${escape(item.name)}</span><span class="level">${escape(item.level)}</span></li>`).join('');
    const languageSection = languages ? section('idiomas','Idiomas',`<ul class="language-list languages">${languages}</ul>`) : '';
    const experience = data.experience.filter(item=>[item.role,item.company,item.period,item.activities].some(text=>text.trim())).map(item=>`<article class="experience first-opportunity veterinary-experience"><div><h3>${value(item.role,'Cargo ou função')}</h3>${item.company||item.period?`<p class="experience-meta">${[item.company,item.period].filter(Boolean).map(escape).join(' · ')}</p>`:''}${lines(item.activities).length?`<ul class="experience-tasks">${lines(item.activities).map(activity=>`<li>${escape(activity)}</li>`).join('')}</ul>`:''}</div></article>`).join('');
    const experienceSection = contentSection('experiencia','Experiência profissional',experience,'As experiências que você adicionar aparecerão aqui.');
    const education = data.education.filter(item=>[item.course,item.institution,item.period,item.details].some(text=>text.trim())).map(item=>`<article class="education-entry education"><div class="entry-heading entry-title"><h3>${value(item.course,'Curso ou formação')}</h3>${item.status?`<span class="badge">${escape(item.status)}</span>`:''}</div>${item.institution?`<p class="institution">${escape(item.institution)}</p>`:''}${item.period||item.details?`<p class="entry-detail details">${[item.period,item.details].filter(Boolean).map(escape).join(' · ')}</p>`:''}</article>`).join('');
    const educationSection = contentSection('formacao','Formação acadêmica',education,'Informe o curso, a instituição e a situação da sua formação.');
    const courses = data.courses.filter(item=>[item.name,item.institution,item.duration].some(text=>text.trim())).map(item=>`<article class="course-entry course"><div class="course-info"><h3>${value(item.name,'Nome do curso')}</h3>${item.institution||item.duration?`<p>${[item.institution,item.duration].filter(Boolean).map(escape).join(' · ')}</p>`:''}${item.status?`<span class="course-status badge">${escape(item.status)}</span>`:''}</div></article>`).join('');
    const coursesSection = courses ? section('cursos','Cursos e qualificações',courses,'courses-card') : '';
    const avatar = p.photo ? `<img class="resume-photo" src="${p.photo}" alt="Foto de ${escape(p.name)}">` : `<div class="initials">${initials(p.name)}</div>`;
    const monogram = p.photo ? `<img src="${p.photo}" alt="">` : initials(p.name);
    const header = classic ? `<header class="hero"><div class="hero-content"><h1>${value(p.name,'Seu nome completo')}</h1>${p.role||draft?`<p class="hero-role">${value(p.role,'Seu cargo ou área de atuação')}</p>`:''}</div><div class="hero-identity"><div class="photo-editor"><div class="portrait">${avatar}</div></div></div></header>` : `<header class="identity"><div class="monogram" aria-hidden="true">${monogram}</div><h1>${value(p.name,'Seu nome completo')}</h1>${p.role||draft?`<p class="role">${value(p.role,'Seu cargo ou área de atuação')}</p>`:''}${p.city?`<p class="location">${escape(p.city)}</p>`:''}</header>`;
    const sidebar = `<aside class="sidebar" aria-label="Perfil e competências">${contactSection}${classic?about:''}${techSection}${personalSection}${languageSection}</aside>`;
    const main = `<main class="${classic?'main-content':'trajectory'}">${classic?'':about}${experienceSection}${educationSection}${coursesSection}</main>`;
    const body = classic ? `<div class="page-width">${header}<div class="content-layout">${sidebar}${main}</div></div>` : `<div class="resume">${header}${sidebar}${main}</div>`;
    let css = window.ResumeExportStyles?.[data.theme.template] || '';
    if (!classic) css = stripPrint(css);
    css += themeStyles(data) + printStyles(data.theme.template) + `.experience+.experience{margin-top:24px}.education+.education{margin-top:23px}.sidebar .section-heading{display:block;margin-bottom:18px;padding:0;border:0}.sidebar .objective-card .section-heading{display:none}.monogram .initials{font:inherit;letter-spacing:inherit}.resume .sidebar h2{margin-bottom:8px}`;
    // A prévia usa as mesmas medidas e a mesma tipografia da impressão.
    css += `@media all{${printLayout(classic ? window.ResumeExportStyles.principal : printStyles(data.theme.template))}}`;
    if (classic) css += '.hero-content,.hero-identity{min-height:61mm}';
    const columns = { essencial:'minmax(0,60fr) minmax(0,130fr)', horizonte:'minmax(0,62fr) minmax(0,128fr)', lavanda:'minmax(0,127fr) minmax(0,59fr)' };
    css += `html,body{margin:0;padding:0;min-height:0;border:0;background:white}body{width:100%}.resume-sheet{position:relative;width:210mm;height:296.8mm;margin:0 auto;overflow:hidden;background:white}.resume-content{position:absolute;top:0;left:50%;width:calc(210mm / var(--resume-scale,1));transform:translateX(-50%) scale(var(--resume-scale,1));transform-origin:top center;overflow-wrap:anywhere}.resume-content>.page-width{width:100%;min-height:var(--resume-min-height,0px);grid-template-columns:minmax(0,70fr) minmax(0,140fr)}.resume-content>.resume{width:100%;grid-template-columns:${columns[data.theme.template]||'1fr 1fr'};box-decoration-break:slice;-webkit-box-decoration-break:slice}.resume-compact .experience+.experience{margin-top:12px}.resume-compact .experience-tasks{margin-top:2mm;line-height:1.45}.resume-compact .experience-tasks li+li{margin-top:1mm}.resume-compact .experience h3{margin-bottom:1mm}.resume-compact .experience-meta{margin-top:1mm;line-height:1.4}.resume-compact .trajectory>section+section{margin-top:3mm}.resume-compact .main-content>.card+.card{margin-top:4mm}@media print{html,body{width:210mm;height:296.8mm;overflow:hidden}.resume-sheet{margin:0;break-inside:avoid;page-break-inside:avoid}.resume-content{break-inside:avoid;page-break-inside:avoid}}`;
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="${data.theme.color}"><title>${escape(p.name||'Seu currículo')} | Currículo</title><style>${css}</style></head><body><div class="resume-sheet"><div class="resume-content">${body}</div></div></body></html>`;
  }
  window.CurriculoTemplates = Object.freeze({ templates, colors, empty, normalize, build, fitPage, initials, photo, escape, today, ageOn, formatBirthDate });
})();
