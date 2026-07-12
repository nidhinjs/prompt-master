# Research Patterns: Weaknesses + Harsh Revised Version

**Date:** 2026-07-12
**File:** Proposed replacement / tightening for `references/patterns.md` → Research Patterns section
**Source of critique:** Full `patterns.md` + `SKILL.md` logic (not README)

---

## 1. Жёсткий разбор текущих Research Patterns (43–51)

### Общая оценка кластера
Текущий research-блок — самый слабый во всём `patterns.md`.

**Главные проблемы:**

- **Инструментальный шум вместо сути исследования**
  Как минимум 4 из 9 паттернов (#47, #48, #49, #50, #51) — это не про исследование, а про:
  - работу с конкретными UI-инструментами (Gamma, video editors)
  - silent defaults настроек
  - character consistency в генеративных моделях
  Они размывают фокус и принадлежат в Cost / Format / Model Patterns.

- **Отсутствие глубины процесса познания**
  Нет ни одного паттерна, который требует от модели:
  - попытки фальсифицировать собственную гипотезу
  - работы с первоисточниками, а не summary
  - обнаружения circular reasoning / self-reinforcing citations
  - контроля scope drift во время исследования

- **Слишком мягкие формулировки**
  Большинство паттернов говорят "добавь X" или "указывай параметры".
  Настоящий research-паттерн должен говорить: **"модель обязана"** + **"иначе это считается failure"**.

- **Плохая разделённость ответственности**
  #45 (citation) — сильный.
  #43 и #44 — приемлемые.
  Остальные — либо слишком узкие, либо не про research.

- **Риск устаревания**
  Паттерны, завязанные на текущие продукты (Gamma, конкретные video tools, Kimi `$web_search` поведение), быстро потеряют актуальность.

**Итог:**
Из 9 паттернов реально сильных и универсальных — только 2–3. Остальные либо нужно перенести, либо сильно переписать.

---

## 2. Жёсткая версия Research Patterns (предлагаемая замена)

Ниже — очищенная и ужесточённая версия.
Фокус только на **качестве исследовательского процесса**, а не на UI/knobs/media-specific деталях.

**Рекомендация:**
Заменить текущий блок Research Patterns (43–51) на этот.
Старые #47, #48, #49, #50, #51 — перенести в Cost Patterns или удалить как слишком узкие.

### Research Patterns (Revised — Harsh Version)

| # | Pattern | Bad Example | Fixed (Mandatory) |
|---|---------|-------------|-------------------|
| **R1** | **Vague or underspecified research goal** | "Tell me about X" / "Do a market analysis on Y" | Reframe as structured Research Brief: goal + enumerated aspects + explicit success criteria + required "Data gaps & confidence" section. Vague goals are rejected. |
| **R2** | **No retrieval when real-time / post-cutoff information is needed** | "What are people saying about X right now?" sent to a model without active search enabled | Force enable of the tool's native retrieval (Web Search / X Search / browse). If the selected record has no retrieval capability, explicitly state limitation and use `Assumed: no live data`. Never silently answer from training data. |
| **R3** | **Citation without source verification (circular or fabricated)** | Model cites sources or makes factual claims without showing it actually opened primary material | For any non-obvious factual claim: model must either (a) provide inline link to the exact source it opened, or (b) mark `[uncertain]`. Self-generated or LLM-summary sources are invalid. Circular citation (citing something the model produced earlier in the same session) is forbidden. |
| **R4** | **Reasoning and retrieval mixed in one incompatible call** | Asking for deep reasoning + live web search in a single turn on tools where these modes are mutually exclusive (e.g. Kimi thinking mode disables `$web_search`) | Split explicitly: retrieval phase first (non-thinking), then reasoning phase over retrieved content. Never pack conflicting modes into one forward pass. |
| **R5** | **No attempt to falsify or consider competing explanations** | Model presents one narrative as definitive without testing alternatives or trying to disprove it | Research output must include at least one section of deliberate falsification or competing hypotheses. "Data gaps & confidence" must address what would change the conclusion. |
| **R6** | **Scope drift during research without explicit approval** | Research starts narrow and gradually expands into unrelated areas without user confirmation | Any expansion beyond the original enumerated aspects must be explicitly flagged and approved before continuing. Otherwise revert to original scope. |
| **R7** | **Over-reliance on secondary sources or LLM summaries** | Model builds conclusions primarily on other AI-generated summaries or tertiary articles instead of primary documents | Prioritize primary sources. When only secondary sources are available, explicitly downgrade confidence and note the distance from primary material. |
| **R8** | **Research without runnable verification of key claims** | Factual conclusions that could be checked programmatically or via quick tool call are left unverified | For any claim that has a low-cost verification path (API call, simple calculation, public dataset), the model must perform or request that verification before stating the claim as fact. |

---

## 3. Что делать дальше (рекомендации)

| Действие | Приоритет | Комментарий |
|----------|-----------|-------------|
| Заменить Research Patterns на R1–R8 выше | Высокий | Текущий блок слишком размытый |
| Перенести #47, #48, #49, #50, #51 в Cost или Format | Средний | Они не про исследование |
| Добавить в SKILL.md Recency Zone | Высокий | Новый пункт self-critique: "Research integrity" — проверка на R3, R5, R7 |
| Добавить в Memory Block | Средний | Поле `Research scope locked` + `Last falsification attempt` |
| Удалить из patterns.md устаревшие tool-specific детали | Средний | Gamma card count, конкретные video re-description правила и т.д. |

---

**Готово к использованию.**
Этот файл можно копировать напрямую в репозиторий как основу для обновления `patterns.md`.

Хочешь версию ещё жёстче (с более императивным языком "модель обязана под угрозой отклонения запроса") — скажи.