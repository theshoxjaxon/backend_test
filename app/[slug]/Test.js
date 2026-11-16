'use client';
import { useState, useMemo, useEffect, useRef } from 'react';

const UI = {
  uz: {
    portalName: 'Talaba Test Tizimi',
    portalSub: 'Rasmiy bilim baholash portali',
    examBadge: 'Yakuniy Nazorat',
    metaQuestions: '25 ta savol',
    metaType: '1 ta to‘g‘ri javob',
    metaAttempt: 'Bir martalik urinish',
    studentInfoHeading: 'Talaba ma’lumotlari',
    studentInfoDesc: 'Testni boshlashdan oldin quyidagi maydonlarni to‘ldiring',
    name: 'Ism',
    namePh: 'Masalan: Anvar',
    surname: 'Familiya',
    surnamePh: 'Masalan: Aliyev',
    group: 'Guruh raqami',
    groupPh: 'Masalan: 412-21 yoki FN-22',
    start: 'Testni boshlash →',
    fill: 'Iltimos, barcha maydonlarni to‘ldiring',
    questionLabel: 'Savol',
    of: 'dan',
    answered: 'belgilandi',
    pending: 'tanlanmagan',
    questionsMap: 'Savollar xaritasi',
    submit: 'Testni yakunlash va topshirish',
    submitting: 'Natijalar yuborilmoqda...',
    allAnswered: 'Barcha savollarga javob berildi',
    unansweredCount: n => `${n} ta savol belgilanmagan`,
    modalTitle: 'Diqqat: Belgilanmagan savollar bor!',
    modalDesc: n => `Siz ${n} ta savolga hali javob bermadingiz. Savol raqamiga bosib unga o‘tishingiz yoki testni baribir topshirishingiz mumkin:`,
    modalBack: 'Savollarga qaytish',
    modalForce: 'Baribir topshirish',
    leftWarn: (n, max) => `Siz test sahifasidan chiqdingiz! Ogohlantirish ${n}/${max}. ${max} martaga yetganda test avtomatik topshiriladi.`,
    leftOk: 'Tushundim',
    doneTitle: 'Test muvaffaqiyatli topshirildi!',
    doneDesc: 'Sizning javoblaringiz qabul qilindi va tizimda xavfsiz saqlandi. Natijalar o‘qituvchingiz tomonidan ko‘rib chiqiladi.',
    summaryStudent: 'Talaba',
    summaryGroup: 'Guruh',
    summaryTest: 'Fan / Test',
    summaryQuestions: 'Savollar soni',
    summaryTime: 'Topshirilgan vaqt',
    closeNote: 'Imtihon yakunlandi. Endi bu sahifani yopishingiz mumkin.',
  },
  ru: {
    portalName: 'Студенческий портал',
    portalSub: 'Официальная система тестирования',
    examBadge: 'Итоговый контроль',
    metaQuestions: '25 вопросов',
    metaType: '1 правильный ответ',
    metaAttempt: 'Одна попытка сдачи',
    studentInfoHeading: 'Данные студента',
    studentInfoDesc: 'Перед началом тестирования заполните форму ниже',
    name: 'Имя',
    namePh: 'Например: Анвар',
    surname: 'Фамилия',
    surnamePh: 'Например: Алиев',
    group: 'Номер группы',
    groupPh: 'Например: 412-21 или FN-22',
    start: 'Начать тест →',
    fill: 'Пожалуйста, заполните все поля',
    questionLabel: 'Вопрос',
    of: 'из',
    answered: 'отвечено',
    pending: 'не отвечено',
    questionsMap: 'Карта вопросов',
    submit: 'Завершить и отправить тест',
    submitting: 'Отправка результатов...',
    allAnswered: 'Все вопросы отвечены',
    unansweredCount: n => `${n} вопросов без ответа`,
    modalTitle: 'Внимание: есть вопросы без ответа!',
    modalDesc: n => `Вы не ответили на ${n} вопросов. Вы можете нажать на номер вопроса, чтобы перейти к нему, или отправить тест:`,
    modalBack: 'Вернуться к вопросам',
    modalForce: 'Всё равно отправить',
    leftWarn: (n, max) => `Вы покинули страницу теста! Предупреждение ${n}/${max}. После ${max} тест отправится автоматически.`,
    leftOk: 'Понятно',
    doneTitle: 'Тест успешно сдан!',
    doneDesc: 'Ваши ответы приняты и сохранены в системе. Результаты будут объявлены преподавателем.',
    summaryStudent: 'Студент',
    summaryGroup: 'Группа',
    summaryTest: 'Предмет / Тест',
    summaryQuestions: 'Количество вопросов',
    summaryTime: 'Время сдачи',
    closeNote: 'Тестирование окончено. Теперь вы можете закрыть эту вкладку.',
  },
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Formats inline code wrapped in backticks (e.g. `jwt.sign`) into styled code chips
function FormattedText({ text }) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <span key={index} className="code-chip">{part.slice(1, -1)}</span>;
        }
        return part;
      })}
    </>
  );
}

