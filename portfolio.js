// Interactive Resume for Aadhithyan K A
(function(){
  const debugEl = document.getElementById('resume-debug');
  const xpBar = document.getElementById('xp-bar');
  const xpLabel = document.getElementById('xp-label');
  const grid = document.getElementById('quest-grid');
  const startBtn = document.getElementById('start-quests');
  const resetBtn = document.getElementById('reset-quests');

  if (!grid) return; // only run on portfolio page

  const resume = {
    about: {
      title: 'About Me',
      body: 'Assistant Professor and Co-Founder of Jeeno Studios. 5+ years teaching; 4+ years industry in game dev, VFX, video, 2D/3D animation. Focus on gamification and interactive media. Mentored students building 15+ games.',
    },
    experience: [
      { role: 'Assistant Professor, Game Design', org: 'Presidency University, Bangalore', range: 'Feb 2025 — Present', items: ['Game Design', 'Game Juice', '2D/3D Animation', 'Visual Effects', 'AR/VR'] },
      { role: 'Assistant Professor, Game Design', org: 'Jain University, Bangalore', range: 'Jan 2024 — Feb 2025', items: ['Game Design', 'Game Juice', '2D/3D Animation', 'Visual Effects', 'AR/VR'] },
      { role: 'Assistant Professor, Game Design', org: 'Presidency University, Bangalore', range: 'Jan 2021 — Jan 2024', items: ['Game Design', 'Game Juice', '2D/3D Animation', 'Visual Effects', 'AR/VR'] },
      { role: 'Technical Associate', org: 'VIT Online Learning (VITOL), Vellore', range: 'Aug 2019 — Dec 2021', items: ['Gamification of online courses', 'AR/VR development', '2D/3D animation for learning videos'] },
      { role: 'Co-Founder', org: 'Jeeno Studios', range: 'Jun 2018 — Present', items: ['Game design & development lead', '2D/3D animation', 'Product development', 'Team management'] },
    ],
    education: [
      { degree: 'M.Sc. Game Technology', inst: 'ICAT, Bangalore, Bharathiar University', year: '2017 — 2019', cgpa: '7.52' },
      { degree: 'M.Sc. Visual Communication', inst: 'SRM University, Chennai', year: '2015 — 2017', cgpa: '7.98' },
      { degree: 'B.Sc. Multimedia and Animation', inst: 'VIT University, Vellore', year: '2012 — 2015', cgpa: '9.43' },
    ],
    awards: [
      '1st Rank Holder — GOLD Medal, B.Sc Multimedia and Animation, VIT University',
      'Merit Scholarship, Best Academic Performance (2014–2015), VIT University',
      'Hemalatha Memorial Trust Endowment Award, Best Academic Performance (2014–2015), VIT University',
      'Certificate of Excellence in Game Design (SRM University)',
      'Second Place, College Game Jam ("Alex the cowdog"), ICAT (2019)'
    ],
    projects: [
      { name: 'Flowtrix: System and Economy Designer', url: 'https://aadhithyan.itch.io/flowtrix-system-and-economy-designer' },
      { name: 'PixelStack3D', url: 'https://aadhithyan.itch.io/pixelstack' },
    ],
    skills: [
      'Game Design', 'Game Development', 'AR/VR', 'Game Juice', 'Rigging & Animation', '2D/3D Animation', 'Digital Sculpting', 'Cinematics for Games', 'Team Management', 'Project Management', '3D Printing', 'Unity', 'Unreal', 'Cocos2D', 'Cocos Creator', 'Phaser', 'GameMaker Studio', 'MonoGame (XNA)', 'Nuke', 'After Effects', 'Spine2D', 'Moho', 'Adobe Animate', 'Photoshop', 'Premiere Pro', 'Illustrator', 'Blender', 'Maya', '3DS Max', 'Substance Painter', 'C#', 'C++', 'JavaScript', 'Lua'
    ],
  };

  const sections = [
    { id:'about', title:'About Me', type:'info' },
    { id:'experience', title:'Experience', type:'list' },
    { id:'education', title:'Education', type:'list' },
    { id:'awards', title:'Achievements & Awards', type:'list' },
    { id:'projects', title:'Projects', type:'links' },
    { id:'skills', title:'Skills & Tools', type:'tags' },
  ];

  const state = {
    completed: new Set(JSON.parse(localStorage.getItem('resume.completed') || '[]')),
    xp: Number(localStorage.getItem('resume.xp') || 0),
  };

  function save(){
    localStorage.setItem('resume.completed', JSON.stringify([...state.completed]));
    localStorage.setItem('resume.xp', String(state.xp));
  }

  function setDebug(msg){ if (debugEl) debugEl.textContent = msg || ''; }
  function setXP(x){
    state.xp = Math.max(0, Math.min(100, x));
    if (xpBar) xpBar.style.width = state.xp + '%';
    if (xpLabel) xpLabel.textContent = Math.round(state.xp) + '%';
  }

  function award(sectionId){
    if (!state.completed.has(sectionId)) {
      state.completed.add(sectionId);
      const per = Math.ceil(100 / sections.length);
      setXP(Math.min(100, state.xp + per));
      setDebug(`Quest completed: ${sectionId}. XP +${per}.`);
      save();
      render();
      if (state.completed.size === sections.length) {
        setDebug('Resume Completed! All quests unlocked.');
      }
    } else {
      setDebug(`Already completed: ${sectionId}.`);
    }
  }

  function reset(){
    state.completed.clear();
    setXP(0);
    save();
    render();
    setDebug('Progress reset. Start the adventure!');
  }

  function render(){
    grid.innerHTML = '';
    sections.forEach(sec => {
      const card = document.createElement('div');
      card.className = 'card';
      const h = document.createElement('h3'); h.textContent = sec.title; card.appendChild(h);
      const body = document.createElement('div');
      switch (sec.type) {
        case 'info': {
          body.textContent = resume.about.body;
          break;
        }
        case 'list': {
          const ul = document.createElement('ul'); ul.className = 'features';
          const listData = sec.id === 'experience' ? resume.experience
                         : sec.id === 'education' ? resume.education
                         : resume.awards;
          listData.forEach(item => {
            const li = document.createElement('li');
            if (typeof item === 'string') {
              li.textContent = item;
            } else if (sec.id === 'experience') {
              li.textContent = `${item.role} — ${item.org} (${item.range})`;
            } else if (sec.id === 'education') {
              li.textContent = `${item.degree}, ${item.inst} (${item.year}) · CGPA ${item.cgpa}`;
            }
            ul.appendChild(li);
          });
          body.appendChild(ul);
          break;
        }
        case 'links': {
          resume.projects.forEach(p => {
            const a = document.createElement('a');
            a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
            a.textContent = p.name; a.className = 'btn';
            a.style.marginRight = '0.5rem'; a.style.marginBottom = '0.5rem';
            body.appendChild(a);
          });
          break;
        }
        case 'tags': {
          const wrap = document.createElement('div');
          wrap.style.display = 'flex'; wrap.style.flexWrap = 'wrap'; wrap.style.gap = '0.35rem';
          resume.skills.forEach(s => {
            const tag = document.createElement('span'); tag.textContent = s;
            tag.className = 'btn'; tag.style.fontSize = '0.85rem';
            wrap.appendChild(tag);
          });
          body.appendChild(wrap);
          break;
        }
      }
      card.appendChild(body);
      const actions = document.createElement('div'); actions.className = 'contact-actions';
      const btn = document.createElement('button');
      btn.className = 'btn primary quest-btn';
      btn.textContent = state.completed.has(sec.id) ? 'Completed' : 'Enter Quest';
      btn.setAttribute('aria-disabled', String(state.completed.has(sec.id)));
      btn.addEventListener('click', () => award(sec.id));
      actions.appendChild(btn);
      card.appendChild(actions);
      grid.appendChild(card);
    });
  }

  // Init
  setXP(state.xp);
  render();
  setDebug('Ready. Click Start Adventure or enter any quest.');

  startBtn?.addEventListener('click', () => {
    setDebug('Adventure started. Complete quests to earn XP.');
  });
  resetBtn?.addEventListener('click', reset);

  // Keyboard: press N to complete next incomplete quest
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'n') {
      const next = sections.find(s => !state.completed.has(s.id));
      if (next) award(next.id);
    }
  });
})();