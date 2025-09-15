// src/components/CRM/WhatsAppFunnel.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./WhatsAppFunnel.scss";

/**
 * WhatsAppFunnel
 * - Табы: WhatsApp / Instagram / Лиды / Аналитика
 * - Ответственный = менеджер, который нажал START в чате
 * - Кнопка "+" в чате: создать лид напрямую (ответственный подставляется из чата)
 * - Дедуп по телефону, обновление стадий, причина потери
 * - Редактор списка менеджеров + выбор активного менеджера
 * - Хранение в localStorage
 * - BEM + SCSS, цвета только в :root, адаптация до 320px
 */

const WhatsAppFunnel = () => {
  /* ---------- Константы ---------- */
  const STAGES = [
    { id: "interest", label: "Интерес" },
    { id: "clarify", label: "Уточнение" },
    { id: "booking", label: "Запись" },
    { id: "payment", label: "Оплата" },
  ];
  const REASONS = ["Не ответил", "Дорого", "Не готов", "Передумал", "Конкуренты"];
  const SPORTS = [
    "Бокс",
    "Борьба",
    "Греко-римская борьба",
    "Дзюдо",
    "Кикбокс",
    "Кроссфит",
    "Кулату",
    "Самбо",
    "Тхэквондо",
  ];

  /* ---------- Утилиты ---------- */
  const uid = () => Math.random().toString(36).slice(2, 10);
  const nowISO = () => new Date().toISOString();
  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const initials = (s) => {
    const p = String(s).trim().split(/\s+/);
    return ((p[0]?.[0] || "?") + (p[1]?.[0] || "")).toUpperCase();
  };
  const storage = {
    get: (k, fallback) => {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : fallback;
      } catch {
        return fallback;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {}
    },
  };

  /* ---------- Табы ---------- */
  const [tab, setTab] = useState("wa"); // 'wa' | 'ig' | 'leads' | 'analytics'

  /* ---------- Менеджеры ---------- */
  const [managers, setManagers] = useState(() =>
    storage.get("nurcrm.managers", ["Нурбек", "Айдана", "Элдар"])
  );
  const [currentManager, setCurrentManager] = useState(() =>
    storage.get("nurcrm.currentManager", "Нурбек")
  );
  const [newManager, setNewManager] = useState("");

  const addManager = () => {
    const n = newManager.trim();
    if (!n) return;
    if (!managers.includes(n)) setManagers((p) => [...p, n]);
    setCurrentManager(n);
    setNewManager("");
  };
  const removeManager = (name) => {
    setManagers((p) => p.filter((m) => m !== name));
    if (currentManager === name) setCurrentManager((p) => managers.find((m) => m !== name) || "");
  };

  /* ---------- Чаты (seed + localStorage) ---------- */
  const seedWA = [
    {
      id: uid(),
      channel: "wa",
      name: "Асан",
      avatar: "AS",
      responsible: "",
      started: false,
      messages: [
        { id: uid(), who: "peer", text: "Здравствуйте! Есть места на вечер?", at: nowISO(), seen: false },
      ],
    },
    {
      id: uid(),
      channel: "wa",
      name: "NurCRM",
      avatar: "NR",
      responsible: "",
      started: false,
      messages: [{ id: uid(), who: "peer", text: "Чем помочь?", at: nowISO(), seen: false }],
    },
  ];
  const seedIG = [
    {
      id: uid(),
      channel: "ig",
      name: "asan_fit",
      avatar: "AS",
      responsible: "",
      started: false,
      messages: [{ id: uid(), who: "peer", text: "Добрый! Интересует бокс.", at: nowISO(), seen: false }],
    },
  ];

  const [waChats, setWaChats] = useState(() => storage.get("nurcrm.waChats", seedWA));
  const [igChats, setIgChats] = useState(() => storage.get("nurcrm.igChats", seedIG));
  const [waActiveId, setWaActiveId] = useState(waChats[0]?.id || "");
  const [igActiveId, setIgActiveId] = useState(igChats[0]?.id || "");
  const [waDraft, setWaDraft] = useState("");
  const [igDraft, setIgDraft] = useState("");
  const [waSearch, setWaSearch] = useState("");
  const [igSearch, setIgSearch] = useState("");

  const unreadCount = (chat) => chat.messages.filter((m) => m.who === "peer" && !m.seen).length;
  const activeWA = useMemo(() => waChats.find((c) => c.id === waActiveId) || null, [waChats, waActiveId]);
  const activeIG = useMemo(() => igChats.find((c) => c.id === igActiveId) || null, [igChats, igActiveId]);

  /* ---------- Лиды (seed + localStorage) ---------- */
  const [leads, setLeads] = useState(() =>
    storage.get("nurcrm.leads", [
      {
        id: uid(),
        created_at: nowISO(),
        name: "Асан",
        phone: "+996 700 123 456",
        sport: "Бокс",
        date: new Date().toISOString().slice(0, 10),
        channel: "wa",
        stage: "clarify",
        responsible: "Нурбек",
        lost_reason: null,
      },
    ])
  );

  /* ---------- Persist ---------- */
  useEffect(() => storage.set("nurcrm.managers", managers), [managers]);
  useEffect(() => storage.set("nurcrm.currentManager", currentManager), [currentManager]);
  useEffect(() => storage.set("nurcrm.waChats", waChats), [waChats]);
  useEffect(() => storage.set("nurcrm.igChats", igChats), [igChats]);
  useEffect(() => storage.set("nurcrm.leads", leads), [leads]);

  /* ---------- Прочитать входящие при выборе чата ---------- */
  useEffect(() => {
    if (!waActiveId) return;
    setWaChats((prev) =>
      prev.map((c) =>
        c.id === waActiveId
          ? { ...c, messages: c.messages.map((m) => (m.who === "peer" ? { ...m, seen: true } : m)) }
          : c
      )
    );
  }, [waActiveId]);
  useEffect(() => {
    if (!igActiveId) return;
    setIgChats((prev) =>
      prev.map((c) =>
        c.id === igActiveId
          ? { ...c, messages: c.messages.map((m) => (m.who === "peer" ? { ...m, seen: true } : m)) }
          : c
      )
    );
  }, [igActiveId]);

  /* ---------- Отправка сообщений ---------- */
  const sendWA = () => {
    if (!activeWA || !waDraft.trim()) return;
    const msg = { id: uid(), who: "me", text: waDraft.trim(), at: nowISO(), seen: true };
    setWaChats((prev) => prev.map((c) => (c.id === activeWA.id ? { ...c, messages: [...c.messages, msg] } : c)));
    setWaDraft("");
  };
  const sendIG = () => {
    if (!activeIG || !igDraft.trim()) return;
    const msg = { id: uid(), who: "me", text: igDraft.trim(), at: nowISO(), seen: true };
    setIgChats((prev) => prev.map((c) => (c.id === activeIG.id ? { ...c, messages: [...c.messages, msg] } : c)));
    setIgDraft("");
  };

  /* ---------- START: назначить ответственного + приветствие ---------- */
  const startChat = (chat, channel) => {
    if (!currentManager) return;
    const greeting = `Здравствуйте! Это ${currentManager}, спорт-клуб “Nur”. Готов помочь и записать вас на тренировку.`;
    const add = (listSetter) =>
      listSetter((prev) =>
        prev.map((c) =>
          c.id === chat.id
            ? {
                ...c,
                responsible: currentManager,
                started: true,
                messages: [...c.messages, { id: uid(), who: "me", text: greeting, at: nowISO(), seen: true }],
              }
            : c
        )
      );

    if (channel === "wa") add(setWaChats);
    else add(setIgChats);
  };

  /* ---------- Создание лида из чата (модалка) ---------- */
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalData, setLeadModalData] = useState({
    name: "",
    phone: "",
    sport: "Бокс",
    date: new Date().toISOString().slice(0, 10),
    channel: "wa",
    responsible: "",
    message: "Подскажите, какой вид спорта и время вам удобно?",
  });

  const validPhone = (s) => /^\+?\d[\d\s\-()]{7,}$/.test(String(s).trim());
  const findDuplicateLeadId = (phone) => {
    const norm = String(phone).replace(/\D/g, "");
    const same = leads.find((l) => String(l.phone).replace(/\D/g, "") === norm);
    return same?.id || null;
    };

  const openLeadModalFromChat = (chat, channel) => {
    if (!chat.started || !chat.responsible) return;
    setLeadModalData({
      name: chat.name,
      phone: "",
      sport: "Бокс",
      date: new Date().toISOString().slice(0, 10),
      channel,
      responsible: chat.responsible,
      message: "Подскажите, какой вид спорта и время вам удобно?",
    });
    setLeadModalOpen(true);
  };

  const createLeadFromModal = (e) => {
    e.preventDefault();
    const { name, phone, sport, date, channel, responsible, message } = leadModalData;
    if (!name.trim() || !validPhone(phone)) return;

    const dupId = findDuplicateLeadId(phone);
    if (dupId) {
      // мягкий апдейт существующего
      setLeads((prev) =>
        prev.map((l) =>
          l.id === dupId ? { ...l, lost_reason: null, stage: l.stage === "interest" ? "clarify" : l.stage } : l
        )
      );
      setLeadModalOpen(false);
      return;
    }

    const newLead = {
      id: uid(),
      created_at: nowISO(),
      name: name.trim(),
      phone: phone.trim(),
      sport,
      date,
      channel,
      stage: "interest",
      responsible,
      lost_reason: null,
    };
    setLeads((prev) => [newLead, ...prev]);

    const msg = { id: uid(), who: "me", text: message, at: nowISO(), seen: true };
    if (channel === "wa" && activeWA?.id) {
      setWaChats((prev) => prev.map((c) => (c.id === activeWA.id ? { ...c, messages: [...c.messages, msg] } : c)));
    }
    if (channel === "ig" && activeIG?.id) {
      setIgChats((prev) => prev.map((c) => (c.id === activeIG.id ? { ...c, messages: [...c.messages, msg] } : c)));
    }

    setLeadModalOpen(false);
  };

  /* ---------- Поиск по чатам ---------- */
  const filteredWA = useMemo(() => {
    const q = waSearch.trim().toLowerCase();
    return waChats.filter((c) => (c.name + " " + c.avatar).toLowerCase().includes(q));
  }, [waChats, waSearch]);
  const filteredIG = useMemo(() => {
    const q = igSearch.trim().toLowerCase();
    return igChats.filter((c) => (c.name + " " + c.avatar).toLowerCase().includes(q));
  }, [igChats, igSearch]);

  /* ---------- Лиды: форма и таблица ---------- */
  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    sport: "Бокс",
    date: new Date().toISOString().slice(0, 10),
    channel: "wa",
    responsible: currentManager || "",
    message: "Здравствуйте! Мы спорт-клуб “Nur”. Подскажите, удобно обсудить тренировку?",
  });

  useEffect(() => {
    // если сменили активного менеджера — подставить в форму
    setLeadForm((s) => ({ ...s, responsible: currentManager }));
  }, [currentManager]);

  const createLeadFromBoard = (e) => {
    e.preventDefault();
    const { name, phone, sport, date, channel, responsible } = leadForm;
    if (!name.trim() || !validPhone(phone)) return;

    const dupId = findDuplicateLeadId(phone);
    if (dupId) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === dupId ? { ...l, lost_reason: null, stage: l.stage === "interest" ? "clarify" : l.stage } : l
        )
      );
      return;
    }
    const lead = {
      id: uid(),
      created_at: nowISO(),
      name: name.trim(),
      phone: phone.trim(),
      sport,
      date,
      channel,
      stage: "interest",
      responsible: responsible || currentManager || managers[0] || "",
      lost_reason: null,
    };
    setLeads((p) => [lead, ...p]);
    setLeadForm((s) => ({ ...s, name: "", phone: "" }));
  };

  const setLeadStage = (id, stageId) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage: stageId, lost_reason: stageId==="payment"?null:l.lost_reason } : l)));
  };
  const setLeadReason = (id, reason) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, lost_reason: reason || null } : l)));
  };
  const setLeadResponsible = (id, name) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, responsible: name } : l)));
  };

  const [filterSport, setFilterSport] = useState("");
  const [filterResp, setFilterResp] = useState("");
  const [filterStage, setFilterStage] = useState("");

  const filteredLeads = useMemo(() => {
    return leads.filter(
      (l) =>
        (!filterSport || l.sport === filterSport) &&
        (!filterResp || l.responsible === filterResp) &&
        (!filterStage || l.stage === filterStage)
    );
  }, [leads, filterSport, filterResp, filterStage]);

  /* ---------- Аналитика ---------- */
  const kpi = useMemo(() => {
    const total = leads.length;
    const won = leads.filter((l) => l.stage === "payment").length;
    const inWork = leads.filter((l) => l.stage !== "payment" && !l.lost_reason).length;
    const lost = leads.filter((l) => l.lost_reason).length;
    return { total, won, inWork, lost, conv: total ? Math.round((won / total) * 100) : 0 };
  }, [leads]);

  const analyticsByManager = useMemo(() => {
    const map = {};
    for (const m of managers) map[m] = { total: 0, won: 0, lost: 0, inWork: 0, reasons: {} };
    for (const l of leads) {
      const k = map[l.responsible] || (map[l.responsible] = { total: 0, won: 0, lost: 0, inWork: 0, reasons: {} });
      k.total++;
      if (l.stage === "payment") k.won++;
      else if (l.lost_reason) {
        k.lost++;
        k.reasons[l.lost_reason] = (k.reasons[l.lost_reason] || 0) + 1;
      } else k.inWork++;
    }
    for (const v of Object.values(map)) v.conv = v.total ? Math.round((v.won / v.total) * 100) : 0;
    return map;
  }, [leads, managers]);

  const analyticsBySport = useMemo(() => {
    const map = {};
    for (const s of SPORTS) map[s] = { total: 0, won: 0, lost: 0, inWork: 0 };
    for (const l of leads) {
      const x = map[l.sport] || (map[l.sport] = { total: 0, won: 0, lost: 0, inWork: 0 });
      x.total++;
      if (l.stage === "payment") x.won++;
      else if (l.lost_reason) x.lost++;
      else x.inWork++;
    }
    for (const v of Object.values(map)) v.conv = v.total ? Math.round((v.won / v.total) * 100) : 0;
    return map;
  }, [leads]);

  /* ---------- Render ---------- */
  return (
    <div className="wa-app" role="application" aria-label="NurCRM • Чаты + Лиды + Аналитика">
      <header className="wa-app__header">
        <div className="wa-app__brand">NurCRM • Воронка (чаты, лиды, аналитика)</div>

        <div className="wa-app__mgr">
          <label className="wa-app__mgr-label">Я — менеджер</label>
          <select
            className="wa-app__mgr-select"
            value={currentManager}
            onChange={(e) => setCurrentManager(e.target.value)}
          >
            {managers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <div className="wa-app__mgr-add">
            <input
              className="wa-app__mgr-input"
              placeholder="Новый менеджер"
              value={newManager}
              onChange={(e) => setNewManager(e.target.value)}
            />
            <button className="wa-app__mgr-btn" type="button" onClick={addManager}>
              +
            </button>
          </div>
        </div>

        <nav className="wa-app__tabs" aria-label="Разделы">
          <button className={`wa-app__tab ${tab === "wa" ? "wa-app__tab--active" : ""}`} onClick={() => setTab("wa")}>
            WhatsApp
          </button>
          <button className={`wa-app__tab ${tab === "ig" ? "wa-app__tab--active" : ""}`} onClick={() => setTab("ig")}>
            Instagram
          </button>
          <button
            className={`wa-app__tab ${tab === "leads" ? "wa-app__tab--active" : ""}`}
            onClick={() => setTab("leads")}
          >
            Лиды
          </button>
          <button
            className={`wa-app__tab ${tab === "analytics" ? "wa-app__tab--active" : ""}`}
            onClick={() => setTab("analytics")}
          >
            Аналитика
          </button>
        </nav>
      </header>

      {/* ===================== WhatsApp ===================== */}
      {tab === "wa" && (
        <div className="wa-chat" role="region" aria-label="WhatsApp Chat">
          <aside className="wa-chat__sidebar">
            <header className="wa-chat__sidebar-header">
              <div className="wa-chat__brand">WhatsApp</div>
              <div className="wa-chat__actions">⋮</div>
            </header>

            <div className="wa-chat__search">
              <input
                className="wa-chat__search-input"
                placeholder="Поиск или новый чат"
                value={waSearch}
                onChange={(e) => setWaSearch(e.target.value)}
              />
            </div>

            <ul className="wa-chat__list">
              {filteredWA.map((c) => {
                const last = c.messages[c.messages.length - 1];
                return (
                  <li
                    key={c.id}
                    className={`wa-chat__item ${c.id === waActiveId ? "wa-chat__item--active" : ""}`}
                    onClick={() => setWaActiveId(c.id)}
                  >
                    <div className="wa-chat__avatar">{c.avatar}</div>
                    <div className="wa-chat__cell">
                      <div className="wa-chat__row">
                        <div className="wa-chat__name">{c.name}</div>
                        <div className="wa-chat__time">{last ? fmtTime(last.at) : ""}</div>
                      </div>
                      <div className="wa-chat__row">
                        <div className="wa-chat__snippet">{last ? last.text : "—"}</div>
                        <div className={`wa-chat__badge ${unreadCount(c) ? "" : "wa-chat__badge--empty"}`}>
                          {unreadCount(c) || ""}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="wa-chat__thread">
            {activeWA ? (
              <>
                <header className="wa-chat__thread-header">
                  <div className="wa-chat__peer">
                    <div className="wa-chat__avatar wa-chat__avatar--sm">{activeWA.avatar}</div>
                    <div>
                      <div className="wa-chat__peer-name">{activeWA.name}</div>
                      <div className="wa-chat__peer-status">
                        {activeWA.started && activeWA.responsible
                          ? `Ответственный: ${activeWA.responsible}`
                          : "Ответственный не назначен"}
                      </div>
                    </div>
                  </div>
                  <div className="wa-chat__icons">
                    {!activeWA.started ? (
                      <button
                        className="wa-chat__start"
                        type="button"
                        onClick={() => startChat(activeWA, "wa")}
                        title="Назначить себя ответственным и отправить приветствие"
                      >
                        START
                      </button>
                    ) : (
                      <button
                        className="wa-chat__plus"
                        type="button"
                        onClick={() => openLeadModalFromChat(activeWA, "wa")}
                        title="Создать лид из чата"
                      >
                        +
                      </button>
                    )}
                  </div>
                </header>

                <div className="wa-chat__messages">
                  {activeWA.messages.map((m) => (
                    <div key={m.id} className={`wa-chat__bubble ${m.who === "me" ? "wa-chat__bubble--me" : ""}`}>
                      {m.text}
                      <div className="wa-chat__meta">
                        {fmtTime(m.at)} {m.who === "me" ? "✓✓" : ""}
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="wa-chat__composer">
                  <div className="wa-chat__clip">📎</div>
                  <input
                    className="wa-chat__input"
                    placeholder="Напишите сообщение"
                    value={waDraft}
                    onChange={(e) => setWaDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendWA()}
                  />
                  <button className="wa-chat__send" onClick={sendWA} type="button">
                    ➤
                  </button>
                </footer>
              </>
            ) : (
              <div className="wa-chat__empty">Выберите чат</div>
            )}
          </section>
        </div>
      )}

      {/* ===================== Instagram ===================== */}
      {tab === "ig" && (
        <div className="ig-chat" role="region" aria-label="Instagram DM Chat">
          <aside className="ig-chat__sidebar">
            <header className="ig-chat__sidebar-header">
              <div className="ig-chat__brand">Instagram</div>
              <div className="ig-chat__actions">✉ ⋯</div>
            </header>

            <div className="ig-chat__search">
              <input
                className="ig-chat__search-input"
                placeholder="Поиск"
                value={igSearch}
                onChange={(e) => setIgSearch(e.target.value)}
              />
            </div>

            <ul className="ig-chat__list">
              {filteredIG.map((c) => {
                const last = c.messages[c.messages.length - 1];
                return (
                  <li
                    key={c.id}
                    className={`ig-chat__item ${c.id === igActiveId ? "ig-chat__item--active" : ""}`}
                    onClick={() => setIgActiveId(c.id)}
                  >
                    <div className="ig-chat__avatar">{c.avatar}</div>
                    <div className="ig-chat__cell">
                      <div className="ig-chat__row">
                        <div className="ig-chat__name">{c.name}</div>
                        <div className="ig-chat__time">{last ? fmtTime(last.at) : ""}</div>
                      </div>
                      <div className="ig-chat__row">
                        <div className="ig-chat__snippet">{last ? last.text : "—"}</div>
                        <div className={`ig-chat__badge ${unreadCount(c) ? "" : "ig-chat__badge--empty"}`}>
                          {unreadCount(c) || ""}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="ig-chat__thread">
            {activeIG ? (
              <>
                <header className="ig-chat__thread-header">
                  <div className="ig-chat__peer">
                    <div className="ig-chat__avatar ig-chat__avatar--sm">{activeIG.avatar}</div>
                    <div>
                      <div className="ig-chat__peer-name">{activeIG.name}</div>
                      <div className="ig-chat__peer-status">
                        {activeIG.started && activeIG.responsible
                          ? `Ответственный: ${activeIG.responsible}`
                          : "Ответственный не назначен"}
                      </div>
                    </div>
                  </div>
                  <div className="ig-chat__icons">
                    {!activeIG.started ? (
                      <button
                        className="ig-chat__start"
                        type="button"
                        onClick={() => startChat(activeIG, "ig")}
                        title="Назначить себя ответственным и отправить приветствие"
                      >
                        START
                      </button>
                    ) : (
                      <button
                        className="ig-chat__plus"
                        type="button"
                        onClick={() => openLeadModalFromChat(activeIG, "ig")}
                        title="Создать лид из чата"
                      >
                        +
                      </button>
                    )}
                  </div>
                </header>

                <div className="ig-chat__messages">
                  {activeIG.messages.map((m) => (
                    <div key={m.id} className={`ig-chat__bubble ${m.who === "me" ? "ig-chat__bubble--me" : ""}`}>
                      {m.text}
                      <div className="ig-chat__meta">{fmtTime(m.at)}</div>
                    </div>
                  ))}
                </div>

                <footer className="ig-chat__composer">
                  <div className="ig-chat__clip">📎</div>
                  <input
                    className="ig-chat__input"
                    placeholder="Напишите сообщение"
                    value={igDraft}
                    onChange={(e) => setIgDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendIG()}
                  />
                  <button className="ig-chat__send" onClick={sendIG} type="button">
                    ➤
                  </button>
                </footer>
              </>
            ) : (
              <div className="ig-chat__empty">Выберите диалог</div>
            )}
          </section>
        </div>
      )}

      {/* ===================== Лиды ===================== */}
      {tab === "leads" && (
        <div className="lead-board" role="region" aria-label="Лиды">
          <header className="lead-board__header">
            <h3 className="lead-board__title">Лиды и управление</h3>
            <div className="lead-board__hint">Создавайте лиды прямо здесь или из чатов (“+”).</div>
          </header>

          <form className="lead-form" onSubmit={createLeadFromBoard}>
            <label className="lead-form__field">
              <span className="lead-form__label">Имя *</span>
              <input
                className="lead-form__input"
                value={leadForm.name}
                onChange={(e) => setLeadForm((s) => ({ ...s, name: e.target.value }))}
              />
            </label>
            <label className="lead-form__field">
              <span className="lead-form__label">Телефон *</span>
              <input
                className={`lead-form__input ${
                  leadForm.phone && !validPhone(leadForm.phone) ? "lead-form__input--error" : ""
                }`}
                value={leadForm.phone}
                onChange={(e) => setLeadForm((s) => ({ ...s, phone: e.target.value }))}
                placeholder="+996 ..."
              />
            </label>
            <label className="lead-form__field">
              <span className="lead-form__label">Спорт</span>
              <select
                className="lead-form__input"
                value={leadForm.sport}
                onChange={(e) => setLeadForm((s) => ({ ...s, sport: e.target.value }))}
              >
                {SPORTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="lead-form__field">
              <span className="lead-form__label">Дата</span>
              <input
                type="date"
                className="lead-form__input"
                value={leadForm.date}
                onChange={(e) => setLeadForm((s) => ({ ...s, date: e.target.value }))}
              />
            </label>
            <label className="lead-form__field">
              <span className="lead-form__label">Канал</span>
              <select
                className="lead-form__input"
                value={leadForm.channel}
                onChange={(e) => setLeadForm((s) => ({ ...s, channel: e.target.value }))}
              >
                <option value="wa">WhatsApp</option>
                <option value="ig">Instagram</option>
              </select>
            </label>
            <label className="lead-form__field">
              <span className="lead-form__label">Ответственный</span>
              <select
                className="lead-form__input"
                value={leadForm.responsible}
                onChange={(e) => setLeadForm((s) => ({ ...s, responsible: e.target.value }))}
              >
                {managers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <span className="lead-form__sub">По умолчанию: текущий менеджер “{currentManager}”.</span>
            </label>
            <div className="lead-form__actions">
              <button
                className="lead-form__btn"
                type="submit"
                disabled={!leadForm.name.trim() || !validPhone(leadForm.phone)}
              >
                Создать лид
              </button>
            </div>
          </form>

          <div className="lead-filters">
            <div className="lead-filters__group">
              <span className="lead-filters__label">Спорт</span>
              <select
                className="lead-filters__control"
                value={filterSport}
                onChange={(e) => setFilterSport(e.target.value)}
              >
                <option value="">Все</option>
                {SPORTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="lead-filters__group">
              <span className="lead-filters__label">Ответственный</span>
              <select
                className="lead-filters__control"
                value={filterResp}
                onChange={(e) => setFilterResp(e.target.value)}
              >
                <option value="">Все</option>
                {managers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="lead-filters__group">
              <span className="lead-filters__label">Этап</span>
              <select
                className="lead-filters__control"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
              >
                <option value="">Все</option>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lead-table" aria-label="Список лидов">
            <div className="lead-table__row lead-table__row--head">
              <div className="lead-table__col">Имя</div>
              <div className="lead-table__col">Телефон</div>
              <div className="lead-table__col">Спорт</div>
              <div className="lead-table__col">Канал</div>
              <div className="lead-table__col">Этап</div>
              <div className="lead-table__col">Ответственный</div>
              <div className="lead-table__col">Причина</div>
              <div className="lead-table__col">Создан</div>
            </div>

            {filteredLeads.map((l) => (
              <div className="lead-table__row" key={l.id}>
                <div className="lead-table__col">{l.name}</div>
                <div className="lead-table__col">{l.phone}</div>
                <div className="lead-table__col">{l.sport}</div>
                <div className="lead-table__col">
                  <span className={`lead-table__tag ${l.channel === "wa" ? "lead-table__tag--wa" : "lead-table__tag--ig"}`}>
                    {l.channel.toUpperCase()}
                  </span>
                </div>
                <div className="lead-table__col">
                  <select className="lead-table__input" value={l.stage} onChange={(e) => setLeadStage(l.id, e.target.value)}>
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lead-table__col">
                  <select
                    className="lead-table__input"
                    value={l.responsible}
                    onChange={(e) => setLeadResponsible(l.id, e.target.value)}
                  >
                    {managers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lead-table__col">
                  <select
                    className="lead-table__input"
                    value={l.lost_reason || ""}
                    onChange={(e) => setLeadReason(l.id, e.target.value)}
                  >
                    <option value="">—</option>
                    {REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lead-table__col">
                  {new Date(l.created_at).toLocaleDateString("ru-RU")}
                </div>
              </div>
            ))}
          </div>

          <section className="mgr-admin">
            <header className="mgr-admin__head">
              <div className="mgr-admin__title">Менеджеры (управление)</div>
              <div className="mgr-admin__meta">Настройте команду и ответственных</div>
            </header>
            <div className="mgr-admin__list">
              {managers.map((m) => (
                <div className="mgr-admin__item" key={m}>
                  <div className="mgr-admin__avatar">{initials(m)}</div>
                  <div className="mgr-admin__name">{m}</div>
                  <button
                    className="mgr-admin__remove"
                    type="button"
                    onClick={() => removeManager(m)}
                    title="Удалить менеджера"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ===================== Аналитика ===================== */}
      {tab === "analytics" && (
        <div className="analytics" role="region" aria-label="Аналитика">
          <header className="analytics__header">
            <h3 className="analytics__title">Аналитика по менеджерам и видам спорта</h3>
          </header>

          <section className="analytics__kpi">
            <div className="analytics__card">
              <div className="analytics__kpi-title">Всего лидов</div>
              <div className="analytics__kpi-value">{kpi.total}</div>
            </div>
            <div className="analytics__card">
              <div className="analytics__kpi-title">Оплат</div>
              <div className="analytics__kpi-value">{kpi.won}</div>
            </div>
            <div className="analytics__card">
              <div className="analytics__kpi-title">В работе</div>
              <div className="analytics__kpi-value">{kpi.inWork}</div>
            </div>
            <div className="analytics__card">
              <div className="analytics__kpi-title">Потеряно</div>
              <div className="analytics__kpi-value">{kpi.lost}</div>
            </div>
            <div className="analytics__card">
              <div className="analytics__kpi-title">Конверсия</div>
              <div className="analytics__kpi-value">{kpi.conv}%</div>
            </div>
          </section>

          <section className="analytics__list">
            {Object.entries(analyticsByManager).map(([mgr, row]) => (
              <article className="analytics__item" key={mgr}>
                <div className="analytics__avatar">{initials(mgr)}</div>
                <div className="analytics__info">
                  <div className="analytics__name">{mgr}</div>
                  <div className="analytics__meta">
                    Всего: {row.total} • Конверсия: {row.conv}% • В работе: {row.inWork} • Потеряно: {row.lost}
                  </div>
                  <div className="analytics__stack">
                    <span className="analytics__seg analytics__seg--won" style={{ width: `${row.conv}%` }} />
                    <span
                      className="analytics__seg analytics__seg--mid"
                      style={{
                        width: `${
                          Math.max(0, 100 - row.conv - (row.total ? Math.round((100 * row.lost) / row.total) : 0))
                        }%`,
                      }}
                    />
                    <span
                      className="analytics__seg analytics__seg--lost"
                      style={{ width: `${row.total ? Math.round((100 * row.lost) / row.total) : 0}%` }}
                    />
                  </div>
                  <div className="analytics__reasons">
                    {Object.keys(row.reasons).length === 0 ? (
                      <span className="analytics__chip">Причин нет</span>
                    ) : (
                      Object.entries(row.reasons).map(([r, n]) => (
                        <span key={r} className="analytics__chip">
                          {r}: {n}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="sport-analytics">
            <h4 className="sport-analytics__title">Разрез по видам спорта</h4>
            <div className="sport-analytics__grid">
              {Object.entries(analyticsBySport).map(([sport, row]) => (
                <div className="sport-analytics__card" key={sport}>
                  <div className="sport-analytics__sport">{sport}</div>
                  <div className="sport-analytics__meta">
                    Всего: {row.total} • Конв: {row.conv}%
                  </div>
                  <div className="sport-analytics__bar">
                    <div className="sport-analytics__won" style={{ width: `${row.conv}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ===================== Модалка лида ===================== */}
      {leadModalOpen && (
        <div className="lead-modal" role="dialog" aria-modal="true" aria-label="Создать лид из чата">
          <div className="lead-modal__card">
            <header className="lead-modal__header">
              <div className="lead-modal__title">Новый лид</div>
              <button className="lead-modal__close" type="button" onClick={() => setLeadModalOpen(false)}>
                ×
              </button>
            </header>

            <form className="lead-modal__form" onSubmit={createLeadFromModal}>
              <label className="lead-modal__field">
                <span className="lead-modal__label">Имя *</span>
                <input
                  className="lead-modal__input"
                  value={leadModalData.name}
                  onChange={(e) => setLeadModalData((s) => ({ ...s, name: e.target.value }))}
                />
              </label>

              <label className="lead-modal__field">
                <span className="lead-modal__label">Телефон *</span>
                <input
                  className={`lead-modal__input ${
                    leadModalData.phone && !validPhone(leadModalData.phone) ? "lead-modal__input--error" : ""
                  }`}
                  value={leadModalData.phone}
                  onChange={(e) => setLeadModalData((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="+996 ..."
                />
              </label>

              <label className="lead-modal__field">
                <span className="lead-modal__label">Спорт</span>
                <select
                  className="lead-modal__input"
                  value={leadModalData.sport}
                  onChange={(e) => setLeadModalData((s) => ({ ...s, sport: e.target.value }))}
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="lead-modal__field">
                <span className="lead-modal__label">Дата</span>
                <input
                  type="date"
                  className="lead-modal__input"
                  value={leadModalData.date}
                  onChange={(e) => setLeadModalData((s) => ({ ...s, date: e.target.value }))}
                />
              </label>

              <div className="lead-modal__row">
                <div className="lead-modal__pill">Канал: {leadModalData.channel.toUpperCase()}</div>
                <div className="lead-modal__pill lead-modal__pill--ok">
                  Ответственный: {leadModalData.responsible || "—"}
                </div>
              </div>

              <label className="lead-modal__field lead-modal__field--wide">
                <span className="lead-modal__label">Сообщение в чат</span>
                <textarea
                  rows={3}
                  className="lead-modal__input lead-modal__input--area"
                  value={leadModalData.message}
                  onChange={(e) => setLeadModalData((s) => ({ ...s, message: e.target.value }))}
                />
              </label>

              <div className="lead-modal__actions">
                <button
                  className="lead-modal__btn"
                  type="submit"
                  disabled={!leadModalData.name.trim() || !validPhone(leadModalData.phone)}
                >
                  Создать лид
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppFunnel;