const MAX_VIOLATIONS = 3;

export default function Test({ slug, title, questions = [] }) {
  const [lang, setLang] = useState('uz');
  const t = UI[lang];

  const [me, setMe] = useState({ name: '', surname: '', group: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [started, setStarted] = useState(false);

  const [answers, setAnswers] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [completedAt, setCompletedAt] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showWarn, setShowWarn] = useState(false);
  const submitRef = useRef();

  // Anti-cheat: tab switch / window blur / leaving fullscreen = violation. Auto-submit at MAX_VIOLATIONS.
  useEffect(() => {
    if (!started || done) return;
    let last = 0;
    const hit = () => {
      if (Date.now() - last < 1000) return; // one leave fires several events
      last = Date.now();
      setViolations(v => v + 1);
      setShowWarn(true);
    };
    const onVis = () => document.hidden && hit();
    const onFs = () => !document.fullscreenElement && hit();
    const stop = e => e.preventDefault();
    const onKey = e => {
      const k = e.key.toLowerCase();
      if (k === 'printscreen') { navigator.clipboard?.writeText('').catch(() => {}); hit(); }
      // ponytail: keyboard blocking is best-effort; OS screenshot shortcuts (Cmd+Shift+3/4) can't be caught by a page
      if (((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 's', 'p', 'u', 'f'].includes(k)) || k === 'f12') e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);
    const onUnload = e => { e.preventDefault(); e.returnValue = ''; };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', hit);
    document.addEventListener('fullscreenchange', onFs);
    window.addEventListener('beforeunload', onUnload);
    for (const ev of ['copy', 'cut', 'paste', 'contextmenu', 'dragstart']) document.addEventListener(ev, stop);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', hit);
      document.removeEventListener('fullscreenchange', onFs);
      window.removeEventListener('beforeunload', onUnload);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKey);
      for (const ev of ['copy', 'cut', 'paste', 'contextmenu', 'dragstart']) document.removeEventListener(ev, stop);
    };
  }, [started, done]);

  useEffect(() => { if (violations >= MAX_VIOLATIONS && !done && !busy) submitRef.current(); }, [violations]); // eslint-disable-line

  // Statistics
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Unanswered question indices (1-indexed for student readability)
  const unansweredIndices = useMemo(() => {
    const list = [];
    questions.forEach((q, idx) => {
      if (answers[q.id] === undefined) {
        list.push({ index: idx + 1, id: q.id });
      }
    });
    return list;
  }, [questions, answers]);

  function handleStart() {
    setErr('');
    const errors = {};
    if (!me.name.trim()) errors.name = true;
    if (!me.surname.trim()) errors.surname = true;
    if (!me.group.trim()) errors.group = true;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErr(t.fill);
      return;
    }
    document.documentElement.requestFullscreen?.().catch(() => {});
    setStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToQuestion(id) {
    const el = document.getElementById(`q-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('jump-highlight');
      setTimeout(() => el.classList.remove('jump-highlight'), 1200);
    }
    setShowConfirmModal(false);
  }

  async function executeSubmit() {
    setErr('');
    setBusy(true);
    setShowConfirmModal(false);
    try {
      const res = await fetch(`/api/submit/${slug}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...me,
          answers,
          ids: questions.map(q => q.id),
          violations,
        }),
      });
      const r = await res.json();
      setBusy(false);
      if (r.error) {
        setErr(r.error);
      } else {
        setCompletedAt(new Date().toLocaleString());
        setDone(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      setBusy(false);
      setErr(e.message || 'Error submitting test');
    }
  }

  submitRef.current = executeSubmit;

  function handleSubmitClick() {
    setErr('');
    if (unansweredIndices.length > 0) {
      setShowConfirmModal(true);
      return;
    }
    executeSubmit();
  }

  return (
    <>
      {/* Top Header / Brand Bar */}
      <header className="portal-header">
        <div className="portal-brand">
          <div className="portal-logo-icon">🎓</div>
          <div className="portal-brand-text">
            <span className="portal-brand-title">{t.portalName}</span>
            <span className="portal-brand-sub">{t.portalSub}</span>
          </div>
        </div>

        {/* Language selector toggle */}
        <div className="lang-switcher">
          <button
            type="button"
            className={`lang-btn ${lang === 'uz' ? 'active' : ''}`}
            onClick={() => setLang('uz')}
          >
            UZ
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === 'ru' ? 'active' : ''}`}
            onClick={() => setLang('ru')}
          >
            RU
          </button>
        </div>
      </header>

      {/* STATE 1: Completed Screen */}
      {done ? (
        <section className="success-card">
          <div className="success-glow-halo" />
          <div className="success-icon-badge">✓</div>
          <h2 className="success-title">{t.doneTitle}</h2>
          <p className="success-desc">{t.doneDesc}</p>

          <div className="success-summary-box">
            <div className="summary-row">
              <span className="summary-label">{t.summaryStudent}</span>
              <span className="summary-val">{me.name} {me.surname}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">{t.summaryGroup}</span>
              <span className="summary-val">{me.group}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">{t.summaryTest}</span>
              <span className="summary-val">{title || slug}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">{t.summaryQuestions}</span>
              <span className="summary-val">{totalQuestions}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">{t.summaryTime}</span>
              <span className="summary-val">{completedAt}</span>
            </div>
          </div>

          <div className="success-close-hint">{t.closeNote}</div>
        </section>
      ) : !started ? (
        /* STATE 2: Entrance / Registration Screen */
        <section className="hero-welcome-card">
          <span className="badge-tag">{t.examBadge}</span>
          <h1 className="hero-title">{title || slug}</h1>

          {/* Test Meta Info Chips */}
          <div className="test-meta-grid">
            <div className="test-meta-item">
              <span className="meta-icon">📋</span>
              <div className="meta-content">
                <span className="meta-label">Savollar</span>
                <span className="meta-val">{totalQuestions || 25} {t.metaQuestions}</span>
              </div>
            </div>
            <div className="test-meta-item">
              <span className="meta-icon">🎯</span>
              <div className="meta-content">
                <span className="meta-label">Format</span>
                <span className="meta-val">{t.metaType}</span>
              </div>
            </div>
            <div className="test-meta-item">
              <span className="meta-icon">🔒</span>
              <div className="meta-content">
                <span className="meta-label">Urinish</span>
                <span className="meta-val">{t.metaAttempt}</span>
              </div>
            </div>
          </div>

          {/* Student Form Section */}
          <div className="student-form-section">
            <h2 className="section-label">👤 {t.studentInfoHeading}</h2>
            <p className="section-desc">{t.studentInfoDesc}</p>

            {err && (
              <div className="alert-box">
                <span>⚠️</span>
                <span>{err}</span>
              </div>
            )}

            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="student-name" className="input-label">
                  {t.name} <span style={{ color: 'var(--accent-primary)' }}>*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="student-name"
                    type="text"
                    placeholder={t.namePh}
                    maxLength={100}
                    value={me.name}
                    className={fieldErrors.name ? 'input-error' : ''}
                    onChange={e => {
                      setMe({ ...me, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: false });
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="student-surname" className="input-label">
                  {t.surname} <span style={{ color: 'var(--accent-primary)' }}>*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="student-surname"
                    type="text"
                    placeholder={t.surnamePh}
                    maxLength={100}
                    value={me.surname}
                    className={fieldErrors.surname ? 'input-error' : ''}
                    onChange={e => {
                      setMe({ ...me, surname: e.target.value });
                      if (fieldErrors.surname) setFieldErrors({ ...fieldErrors, surname: false });
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                  />
                </div>
              </div>

              <div className="input-group form-grid-full">
                <label htmlFor="student-group" className="input-label">
                  {t.group} <span style={{ color: 'var(--accent-primary)' }}>*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">🎓</span>
                  <input
                    id="student-group"
                    type="text"
                    placeholder={t.groupPh}
                    maxLength={100}
                    value={me.group}
                    className={fieldErrors.group ? 'input-error' : ''}
                    onChange={e => {
                      setMe({ ...me, group: e.target.value });
                      if (fieldErrors.group) setFieldErrors({ ...fieldErrors, group: false });
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                  />
                </div>
              </div>
            </div>

            <button type="button" className="btn-start" onClick={handleStart}>
              {t.start}
            </button>
          </div>
        </section>
      ) : (
        /* STATE 3: Active Test Screen */
        <section>
          {/* Sticky Progress & Status Bar */}
          <div className="exam-sticky-bar">
            <div className="sticky-top-row">
              <div className="student-tag">
                <div className="student-avatar">
                  {me.name.charAt(0).toUpperCase()}
                </div>
                <div className="student-details">
                  <span className="student-name">{me.name} {me.surname}</span>
                  <span className="student-group-chip">{me.group}</span>
                </div>
              </div>

              <div className="progress-pill-badge">
                <span>{answeredCount} / {totalQuestions} {t.answered}</span>
                <span className="progress-pct">({progressPct}%)</span>
              </div>
            </div>

            {/* Continuous progress meter line */}
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Quick-Jump Question Navigation Bar */}
          <div className="jump-nav">
            <div className="jump-header">
              <span className="jump-title">🗺️ {t.questionsMap}</span>
              <span className="jump-status">
                {answeredCount === totalQuestions
                  ? `✓ ${t.allAnswered}`
                  : t.unansweredCount(totalQuestions - answeredCount)}
              </span>
            </div>
            <div className="jump-grid">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                return (
                  <button
                    key={q.id}
                    type="button"
                    className={`jump-pill ${isAnswered ? 'answered' : ''}`}
                    onClick={() => scrollToQuestion(q.id)}
                    title={`Savol ${idx + 1}: ${isAnswered ? 'Belgilangan' : 'Belgilanmagan'}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions List */}
          <div className="questions-container">
            {questions.map((q, i) => {
              const isRu = lang === 'ru' && q.text_ru;
              const questionText = isRu ? q.text_ru : q.text;
              const optionsList = isRu && q.options_ru ? q.options_ru : q.options;
              const selectedIdx = answers[q.id];
              const isAnswered = selectedIdx !== undefined;

              return (
                <article
                  key={q.id}
                  id={`q-${q.id}`}
                  className={`question-card ${isAnswered ? 'answered-card' : ''}`}
                >
                  <div className="question-top-meta">
                    <span className="question-num-badge">
                      {t.questionLabel} {String(i + 1).padStart(2, '0')} / {totalQuestions}
                    </span>
                    <span className="question-status-indicator">
                      {isAnswered ? (
                        <span className="status-answered">✓ {t.answered}</span>
                      ) : (
                        <span className="status-pending">○ {t.pending}</span>
                      )}
                    </span>
                  </div>

                  <h3 className="question-text">
                    <FormattedText text={questionText} />
                  </h3>

                  <div className="options-list">
                    {optionsList.map((optionText, optIdx) => {
                      const isSelected = selectedIdx === optIdx;
                      const letter = OPTION_LETTERS[optIdx] || optIdx + 1;

                      return (
                        <label
                          key={optIdx}
                          className={`option-tile ${isSelected ? 'selected' : ''}`}
                          onClick={() => setAnswers({ ...answers, [q.id]: optIdx })}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="sr-only-radio"
                            checked={isSelected}
                            onChange={() => setAnswers({ ...answers, [q.id]: optIdx })}
                          />
                          <div className="custom-radio">
                            <div className="radio-dot" />
                          </div>
                          <span className="option-letter">{letter}</span>
                          <span className="option-label-text">
                            <FormattedText text={optionText} />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom Action / Submit Bar */}
          <div className="exam-footer-bar">
            {err && (
              <div className="alert-box">
                <span>⚠️</span>
                <span>{err}</span>
              </div>
            )}

            <div className="footer-status-row">
              <div className="footer-status-info">
                <span>📊</span>
                <span>
                  {answeredCount === totalQuestions ? (
                    <strong style={{ color: 'var(--success)' }}>✓ {t.allAnswered}</strong>
                  ) : (
                    <span>{answeredCount} / {totalQuestions} {t.answered} ({t.unansweredCount(totalQuestions - answeredCount)})</span>
                  )}
                </span>
              </div>

              <button
                type="button"
                className="btn-submit-exam"
                disabled={busy}
                onClick={handleSubmitClick}
              >
                {busy ? (
                  <>
                    <span className="spinner" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <span>{t.submit} →</span>
                )}
              </button>
            </div>
          </div>

          <div className="wm" aria-hidden="true">
            {Array.from({ length: 60 }, (_, i) => <span key={i}>{me.surname} {me.name} · {me.group}</span>)}
          </div>

          {showWarn && !done && violations < MAX_VIOLATIONS && (
            <div className="modal-backdrop">
              <div className="modal-box">
                <div className="modal-icon-badge">🚫</div>
                <p className="modal-text">{t.leftWarn(violations, MAX_VIOLATIONS)}</p>
                <div className="modal-actions">
                  <button type="button" className="btn-danger" onClick={() => { setShowWarn(false); document.documentElement.requestFullscreen?.().catch(() => {}); }}>{t.leftOk}</button>
                </div>
              </div>
            </div>
          )}

          {/* Smart Confirmation Modal for Unanswered Questions */}
          {showConfirmModal && (
            <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-icon-badge">⚠️</div>
                <h3 className="modal-title">{t.modalTitle}</h3>
                <p className="modal-text">
                  {t.modalDesc(unansweredIndices.length)}
                </p>

                <div className="unanswered-chips-container">
                  {unansweredIndices.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className="unanswered-chip"
                      onClick={() => scrollToQuestion(item.id)}
                    >
                      #{item.index} {t.questionLabel}
                    </button>
                  ))}
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    {t.modalBack}
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={busy}
                    onClick={executeSubmit}
                  >
                    {busy ? t.submitting : t.modalForce}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
