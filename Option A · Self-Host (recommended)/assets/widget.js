/* ============================================================
   COMMAND PANEL — engine v2
   Modes:        rotating | grid | scroll | compact
   Modules:      TwitchChat · Scheduler · CategoryRotator
                 SoundEngine · Hotkeys · PeekRenderer
   Reads cfg via window.CMD_CONFIG or URL params
   ============================================================ */

(function () {
  'use strict';

  const ICONS = window.CMD_ICONS || {};

  /* ============================================================
     DEFAULTS
     ============================================================ */
  const DEFAULTS = {
    theme: 'pastel-dream',
    mode: 'rotating',
    rotationMs: 4500,
    panelLabel: 'Chat Commands',
    showProgress: true,
    showPictogram: true,
    pinned: null,
    highlightFrequent: true,
    categoryFilter: null,
    commands: [
      { name: 'points',  desc: 'Check how many cozy points you have right now.', icon: 'coin',     category: 'Points', uses: 184 },
      { name: 'rules',   desc: 'Read the chat rules and keep the vibes friendly.', icon: 'bookmark', category: 'Info',   uses: 42 },
      { name: 'song',    desc: 'See what is currently playing in the playlist.',   icon: 'music',    category: 'Music',  uses: 67 },
      { name: 'lurk',    desc: 'Stay in chat quietly, you still count as a soul.', icon: 'moon',     category: 'Fun',    uses: 230 },
      { name: 'hug',     desc: 'Send a warm hug to another viewer in chat.',       icon: 'heart',    category: 'Fun',    uses: 312 },
      { name: 'roll',    desc: 'Roll a dice and see if luck is on your side.',     icon: 'dice',     category: 'Games',  uses: 95 },
      { name: 'redeem',  desc: 'Spend points on perks, pets, and tiny rewards.',   icon: 'gift',     category: 'Points', uses: 58 },
      { name: 'uptime',  desc: 'How long has the stream been live for today?',     icon: 'clock',    category: 'Info',   uses: 39 },
      { name: 'goal',    desc: 'See the current sub goal and what unlocks next.',  icon: 'flag',     category: 'Info',   uses: 26 },
      { name: 'discord', desc: 'Join the cozy Discord and stay in the loop.',      icon: 'chat',     category: 'Info',   uses: 71 }
    ],
    /* ---- v2 features ---- */
    chat: {
      enabled: false,
      channel: '',
      sortByLiveUsage: false,
      pulseOnUse: true
    },
    schedule: {
      enabled: false,
      intervalSec: 180,    // how often to show
      visibleSec: 15,      // how long it stays visible
      fadeMs: 700
    },
    categoryRotation: {
      enabled: false,
      showBanner: true,
      order: null          // null = use category order found in commands
    },
    sound: {
      enabled: false,
      volume: 0.18
    },
    peek: {
      enabled: false,
      count: 1             // 1 or 2 upcoming cards visible
    },
    commandOfDay: null,    // command name (no !) — appears more often & gets a "today" tag
    hotkeys: {
      enabled: true,
      toggle: 'h',
      next: ' ',
      prev: 'b',
      reload: 'r'
    }
  };

  /* ============================================================
     URL PARAMS
     ============================================================ */
  function readUrlConfig() {
    const p = new URLSearchParams(window.location.search);
    const out = {};
    if (p.get('theme'))    out.theme = p.get('theme');
    if (p.get('mode'))     out.mode  = p.get('mode');
    if (p.get('rotation')) out.rotationMs = parseInt(p.get('rotation'), 10) * 1000;
    if (p.get('label'))    out.panelLabel = p.get('label');
    if (p.get('pinned'))   out.pinned = p.get('pinned').replace(/^!/, '');
    if (p.get('category')) out.categoryFilter = p.get('category');
    /* v2 */
    if (p.get('chat'))     out.chat = Object.assign({}, DEFAULTS.chat, { enabled: p.get('chat') === '1', channel: p.get('channel') || '', sortByLiveUsage: p.get('sortlive') === '1' });
    if (p.get('schedule')) out.schedule = Object.assign({}, DEFAULTS.schedule, { enabled: p.get('schedule') === '1', intervalSec: parseInt(p.get('every'), 10) || 180, visibleSec: parseInt(p.get('show'), 10) || 15 });
    if (p.get('catrot'))   out.categoryRotation = Object.assign({}, DEFAULTS.categoryRotation, { enabled: p.get('catrot') === '1' });
    if (p.get('sound'))    out.sound = Object.assign({}, DEFAULTS.sound, { enabled: p.get('sound') === '1', volume: parseFloat(p.get('vol')) || 0.18 });
    if (p.get('peek'))     out.peek = Object.assign({}, DEFAULTS.peek, { enabled: p.get('peek') === '1' });
    if (p.get('cotd'))     out.commandOfDay = p.get('cotd').replace(/^!/, '');
    return out;
  }

  /* ============================================================
     SOUND ENGINE — Web Audio, no external assets
     ============================================================ */
  let audioCtx = null;
  function getCtx() {
    if (audioCtx) return audioCtx;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { audioCtx = new C(); } catch (e) { return null; }
    return audioCtx;
  }
  function playChime(volume) {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [880.0, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(volume * 0.32, now + i * 0.06 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.55);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.6);
    });
  }
  function playPulse(volume) {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  /* ============================================================
     TWITCH CHAT — anonymous IRC over WebSocket
     ============================================================ */
  function createChatClient(channel, onCommand, onStatus) {
    if (!channel) return null;
    let ws, dead = false, reconnectMs = 2000;

    function connect() {
      try {
        ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
      } catch (e) { onStatus && onStatus('error'); return; }
      ws.onopen = () => {
        const nick = 'justinfan' + Math.floor(Math.random() * 90000 + 10000);
        ws.send('CAP REQ :twitch.tv/tags');
        ws.send('NICK ' + nick);
        ws.send('JOIN #' + channel.toLowerCase());
        onStatus && onStatus('connected');
        reconnectMs = 2000;
      };
      ws.onmessage = (e) => {
        const lines = e.data.split('\r\n');
        for (const line of lines) {
          if (!line) continue;
          if (line.startsWith('PING')) { ws.send('PONG :tmi.twitch.tv'); continue; }
          const m = line.match(/PRIVMSG #\S+ :(.*)$/);
          if (m) {
            const text = m[1].trim();
            const cmdMatch = text.match(/^!(\w+)/);
            if (cmdMatch) onCommand(cmdMatch[1].toLowerCase());
          }
        }
      };
      ws.onerror = () => onStatus && onStatus('error');
      ws.onclose = () => {
        onStatus && onStatus('disconnected');
        if (!dead) setTimeout(connect, reconnectMs = Math.min(reconnectMs * 1.5, 30000));
      };
    }
    connect();
    return { close: () => { dead = true; try { ws.close(); } catch (e) {} } };
  }

  /* ============================================================
     CATEGORY ROTATION — groups commands and walks through them
     ============================================================ */
  function buildCategoryGroups(cmds, order) {
    const groups = {};
    cmds.forEach(c => {
      const k = c.category || 'Other';
      (groups[k] = groups[k] || []).push(c);
    });
    let keys;
    if (order && order.length) {
      keys = order.filter(k => groups[k]);
      Object.keys(groups).forEach(k => { if (keys.indexOf(k) === -1) keys.push(k); });
    } else {
      keys = Object.keys(groups);
    }
    return { keys, groups };
  }

  /* ============================================================
     CARD CREATION
     ============================================================ */
  function categoryClass(category) {
    return 'cat-' + (category || 'other').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Sanitize a command name to a safe identifier (alphanumeric + underscore)
  // so it can safely be used as a CSS attribute value / selector.
  function safeKey(s) { return String(s == null ? '' : s).replace(/[^a-zA-Z0-9_-]/g, ''); }

  /* ------------------------------------------------------------
     makePulser — shared pulse handler with timer-coalescing +
     audio throttling. Used by all four mode renderers so that
     chat-spam (e.g. 100× !points in a second) doesn't leak
     setTimeouts or fire 100 audio events.
     ------------------------------------------------------------ */
  function makePulser(scopeEl, cfg, ctx, opts) {
    opts = opts || {};
    const pulseTimers = new Map();      // safeKey → pending remove timer
    let lastSoundAt = 0;
    const SOUND_THROTTLE_MS = 250;
    const PULSE_DURATION_MS = 1400;

    // ensure timers are cleaned up on widget destroy
    ctx.cleanup.push(() => { pulseTimers.forEach(id => clearTimeout(id)); pulseTimers.clear(); });

    return function pulse(cmdName) {
      const key = safeKey(cmdName);
      // .querySelectorAll for scroll mode (duplicated cards), .querySelector elsewhere
      const targets = opts.multi
        ? scopeEl.querySelectorAll(`.cmd-card[data-cmd="${key}"]`)
        : (() => { const c = scopeEl.querySelector(`.cmd-card[data-cmd="${key}"]`); return c ? [c] : []; })();
      if (!targets.length) return false;

      targets.forEach(card => {
        card.classList.remove('is-pulsed');
        void card.offsetWidth;
        card.classList.add('is-pulsed');
      });

      const prev = pulseTimers.get(key);
      if (prev) clearTimeout(prev);
      pulseTimers.set(key, setTimeout(() => {
        targets.forEach(card => card.classList.remove('is-pulsed'));
        pulseTimers.delete(key);
      }, PULSE_DURATION_MS));

      // audio throttle: at most one play per SOUND_THROTTLE_MS window
      if (cfg.sound && cfg.sound.enabled && ctx.userInteracted) {
        const now = performance.now();
        if (now - lastSoundAt > SOUND_THROTTLE_MS) {
          playPulse(cfg.sound.volume);
          lastSoundAt = now;
        }
      }
      return true;
    };
  }

  function createCard(cmd, opts) {
    opts = opts || {};
    const card = document.createElement('article');
    card.className = 'cmd-card ' + categoryClass(cmd.category);
    card.dataset.cmd = safeKey(cmd.name);
    if (opts.highlight) card.classList.add('is-highlight');
    if (cmd.pinned) card.dataset.pinned = 'true';
    if (opts.isCotd) card.dataset.cotd = 'true';

    const safeName = escapeHtml(cmd.name);
    const safeDesc = escapeHtml(cmd.desc);
    const safeCategory = escapeHtml(cmd.category);
    const safeUses = (typeof cmd.uses === 'number' && opts.showUses) ? cmd.uses : null;

    const ribbon = cmd.category ? `<span class="ribbon">${safeCategory}</span>` : '';
    const cotdTag = opts.isCotd ? `<span class="cotd-tag">Today's pick</span>` : '';
    const usesTag = (safeUses !== null) ? `<span class="uses-tag" title="Times used">×${safeUses}</span>` : '';
    const pict = (opts.showPictogram !== false && cmd.icon && ICONS[cmd.icon])
      ? `<div class="pictogram" aria-hidden="true">${ICONS[cmd.icon]}</div>` : '';
    const pin = `<div class="pin" aria-hidden="true">${ICONS.pin || ''}</div>`;

    let progress = '';
    if (opts.showProgress) {
      const C = 2 * Math.PI * 15;
      progress = `
        <span class="progress-label">next</span>
        <svg class="progress" viewBox="0 0 36 36" aria-hidden="true">
          <circle class="track" cx="18" cy="18" r="15"/>
          <circle class="fill"  cx="18" cy="18" r="15" stroke-dasharray="${C}" stroke-dashoffset="${C}"/>
        </svg>`;
    }

    card.innerHTML = `
      ${ribbon}${cotdTag}${usesTag}${pin}
      <div class="body">
        <div class="name"><span class="bang">!</span>${safeName}</div>
        <div class="desc">${safeDesc}</div>
      </div>
      ${pict}
      ${progress}
    `;
    return card;
  }

  function filterCommands(list, cfg) {
    let out = list.slice();
    if (cfg.categoryFilter) {
      out = out.filter(c => (c.category || '').toLowerCase() === cfg.categoryFilter.toLowerCase());
    }
    if (cfg.pinned) {
      out.forEach(c => c.pinned = c.name === cfg.pinned);
      out.sort((a, b) => (b.pinned === true) - (a.pinned === true));
    }
    if (cfg.chat && cfg.chat.sortByLiveUsage) {
      out.sort((a, b) => (b.uses || 0) - (a.uses || 0));
    }
    return out;
  }

  function findFrequent(list) {
    if (!list.length) return null;
    const max = Math.max.apply(null, list.map(c => c.uses || 0));
    return list.find(c => (c.uses || 0) === max);
  }

  /* ============================================================
     RENDERERS — per mode
     ============================================================ */

  function renderRotating(root, cfg, ctx) {
    const cmds = filterCommands(cfg.commands, cfg);
    if (!cmds.length) return;

    let order = cmds.slice();
    let categoryKeys = null, categoryGroups = null, currentCategoryIdx = 0;
    if (cfg.categoryRotation && cfg.categoryRotation.enabled) {
      const grouped = buildCategoryGroups(cmds, cfg.categoryRotation.order);
      categoryKeys = grouped.keys;
      categoryGroups = grouped.groups;
      order = categoryKeys.reduce((a, k) => a.concat(categoryGroups[k]), []);
    }

    // Boost command-of-day frequency: insert it at every other slot
    if (cfg.commandOfDay) {
      const cotd = order.find(c => c.name === cfg.commandOfDay);
      if (cotd) {
        const boosted = [];
        order.forEach((c, i) => { boosted.push(c); if (i % 2 === 1) boosted.push(cotd); });
        order = boosted;
      }
    }

    root.innerHTML = `
      <div class="panel">
        <div class="panel-bar">
          <span class="label">${escapeHtml(cfg.panelLabel)}</span>
          <span class="total">01 / ${String(cmds.length).padStart(2,'0')}</span>
        </div>
        <div class="category-banner" aria-hidden="true"></div>
        <div class="stack"></div>
        ${cfg.peek && cfg.peek.enabled ? `<div class="peek-row" aria-hidden="true"></div>` : ''}
        <div class="dots"></div>
      </div>`;

    const stack = root.querySelector('.stack');
    const dotsEl = root.querySelector('.dots');
    const totalEl = root.querySelector('.total');
    const banner = root.querySelector('.category-banner');
    const peekRow = root.querySelector('.peek-row');

    order.forEach(cmd => {
      const card = createCard(cmd, {
        showPictogram: cfg.showPictogram,
        showProgress: cfg.showProgress,
        isCotd: cfg.commandOfDay && cmd.name === cfg.commandOfDay,
        showUses: false
      });
      stack.appendChild(card);
    });
    cmds.forEach(() => {
      const d = document.createElement('span');
      d.className = 'dot';
      dotsEl.appendChild(d);
    });

    const cards = stack.querySelectorAll('.cmd-card');
    const dots  = dotsEl.querySelectorAll('.dot');
    let idx = 0, lastCategory = null;

    function setActive(n) {
      const cmd = order[n];
      cards.forEach((c, i) => {
        c.classList.toggle('is-active', i === n);
        if (i !== n) c.classList.remove('is-leaving');
      });
      dots.forEach((d, i) => d.classList.toggle('is-active', i === (n % cmds.length)));
      totalEl.textContent = `${String((n % cmds.length) + 1).padStart(2,'0')} / ${String(cmds.length).padStart(2,'0')}`;

      // category banner
      if (cfg.categoryRotation && cfg.categoryRotation.enabled && cfg.categoryRotation.showBanner && banner) {
        if (cmd.category && cmd.category !== lastCategory) {
          banner.textContent = cmd.category + ' commands';
          banner.dataset.cat = categoryClass(cmd.category);
          banner.classList.remove('is-on');
          void banner.offsetWidth;
          banner.classList.add('is-on');
          lastCategory = cmd.category;
        }
      }

      // progress arc
      if (cfg.showProgress) {
        const fill = cards[n].querySelector('.progress .fill');
        if (fill) {
          const C = 2 * Math.PI * 15;
          fill.style.transition = 'none';
          fill.setAttribute('stroke-dashoffset', C);
          void fill.getBoundingClientRect();
          fill.style.transition = `stroke-dashoffset ${cfg.rotationMs}ms linear`;
          fill.setAttribute('stroke-dashoffset', 0);
        }
      }

      // peek
      if (peekRow && cfg.peek && cfg.peek.enabled) {
        peekRow.innerHTML = '';
        for (let k = 1; k <= cfg.peek.count; k++) {
          const next = order[(n + k) % order.length];
          if (!next) continue;
          const ic = (next.icon && ICONS[next.icon]) ? ICONS[next.icon] : '';
          const chip = document.createElement('span');
          chip.className = 'peek-chip';
          chip.innerHTML = `<i class="ic">${ic}</i><span class="t"><b>!${escapeHtml(next.name)}</b><em>${escapeHtml((next.desc || '').slice(0,52))}</em></span>`;
          peekRow.appendChild(chip);
        }
      }

      // sound on rotation
      if (cfg.sound && cfg.sound.enabled && ctx.userInteracted) {
        playChime(cfg.sound.volume);
      }
    }

    setActive(0);
    if (root._timer) clearInterval(root._timer);
    root._timer = setInterval(() => {
      cards[idx].classList.add('is-leaving');
      idx = (idx + 1) % order.length;
      setActive(idx);
    }, cfg.rotationMs);

    // Hooks for hotkeys/chat
    ctx.api = ctx.api || {};
    ctx.api.next = () => { cards[idx].classList.add('is-leaving'); idx = (idx + 1) % order.length; setActive(idx); };
    ctx.api.prev = () => { cards[idx].classList.add('is-leaving'); idx = (idx - 1 + order.length) % order.length; setActive(idx); };
    ctx.api.pulse = makePulser(stack, cfg, ctx);
    ctx.api.totalCards = order.length;
  }

  function renderGrid(root, cfg, ctx) {
    const cmds = filterCommands(cfg.commands, cfg);
    const visible = cmds.slice(0, 6);
    const top = cfg.highlightFrequent ? findFrequent(visible) : null;

    root.innerHTML = `
      <div class="panel">
        <div class="panel-bar">
          <span class="label">${escapeHtml(cfg.panelLabel)}</span>
          <span class="total">${String(visible.length).padStart(2,'0')} commands</span>
        </div>
        <div class="grid"></div>
      </div>`;

    const grid = root.querySelector('.grid');
    visible.forEach((cmd, i) => {
      const card = createCard(cmd, {
        showPictogram: false,
        showProgress: false,
        showUses: cfg.chat && cfg.chat.sortByLiveUsage,
        isCotd: cfg.commandOfDay && cmd.name === cfg.commandOfDay,
        highlight: top && cmd.name === top.name && cfg.highlightFrequent
      });
      card.style.setProperty('--i', i);
      grid.appendChild(card);
    });
    if (root._timer) { clearInterval(root._timer); root._timer = null; }

    ctx.api = ctx.api || {};
    ctx.api.pulse = makePulser(grid, cfg, ctx);
  }

  function renderScroll(root, cfg, ctx) {
    const cmds = filterCommands(cfg.commands, cfg);
    const dur = Math.max(20, cmds.length * 4);

    root.innerHTML = `
      <div class="panel">
        <div class="panel-bar">
          <span class="label">${escapeHtml(cfg.panelLabel)}</span>
          <span class="total">scrolling · ${String(cmds.length).padStart(2,'0')}</span>
        </div>
        <div class="scroll-frame">
          <div class="marquee" style="--scroll-dur:${dur}s"></div>
        </div>
      </div>`;

    const marquee = root.querySelector('.marquee');
    [...cmds, ...cmds].forEach(cmd => {
      marquee.appendChild(createCard(cmd, {
        showPictogram: true,
        showProgress: false,
        isCotd: cfg.commandOfDay && cmd.name === cfg.commandOfDay
      }));
    });
    if (root._timer) { clearInterval(root._timer); root._timer = null; }

    ctx.api = ctx.api || {};
    ctx.api.pulse = makePulser(marquee, cfg, ctx, { multi: true });
  }

  function renderCompact(root, cfg, ctx) {
    const cmds = filterCommands(cfg.commands, cfg);
    if (!cmds.length) return;

    root.innerHTML = `<div class="panel"><div class="stack"></div></div>`;
    const stack = root.querySelector('.stack');
    cmds.forEach(cmd => {
      stack.appendChild(createCard(cmd, {
        showPictogram: false,
        showProgress: false,
        isCotd: cfg.commandOfDay && cmd.name === cfg.commandOfDay
      }));
    });
    const cards = stack.querySelectorAll('.cmd-card');
    let idx = 0;
    function setActive(n) { cards.forEach((c, i) => c.classList.toggle('is-active', i === n)); }
    setActive(0);
    if (root._timer) clearInterval(root._timer);
    root._timer = setInterval(() => { idx = (idx + 1) % cmds.length; setActive(idx); }, Math.max(2200, cfg.rotationMs - 800));

    ctx.api = ctx.api || {};
    ctx.api.next = () => { idx = (idx + 1) % cmds.length; setActive(idx); };
    ctx.api.prev = () => { idx = (idx - 1 + cmds.length) % cmds.length; setActive(idx); };
    ctx.api.pulse = makePulser(stack, cfg, ctx);
  }

  /* ============================================================
     UTILITIES
     ============================================================ */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ============================================================
     MOUNT
     ============================================================ */
  function mount(rootSelector, userConfig) {
    const root = typeof rootSelector === 'string' ? document.querySelector(rootSelector) : rootSelector;
    if (!root) return null;

    const cfg = deepMerge(deepMerge(deepMerge({}, DEFAULTS), window.CMD_CONFIG || {}), userConfig || {});
    const url = readUrlConfig();
    Object.assign(cfg, url);
    if (!cfg.commands || !cfg.commands.length) cfg.commands = DEFAULTS.commands.slice();

    document.documentElement.dataset.theme = cfg.theme;
    root.className = (root.className || '').replace(/mode-\S+/g, '').trim() + ' mode-' + cfg.mode;
    root.dataset.entrance = cfg.mode === 'rotating' ? 'on' : 'off';

    const ctx = {
      userInteracted: false,
      cleanup: []
    };

    // Audio gate — wait for first user interaction so sounds aren't blocked
    const armAudio = () => { ctx.userInteracted = true; document.removeEventListener('click', armAudio); document.removeEventListener('keydown', armAudio); };
    document.addEventListener('click', armAudio);
    document.addEventListener('keydown', armAudio);

    // Tear down anything from previous mount
    if (root._cleanup) root._cleanup.forEach(fn => { try { fn(); } catch(e){} });

    if      (cfg.mode === 'grid')    renderGrid(root, cfg, ctx);
    else if (cfg.mode === 'scroll')  renderScroll(root, cfg, ctx);
    else if (cfg.mode === 'compact') renderCompact(root, cfg, ctx);
    else                              renderRotating(root, cfg, ctx);

    /* ----- live chat hookup ----- */
    if (cfg.chat && cfg.chat.enabled && cfg.chat.channel) {
      let badge = document.querySelector('.live-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'live-badge';
        document.body.appendChild(badge);
        ctx.cleanup.push(() => badge.remove());
      }
      badge.textContent = '· connecting ' + cfg.chat.channel;
      const client = createChatClient(cfg.chat.channel, (cmdName) => {
        // increment local usage
        const cmd = cfg.commands.find(c => c.name === cmdName);
        if (cmd) cmd.uses = (cmd.uses || 0) + 1;
        if (cfg.chat.pulseOnUse && ctx.api && ctx.api.pulse) ctx.api.pulse(cmdName);
      }, (status) => {
        badge.dataset.status = status;
        badge.textContent = status === 'connected' ? '● live · ' + cfg.chat.channel
                          : status === 'error' ? '· chat error'
                          : '· reconnecting…';
      });
      if (client) ctx.cleanup.push(() => client.close());
    }

    /* ----- scheduled show/hide ----- */
    if (cfg.schedule && cfg.schedule.enabled) {
      const panelEl = root.querySelector('.panel');
      if (panelEl) {
        panelEl.style.transition = `opacity ${cfg.schedule.fadeMs}ms ease, transform ${cfg.schedule.fadeMs}ms ease`;
        const show = () => { panelEl.style.opacity = '1'; panelEl.style.transform = 'translateY(0)'; panelEl.style.pointerEvents = ''; };
        const hide = () => { panelEl.style.opacity = '0'; panelEl.style.transform = 'translateY(8px)'; panelEl.style.pointerEvents = 'none'; };
        hide();
        // first appearance after 2s, then on schedule
        const firstT = setTimeout(() => {
          show();
          const hideT = setTimeout(hide, cfg.schedule.visibleSec * 1000);
          ctx.cleanup.push(() => clearTimeout(hideT));
        }, 2000);
        const loop = setInterval(() => {
          show();
          const hideT = setTimeout(hide, cfg.schedule.visibleSec * 1000);
          ctx.cleanup.push(() => clearTimeout(hideT));
        }, cfg.schedule.intervalSec * 1000);
        ctx.cleanup.push(() => clearTimeout(firstT));
        ctx.cleanup.push(() => clearInterval(loop));
      }
    }

    /* ----- hotkeys ----- */
    if (cfg.hotkeys && cfg.hotkeys.enabled) {
      const onKey = (e) => {
        // ignore typing in inputs
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        const k = e.key.toLowerCase();
        if (k === cfg.hotkeys.toggle) {
          const p = root.querySelector('.panel');
          if (p) p.classList.toggle('is-hidden');
          e.preventDefault();
        } else if (k === cfg.hotkeys.next || e.key === ' ') {
          if (ctx.api && ctx.api.next) ctx.api.next();
          e.preventDefault();
        } else if (k === cfg.hotkeys.prev) {
          if (ctx.api && ctx.api.prev) ctx.api.prev();
          e.preventDefault();
        } else if (k === cfg.hotkeys.reload) {
          mount(root, cfg);
          e.preventDefault();
        } else if (/^[1-9]$/.test(k)) {
          const idx = parseInt(k, 10) - 1;
          const card = root.querySelectorAll('.cmd-card')[idx];
          if (card && ctx.api && ctx.api.pulse) ctx.api.pulse(card.dataset.cmd);
        }
      };
      window.addEventListener('keydown', onKey);
      ctx.cleanup.push(() => window.removeEventListener('keydown', onKey));
    }

    root._cleanup = ctx.cleanup;
    root._ctx = ctx;
    root._cfg = cfg;

    return {
      update(newCfg) { mount(root, deepMerge(cfg, newCfg)); },
      destroy() {
        if (root._timer) clearInterval(root._timer);
        ctx.cleanup.forEach(fn => { try { fn(); } catch(e){} });
        root.innerHTML = '';
      },
      pulse(name) { if (ctx.api && ctx.api.pulse) ctx.api.pulse(name); },
      next()  { if (ctx.api && ctx.api.next)  ctx.api.next(); },
      prev()  { if (ctx.api && ctx.api.prev)  ctx.api.prev(); }
    };
  }

  function deepMerge(a, b) {
    const out = Object.assign({}, a);
    if (!b) return out;
    Object.keys(b).forEach(k => {
      const av = a ? a[k] : undefined, bv = b[k];
      if (bv && typeof bv === 'object' && !Array.isArray(bv) && av && typeof av === 'object' && !Array.isArray(av)) {
        out[k] = deepMerge(av, bv);
      } else if (bv !== undefined) {
        out[k] = bv;
      }
    });
    return out;
  }

  window.CommandPanel = { mount, DEFAULTS, _internals: { playChime, playPulse } };
})();
