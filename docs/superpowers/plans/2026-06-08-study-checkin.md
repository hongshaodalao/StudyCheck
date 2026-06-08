# 学习打卡 Web 应用实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一款纯本地运行的学习打卡 Web 应用，支持每日三科打卡、日历记录、家长密码保护的奖励管理。

**Architecture:** 单页应用（SPA），纯 HTML + CSS + JS，数据存储在 localStorage。通过 JS 控制视图切换（打卡页、记录页、设置页）。遵循 PlayStation 设计语言。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, localStorage API, Canvas API (图片压缩)

---

## 文件结构

```
J:\AIProjects\StudyCheckIn\
├── index.html              # 主 HTML 文件（三个视图容器 + 导航）
├── css/
│   └── styles.css          # 全部样式（设计系统变量 + 组件 + 响应式）
├── js/
│   ├── storage.js          # localStorage 封装（读写、默认值初始化）
│   ├── app.js              # 应用入口、视图路由、导航切换
│   ├── checkin.js          # 打卡页逻辑
│   ├── calendar.js         # 日历记录页逻辑
│   ├── settings.js         # 设置页逻辑（密码验证、奖励规则管理）
│   ├── rewards.js          # 奖励计数、达标检测、庆祝弹窗
│   └── image.js            # 图片压缩工具
└── docs/
    ├── superpowers/
    │   ├── specs/           # 设计文档
    │   └── plans/           # 本实现计划
    └── DESIGN.md            # PlayStation 设计规范
```

---

### Task 1: HTML 骨架 + 导航结构

**Files:**
- Create: `index.html`

- [ ] **Step 1: 创建 index.html 基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>学习打卡</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- PC 顶部导航 -->
  <nav class="nav-top" id="navTop">
    <div class="nav-brand">📚 学习打卡</div>
    <div class="nav-links">
      <a href="#" class="nav-link active" data-view="checkin">打卡</a>
      <a href="#" class="nav-link" data-view="calendar">记录</a>
      <a href="#" class="nav-link" data-view="settings">设置</a>
    </div>
  </nav>

  <!-- 主内容区 -->
  <main class="main-content">
    <!-- 打卡页 -->
    <section class="view" id="viewCheckin"></section>
    <!-- 记录页 -->
    <section class="view hidden" id="viewCalendar"></section>
    <!-- 设置页 -->
    <section class="view hidden" id="viewSettings"></section>
  </main>

  <!-- 手机底部导航 -->
  <nav class="nav-bottom" id="navBottom">
    <a href="#" class="nav-bottom-item active" data-view="checkin">
      <span class="nav-bottom-icon">✓</span>
      <span class="nav-bottom-label">打卡</span>
    </a>
    <a href="#" class="nav-bottom-item" data-view="calendar">
      <span class="nav-bottom-icon">📅</span>
      <span class="nav-bottom-label">记录</span>
    </a>
    <a href="#" class="nav-bottom-item" data-view="settings">
      <span class="nav-bottom-icon">⚙</span>
      <span class="nav-bottom-label">设置</span>
    </a>
  </nav>

  <!-- 弹窗容器 -->
  <div class="modal-overlay hidden" id="modalOverlay">
    <div class="modal" id="modalContent"></div>
  </div>

  <script src="js/storage.js"></script>
  <script src="js/image.js"></script>
  <script src="js/rewards.js"></script>
  <script src="js/checkin.js"></script>
  <script src="js/calendar.js"></script>
  <script src="js/settings.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 在浏览器中打开验证 HTML 结构正确**

---

### Task 2: CSS 设计系统 + 基础样式

**Files:**
- Create: `css/styles.css`

- [ ] **Step 1: 创建 CSS 设计变量和重置样式**

```css
/* ===== 设计系统变量（继承自 DESIGN.md） ===== */
:root {
  /* 色彩 */
  --color-primary: #0070d1;
  --color-primary-pressed: #0064b7;
  --color-primary-active: #004d8d;
  --color-on-primary: #ffffff;
  --color-commerce: #d53b00;
  --color-warning: #c81b3a;
  --color-ink: #000000;
  --color-on-dark: #ffffff;
  --color-body-dark: rgba(255,255,255,0.7);
  --color-mute-dark: rgba(229,229,229,0.55);
  --color-ash-dark: rgba(229,229,229,0.2);
  --color-canvas-dark: #000000;
  --color-surface-elevated: #121314;
  --color-surface-card: #181818;
  --color-hairline-dark: rgba(229,229,229,0.2);
  --color-gold-start: #ffce21;
  --color-gold-end: #ee8e00;
  --color-link-dark: #53b1ff;

  /* 圆角 */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* 间距 */
  --space-xxs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
  --space-section: 96px;

  /* 字体 */
  --font-family: 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-size-display: 35px;
  --font-size-heading: 22px;
  --font-size-body: 18px;
  --font-size-body-sm: 16px;
  --font-size-caption: 14px;
  --font-size-small: 12px;
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
}

/* 重置 */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
  color: var(--color-on-dark);
  background: var(--color-canvas-dark);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
}

input {
  font-family: inherit;
}
```

- [ ] **Step 2: 添加导航样式**

```css
/* ===== 导航 ===== */
/* PC 顶部导航 */
.nav-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xl);
  height: 56px;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-hairline-dark);
}

.nav-brand {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-light);
  letter-spacing: 0.1px;
}

.nav-links {
  display: flex;
  gap: var(--space-lg);
}

.nav-link {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-mute-dark);
  padding: var(--space-xs) 0;
  transition: color 0.2s;
}

.nav-link.active {
  color: var(--color-primary);
}

/* 手机底部导航 */
.nav-bottom {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface-elevated);
  border-top: 1px solid var(--color-hairline-dark);
  justify-content: space-around;
  padding: var(--space-sm) 0;
  z-index: 100;
}

.nav-bottom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xxs);
  color: var(--color-mute-dark);
  font-size: var(--font-size-small);
  transition: color 0.2s;
}

.nav-bottom-item.active {
  color: var(--color-primary);
}

.nav-bottom-icon {
  font-size: 18px;
}
```

- [ ] **Step 3: 添加通用组件样式（卡片、按钮、弹窗）**

```css
/* ===== 主内容 ===== */
.main-content {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-xl);
  padding-bottom: var(--space-xl);
}

.view.hidden {
  display: none;
}

/* ===== 卡片 ===== */
.card {
  background: var(--color-surface-card);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
}

/* ===== 按钮 ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  height: 48px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.45px;
  transition: background-color 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.btn-primary:hover {
  background: var(--color-primary-pressed);
}

.btn-secondary {
  background: transparent;
  color: var(--color-on-dark);
  border: 1px solid var(--color-hairline-dark);
}

.btn-danger {
  background: var(--color-warning);
  color: var(--color-on-primary);
}

.btn-disabled {
  background: var(--color-surface-elevated);
  color: var(--color-ash-dark);
  cursor: not-allowed;
}

.btn-full {
  width: 100%;
}

/* ===== 输入框 ===== */
.input {
  width: 100%;
  background: var(--color-canvas-dark);
  border: 1px solid var(--color-ash-dark);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  height: 48px;
  font-size: var(--font-size-body);
  color: var(--color-on-dark);
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--color-primary);
  border-width: 2px;
  padding: 11px 15px;
}

.input-label {
  display: block;
  font-size: var(--font-size-small);
  color: var(--color-mute-dark);
  margin-bottom: var(--space-xxs);
}

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--space-lg);
}

.modal-overlay.hidden {
  display: none;
}

.modal {
  background: var(--color-surface-card);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  float: right;
  background: none;
  color: var(--color-mute-dark);
  font-size: 20px;
  line-height: 1;
}

/* ===== 响应式 ===== */
@media (max-width: 767px) {
  .nav-top {
    display: none;
  }

  .nav-bottom {
    display: flex;
  }

  .main-content {
    padding: var(--space-md);
    padding-bottom: 80px; /* 为底部导航留空间 */
  }
}
```

- [ ] **Step 4: 浏览器中验证样式加载正确**

---

### Task 3: 数据层（storage.js）

**Files:**
- Create: `js/storage.js`

- [ ] **Step 1: 创建 localStorage 封装模块**

```javascript
// js/storage.js - localStorage 数据层

const Storage = (() => {
  const KEYS = {
    CHECKINS: 'checkins',
    REWARD_RULES: 'rewardRules',
    REWARD_HISTORY: 'rewardHistory',
    PARENT_PASSWORD: 'parentPassword'
  };

  const DEFAULT_PASSWORD = '123456';

  function _get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // 初始化默认值
  function init() {
    if (!_get(KEYS.PARENT_PASSWORD)) {
      _set(KEYS.PARENT_PASSWORD, DEFAULT_PASSWORD);
    }
    if (!_get(KEYS.CHECKINS)) {
      _set(KEYS.CHECKINS, {});
    }
    if (!_get(KEYS.REWARD_RULES)) {
      _set(KEYS.REWARD_RULES, []);
    }
    if (!_get(KEYS.REWARD_HISTORY)) {
      _set(KEYS.REWARD_HISTORY, []);
    }
  }

  // ===== 打卡记录 =====
  function getCheckins() {
    return _get(KEYS.CHECKINS) || {};
  }

  function getCheckin(date) {
    const checkins = getCheckins();
    return checkins[date] || { english: false, math: false, chinese: false };
  }

  function setCheckin(date, subjects) {
    const checkins = getCheckins();
    checkins[date] = subjects;
    _set(KEYS.CHECKINS, checkins);
  }

  function isDayComplete(date) {
    const c = getCheckin(date);
    return c.english && c.math && c.chinese;
  }

  function getCompletedDays() {
    const checkins = getCheckins();
    return Object.keys(checkins).filter(date => {
      const c = checkins[date];
      return c.english && c.math && c.chinese;
    }).length;
  }

  function getCompletedDaysInMonth(year, month) {
    const checkins = getCheckins();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return Object.keys(checkins)
      .filter(date => date.startsWith(prefix))
      .filter(date => {
        const c = checkins[date];
        return c.english && c.math && c.chinese;
      }).length;
  }

  // ===== 奖励规则 =====
  function getRewardRules() {
    return _get(KEYS.REWARD_RULES) || [];
  }

  function addRewardRule(rule) {
    const rules = getRewardRules();
    rule.id = Date.now().toString();
    rules.push(rule);
    _set(KEYS.REWARD_RULES, rules);
    return rule;
  }

  function updateRewardRule(id, updates) {
    const rules = getRewardRules();
    const index = rules.findIndex(r => r.id === id);
    if (index !== -1) {
      rules[index] = { ...rules[index], ...updates };
      _set(KEYS.REWARD_RULES, rules);
    }
  }

  function deleteRewardRule(id) {
    const rules = getRewardRules().filter(r => r.id !== id);
    _set(KEYS.REWARD_RULES, rules);
  }

  // ===== 奖励记录 =====
  function getRewardHistory() {
    return _get(KEYS.REWARD_HISTORY) || [];
  }

  function addRewardRecord(record) {
    const history = getRewardHistory();
    history.push(record);
    _set(KEYS.REWARD_HISTORY, history);
  }

  function getRewardAtDate(date) {
    return getRewardHistory().find(r => r.achievedAt === date);
  }

  // ===== 密码 =====
  function getPassword() {
    return _get(KEYS.PARENT_PASSWORD) || DEFAULT_PASSWORD;
  }

  function verifyPassword(pwd) {
    return getPassword() === pwd;
  }

  function changePassword(oldPwd, newPwd) {
    if (!verifyPassword(oldPwd)) return false;
    _set(KEYS.PARENT_PASSWORD, newPwd);
    return true;
  }

  // ===== 清除数据 =====
  function clearAllRecords() {
    _set(KEYS.CHECKINS, {});
    _set(KEYS.REWARD_HISTORY, []);
  }

  return {
    init,
    getCheckins, getCheckin, setCheckin, isDayComplete,
    getCompletedDays, getCompletedDaysInMonth,
    getRewardRules, addRewardRule, updateRewardRule, deleteRewardRule,
    getRewardHistory, addRewardRecord, getRewardAtDate,
    getPassword, verifyPassword, changePassword,
    clearAllRecords
  };
})();
```

- [ ] **Step 2: 在浏览器控制台中测试基本读写操作**

```javascript
// 浏览器控制台中执行：
Storage.init();
Storage.setCheckin('2026-06-08', { english: true, math: true, chinese: true });
console.log(Storage.isDayComplete('2026-06-08')); // 应输出 true
console.log(Storage.getCompletedDays()); // 应输出 1
```

---

### Task 4: 图片压缩工具（image.js）

**Files:**
- Create: `js/image.js`

- [ ] **Step 1: 创建图片压缩模块**

```javascript
// js/image.js - 图片压缩工具

const ImageUtil = (() => {
  const MAX_SIZE = 300;
  const QUALITY = 0.7;

  /**
   * 压缩图片为 base64
   * @param {File} file - 图片文件
   * @returns {Promise<string>} base64 数据 URL
   */
  function compress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // 等比缩放
          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', QUALITY);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 格式化文件大小
   * @param {string} base64 - base64 数据
   * @returns {string} 可读的文件大小
   */
  function formatSize(base64) {
    const bytes = Math.round((base64.length * 3) / 4);
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  return { compress, formatSize };
})();
```

- [ ] **Step 2: 浏览器控制台中测试图片压缩**

---

### Task 5: 奖励系统（rewards.js）

**Files:**
- Create: `js/rewards.js`

- [ ] **Step 1: 创建奖励检测和弹窗模块**

```javascript
// js/rewards.js - 奖励系统

const Rewards = (() => {
  /**
   * 检查是否有新达成的奖励，返回新达成的奖励列表
   * @returns {Array} 新达成的奖励记录
   */
  function checkNewRewards() {
    const completedDays = Storage.getCompletedDays();
    const rules = Storage.getRewardRules().sort((a, b) => a.days - b.days);
    const history = Storage.getRewardHistory();
    const newRewards = [];

    for (const rule of rules) {
      if (completedDays >= rule.days) {
        // 检查是否已有该规则的达标记录
        const alreadyAchieved = history.some(h =>
          h.days === rule.days && h.reward === rule.reward
        );
        if (!alreadyAchieved) {
          const record = {
            achievedAt: _today(),
            days: rule.days,
            reward: rule.reward,
            image: rule.image || null
          };
          Storage.addRewardRecord(record);
          newRewards.push(record);
        }
      }
    }

    return newRewards;
  }

  /**
   * 显示奖励庆祝弹窗
   * @param {Array} rewards - 奖励记录列表
   */
  function showCelebration(rewards) {
    if (!rewards.length) return;

    const reward = rewards[0]; // 显示第一个
    const html = `
      <button class="modal-close" onclick="App.closeModal()">✕</button>
      <div style="text-align:center;padding:var(--space-md) 0;">
        ${reward.image
          ? `<img src="${reward.image}" style="width:100%;max-height:200px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:var(--space-md);">`
          : `<div style="font-size:64px;margin-bottom:var(--space-md);">🏆</div>`
        }
        <div style="font-size:var(--font-size-small);color:var(--color-mute-dark);margin-bottom:var(--space-sm);">
          ${reward.achievedAt}
        </div>
        <div style="background:linear-gradient(135deg, rgba(255,206,33,0.15), rgba(238,142,0,0.15));border:1px solid rgba(255,206,33,0.3);border-radius:var(--radius-md);padding:var(--space-md);margin-bottom:var(--space-lg);">
          <div style="font-size:var(--font-size-small);color:var(--color-gold-start);margin-bottom:var(--space-xxs);">
            累计打卡 ${reward.days} 天
          </div>
          <div style="font-size:var(--font-size-heading);font-weight:var(--font-weight-semibold);">
            ${reward.reward}
          </div>
        </div>
        <div style="font-size:var(--font-size-caption);color:var(--color-mute-dark);">
          ${rewards.length > 1 ? `还有 ${rewards.length - 1} 个奖励待查看` : '继续加油！'}
        </div>
      </div>
    `;

    App.showModal(html);

    // 如果有多个奖励，显示下一个
    if (rewards.length > 1) {
      setTimeout(() => {
        showCelebration(rewards.slice(1));
      }, 3000);
    }
  }

  /**
   * 计算距下一个奖励还需多少天
   * @returns {{ nextDays: number, currentDays: number }|null}
   */
  function getNextRewardProgress() {
    const completedDays = Storage.getCompletedDays();
    const rules = Storage.getRewardRules().sort((a, b) => a.days - b.days);
    const history = Storage.getRewardHistory();

    for (const rule of rules) {
      const achieved = history.some(h =>
        h.days === rule.days && h.reward === rule.reward
      );
      if (!achieved) {
        return {
          nextDays: rule.days,
          currentDays: completedDays,
          remaining: rule.days - completedDays
        };
      }
    }
    return null;
  }

  function _today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return { checkNewRewards, showCelebration, getNextRewardProgress };
})();
```

- [ ] **Step 2: 浏览器控制台中测试奖励检测逻辑**

---

### Task 6: 打卡页（checkin.js）

**Files:**
- Create: `js/checkin.js`

- [ ] **Step 1: 创建打卡页渲染和交互逻辑**

```javascript
// js/checkin.js - 打卡页

const CheckinPage = (() => {
  const SUBJECTS = [
    { key: 'english', label: '英语', icon: '📚' },
    { key: 'math', label: '数学', icon: '📐' },
    { key: 'chinese', label: '语文', icon: '📖' }
  ];

  function render() {
    const container = document.getElementById('viewCheckin');
    const today = _today();
    const checkin = Storage.getCheckin(today);
    const isComplete = checkin.english && checkin.math && checkin.chinese;

    container.innerHTML = `
      <div class="checkin-header">
        <div class="checkin-date">${_formatDate(today)}</div>
        <h1 class="checkin-title">今日打卡</h1>
      </div>
      <div class="card checkin-card">
        ${SUBJECTS.map(s => _renderSubject(s, checkin[s.key], isComplete)).join('')}
      </div>
      <div class="checkin-status">
        ${isComplete
          ? '<span class="status-complete">✅ 今日已完成</span>'
          : '<span class="status-pending">完成全部科目后自动打卡</span>'
        }
      </div>
      ${_renderRewardProgress()}
    `;

    // 绑定点击事件
    if (!isComplete) {
      SUBJECTS.forEach(s => {
        const el = container.querySelector(`[data-subject="${s.key}"]`);
        if (el) {
          el.addEventListener('click', () => _toggleSubject(s.key));
        }
      });
    }
  }

  function _renderSubject(subject, isChecked, isLocked) {
    return `
      <div class="checkin-subject ${isLocked ? 'locked' : ''}" data-subject="${subject.key}">
        <span class="checkin-subject-icon">${subject.icon}</span>
        <span class="checkin-subject-label">${subject.label}</span>
        <div class="checkin-checkbox ${isChecked ? 'checked' : ''}">
          ${isChecked ? '✓' : ''}
        </div>
      </div>
    `;
  }

  function _renderRewardProgress() {
    const progress = Rewards.getNextRewardProgress();
    if (!progress) return '';

    const percent = Math.min(100, (progress.currentDays / progress.nextDays) * 100);
    return `
      <div class="card reward-progress">
        <div class="reward-progress-header">
          <span>🏆 奖励进度</span>
          <span class="reward-progress-count">${progress.currentDays} / ${progress.nextDays} 天</span>
        </div>
        <div class="reward-progress-bar">
          <div class="reward-progress-fill" style="width:${percent}%"></div>
        </div>
        <div class="reward-progress-hint">
          ${progress.remaining > 0
            ? `再打卡 ${progress.remaining} 天即可获得奖励！`
            : '已达成！'
          }
        </div>
      </div>
    `;
  }

  function _toggleSubject(key) {
    const today = _today();
    const checkin = Storage.getCheckin(today);
    checkin[key] = !checkin[key];
    Storage.setCheckin(today, checkin);

    // 检查是否三科全完成
    const wasComplete = Storage.isDayComplete(today);
    render();

    // 如果刚完成，检查奖励
    if (checkin.english && checkin.math && checkin.chinese) {
      const newRewards = Rewards.checkNewRewards();
      if (newRewards.length) {
        setTimeout(() => Rewards.showCelebration(newRewards), 500);
      }
    }
  }

  function _today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function _formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
  }

  return { render };
})();
```

- [ ] **Step 2: 添加打卡页 CSS 样式**

在 `css/styles.css` 末尾追加：

```css
/* ===== 打卡页 ===== */
.checkin-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.checkin-date {
  font-size: var(--font-size-small);
  color: var(--color-mute-dark);
  margin-bottom: var(--space-xxs);
}

.checkin-title {
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-light);
  letter-spacing: 0.1px;
}

.checkin-card {
  margin-bottom: var(--space-lg);
}

.checkin-subject {
  display: flex;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-hairline-dark);
  cursor: pointer;
  transition: opacity 0.2s;
}

.checkin-subject:last-child {
  border-bottom: none;
}

.checkin-subject.locked {
  cursor: default;
  opacity: 0.7;
}

.checkin-subject-icon {
  font-size: 20px;
  margin-right: var(--space-sm);
}

.checkin-subject-label {
  flex: 1;
  font-size: var(--font-size-body);
}

.checkin-checkbox {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-ash-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-primary);
  transition: all 0.2s;
}

.checkin-checkbox.checked {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.checkin-status {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.status-complete {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.status-pending {
  color: var(--color-mute-dark);
  font-size: var(--font-size-caption);
}

/* ===== 奖励进度条 ===== */
.reward-progress {
  margin-top: var(--space-lg);
}

.reward-progress-header {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-caption);
  margin-bottom: var(--space-xs);
}

.reward-progress-count {
  font-weight: var(--font-weight-semibold);
}

.reward-progress-bar {
  height: 8px;
  background: var(--color-ash-dark);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.reward-progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s;
}

.reward-progress-hint {
  font-size: var(--font-size-small);
  color: var(--color-mute-dark);
  margin-top: var(--space-xs);
}
```

- [ ] **Step 3: 浏览器中验证打卡页显示和交互**

---

### Task 7: 日历记录页（calendar.js）

**Files:**
- Create: `js/calendar.js`

- [ ] **Step 1: 创建日历页渲染和交互逻辑**

```javascript
// js/calendar.js - 日历记录页

const CalendarPage = (() => {
  let currentYear, currentMonth;

  function init() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;
  }

  function render() {
    const container = document.getElementById('viewCalendar');
    const today = _today();
    const checkins = Storage.getCheckins();
    const rewardHistory = Storage.getRewardHistory();

    // 构建奖励日期映射
    const rewardMap = {};
    rewardHistory.forEach(r => { rewardMap[r.achievedAt] = r; });

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

    container.innerHTML = `
      <div class="calendar-nav">
        <button class="calendar-nav-btn" id="calPrev">◀</button>
        <span class="calendar-nav-title">${currentYear}年${currentMonth}月</span>
        <button class="calendar-nav-btn" id="calNext">▶</button>
      </div>
      <div class="calendar-weekdays">
        ${['日', '一', '二', '三', '四', '五', '六'].map(d =>
          `<span class="calendar-weekday">${d}</span>`
        ).join('')}
      </div>
      <div class="calendar-grid">
        ${_renderDays(firstDayWeek, daysInMonth, today, checkins, rewardMap)}
      </div>
      <div class="calendar-legend">
        <span class="legend-item"><span class="legend-dot legend-dot-complete"></span>已完成</span>
        <span class="legend-item"><span class="legend-dot legend-dot-reward"></span>获得奖励</span>
      </div>
      <div class="card calendar-stats">
        <div class="calendar-stat">
          <span class="calendar-stat-label">本月完成</span>
          <span class="calendar-stat-value">${Storage.getCompletedDaysInMonth(currentYear, currentMonth)} 天</span>
        </div>
        <div class="calendar-stat">
          <span class="calendar-stat-label">累计完成</span>
          <span class="calendar-stat-value">${Storage.getCompletedDays()} 天</span>
        </div>
      </div>
    `;

    // 绑定事件
    document.getElementById('calPrev').addEventListener('click', () => _prevMonth());
    document.getElementById('calNext').addEventListener('click', () => _nextMonth());

    // 绑定奖励日点击
    container.querySelectorAll('.calendar-day-reward').forEach(el => {
      el.addEventListener('click', () => {
        const date = el.dataset.date;
        _showRewardDetail(date);
      });
    });
  }

  function _renderDays(firstDayWeek, daysInMonth, today, checkins, rewardMap) {
    let html = '';
    // 填充前置空白
    for (let i = 0; i < firstDayWeek; i++) {
      html += '<span class="calendar-day calendar-day-empty"></span>';
    }
    // 渲染日期
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === today;
      const isComplete = checkins[dateStr] &&
        checkins[dateStr].english &&
        checkins[dateStr].math &&
        checkins[dateStr].chinese;
      const isReward = !!rewardMap[dateStr];

      let classes = 'calendar-day';
      if (isReward) {
        classes += ' calendar-day-reward';
      } else if (isComplete) {
        classes += ' calendar-day-complete';
      }
      if (isToday) {
        classes += ' calendar-day-today';
      }

      const rewardIcon = isReward ? '<span class="calendar-reward-icon">🏆</span>' : '';
      html += `<span class="${classes}" data-date="${dateStr}">${d}${rewardIcon}</span>`;
    }
    return html;
  }

  function _showRewardDetail(date) {
    const record = Storage.getRewardAtDate(date);
    if (!record) return;

    const progress = Rewards.getNextRewardProgress();
    const remainingText = progress
      ? `距下一个奖励还需 ${progress.remaining} 天`
      : '已获得全部奖励 🎉';

    const html = `
      <button class="modal-close" onclick="App.closeModal()">✕</button>
      <div style="text-align:center;padding:var(--space-md) 0;">
        ${record.image
          ? `<img src="${record.image}" style="width:100%;max-height:200px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:var(--space-md);">`
          : `<div style="font-size:48px;margin-bottom:var(--space-md);">🏆</div>`
        }
        <div style="font-size:var(--font-size-small);color:var(--color-mute-dark);margin-bottom:var(--space-sm);">
          ${record.achievedAt}
        </div>
        <div style="background:linear-gradient(135deg, rgba(255,206,33,0.15), rgba(238,142,0,0.15));border:1px solid rgba(255,206,33,0.3);border-radius:var(--radius-md);padding:var(--space-md);margin-bottom:var(--space-lg);">
          <div style="font-size:var(--font-size-small);color:var(--color-gold-start);margin-bottom:var(--space-xxs);">
            累计打卡 ${record.days} 天
          </div>
          <div style="font-size:var(--font-size-heading);font-weight:var(--font-weight-semibold);">
            ${record.reward}
          </div>
        </div>
        <div style="font-size:var(--font-size-caption);color:var(--color-mute-dark);">
          ${remainingText}
        </div>
      </div>
    `;

    App.showModal(html);
  }

  function _prevMonth() {
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    render();
  }

  function _nextMonth() {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    render();
  }

  function _today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return { init, render };
})();
```

- [ ] **Step 2: 添加日历页 CSS 样式**

在 `css/styles.css` 末尾追加：

```css
/* ===== 日历页 ===== */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.calendar-nav-btn {
  background: none;
  color: var(--color-primary);
  font-size: var(--font-size-body);
  padding: var(--space-xs);
}

.calendar-nav-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  min-width: 120px;
  text-align: center;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--color-mute-dark);
  margin-bottom: var(--space-xs);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-xxs);
  text-align: center;
  margin-bottom: var(--space-md);
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-body-sm);
  border-radius: var(--radius-full);
  position: relative;
  color: var(--color-body-dark);
}

.calendar-day-empty {
  visibility: hidden;
}

.calendar-day-complete {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: var(--font-weight-semibold);
}

.calendar-day-reward {
  background: linear-gradient(135deg, var(--color-gold-start), var(--color-gold-end));
  color: var(--color-ink);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  box-shadow: 0 0 8px rgba(255,206,33,0.4);
}

.calendar-day-today {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.calendar-reward-icon {
  position: absolute;
  top: -2px;
  right: 2px;
  font-size: 10px;
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  font-size: var(--font-size-small);
  color: var(--color-mute-dark);
  margin-bottom: var(--space-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-xxs);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  display: inline-block;
}

.legend-dot-complete {
  background: var(--color-primary);
}

.legend-dot-reward {
  background: linear-gradient(135deg, var(--color-gold-start), var(--color-gold-end));
}

.calendar-stats {
  display: flex;
  justify-content: space-around;
}

.calendar-stat {
  text-align: center;
}

.calendar-stat-label {
  display: block;
  font-size: var(--font-size-small);
  color: var(--color-mute-dark);
  margin-bottom: var(--space-xxs);
}

.calendar-stat-value {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
}
```

- [ ] **Step 3: 浏览器中验证日历显示和月份切换**

---

### Task 8: 设置页（settings.js）

**Files:**
- Create: `js/settings.js`

- [ ] **Step 1: 创建设置页渲染和交互逻辑**

```javascript
// js/settings.js - 设置页

const SettingsPage = (() => {
  let isAuthenticated = false;
  let editingRuleId = null;

  function render() {
    const container = document.getElementById('viewSettings');

    if (!isAuthenticated) {
      container.innerHTML = _renderPasswordPrompt();
      _bindPasswordEvents(container);
    } else {
      container.innerHTML = _renderSettingsPanel();
      _bindSettingsEvents(container);
    }
  }

  // ===== 密码验证界面 =====
  function _renderPasswordPrompt() {
    return `
      <div class="settings-password-card card">
        <h2 class="settings-title">🔒 家长设置</h2>
        <div class="settings-password-form">
          <label class="input-label">请输入家长密码</label>
          <input type="password" class="input" id="settingsPasswordInput" placeholder="请输入密码">
          <div class="settings-password-error hidden" id="settingsPasswordError">密码错误</div>
          <button class="btn btn-primary btn-full" id="settingsPasswordSubmit">验证</button>
        </div>
      </div>
    `;
  }

  function _bindPasswordEvents(container) {
    const input = container.querySelector('#settingsPasswordInput');
    const btn = container.querySelector('#settingsPasswordSubmit');
    const error = container.querySelector('#settingsPasswordError');

    const submit = () => {
      if (Storage.verifyPassword(input.value)) {
        isAuthenticated = true;
        render();
      } else {
        error.classList.remove('hidden');
        input.value = '';
      }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
  }

  // ===== 设置面板 =====
  function _renderSettingsPanel() {
    const rules = Storage.getRewardRules();
    return `
      <h2 class="settings-title">家长设置</h2>

      <!-- 密码管理 -->
      <div class="card settings-section">
        <h3 class="settings-section-title">🔒 密码管理</h3>
        <div class="settings-form-group">
          <label class="input-label">当前密码</label>
          <input type="password" class="input" id="pwdCurrent" placeholder="请输入当前密码">
        </div>
        <div class="settings-form-group">
          <label class="input-label">新密码</label>
          <input type="password" class="input" id="pwdNew" placeholder="请输入新密码">
        </div>
        <div class="settings-form-group">
          <label class="input-label">确认新密码</label>
          <input type="password" class="input" id="pwdConfirm" placeholder="再次输入新密码">
        </div>
        <div class="settings-password-error hidden" id="pwdError"></div>
        <button class="btn btn-primary btn-full" id="btnChangePwd">修改密码</button>
      </div>

      <!-- 奖励规则 -->
      <div class="card settings-section">
        <div class="settings-section-header">
          <h3 class="settings-section-title">🏆 奖励规则</h3>
          <button class="btn btn-primary btn-sm" id="btnAddRule">+ 添加</button>
        </div>
        <div id="rulesList">
          ${rules.length ? rules.map(r => _renderRuleItem(r)).join('') : '<div class="settings-empty">暂无奖励规则</div>'}
        </div>
      </div>

      <!-- 添加/编辑表单（默认隐藏） -->
      <div class="card settings-section hidden" id="ruleFormSection">
        <h3 class="settings-section-title" id="ruleFormTitle">✏️ 添加奖励规则</h3>
        <div class="settings-form-group">
          <label class="input-label">累计打卡天数</label>
          <input type="number" class="input" id="ruleDays" placeholder="例如：10" min="1">
        </div>
        <div class="settings-form-group">
          <label class="input-label">奖励内容</label>
          <input type="text" class="input" id="ruleReward" placeholder="例如：看一集动画片">
        </div>
        <div class="settings-form-group">
          <label class="input-label">奖励图片（可选）</label>
          <div class="settings-upload-area" id="uploadArea">
            <div class="settings-upload-icon">🖼️</div>
            <div class="settings-upload-text">点击上传图片</div>
            <div class="settings-upload-hint">支持 JPG、PNG，自动压缩至 300×300</div>
          </div>
          <input type="file" id="ruleImageInput" accept="image/*" style="display:none">
          <div class="settings-image-preview hidden" id="imagePreview">
            <img id="previewImg" class="settings-preview-img">
            <div class="settings-preview-info">
              <span id="previewName"></span>
              <span id="previewSize" class="settings-preview-size"></span>
            </div>
            <button class="settings-preview-remove" id="removeImage">移除</button>
          </div>
        </div>
        <div class="settings-form-actions">
          <button class="btn btn-primary" id="btnSaveRule">保存</button>
          <button class="btn btn-secondary" id="btnCancelRule">取消</button>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="card settings-section">
        <h3 class="settings-section-title">⚠️ 数据管理</h3>
        <button class="btn btn-danger btn-full" id="btnClearAll">清除所有打卡和奖励记录</button>
        <div class="settings-danger-hint">将同时删除所有打卡记录和奖励记录，此操作不可撤销</div>
      </div>
    `;
  }

  function _renderRuleItem(rule) {
    return `
      <div class="rule-item" data-rule-id="${rule.id}">
        <div class="rule-item-info">
          ${rule.image
            ? `<img src="${rule.image}" class="rule-item-thumb">`
            : `<div class="rule-item-icon">🏆</div>`
          }
          <div>
            <div class="rule-item-days">累计 ${rule.days} 天</div>
            <div class="rule-item-reward">${rule.reward}</div>
          </div>
        </div>
        <div class="rule-item-actions">
          <button class="rule-action-btn rule-action-edit" data-id="${rule.id}">编辑</button>
          <button class="rule-action-btn rule-action-delete" data-id="${rule.id}">删除</button>
        </div>
      </div>
    `;
  }

  // ===== 事件绑定 =====
  function _bindSettingsEvents(container) {
    // 修改密码
    container.querySelector('#btnChangePwd')?.addEventListener('click', _handleChangePassword);

    // 添加规则
    container.querySelector('#btnAddRule')?.addEventListener('click', () => {
      editingRuleId = null;
      _showRuleForm(container);
    });

    // 编辑规则
    container.querySelectorAll('.rule-action-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        editingRuleId = btn.dataset.id;
        _showRuleForm(container);
      });
    });

    // 删除规则
    container.querySelectorAll('.rule-action-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('确定删除此奖励规则？')) {
          Storage.deleteRewardRule(btn.dataset.id);
          render();
        }
      });
    });

    // 图片上传
    const uploadArea = container.querySelector('#uploadArea');
    const fileInput = container.querySelector('#ruleImageInput');
    uploadArea?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', _handleImageUpload);

    // 移除图片
    container.querySelector('#removeImage')?.addEventListener('click', () => {
      _clearImagePreview(container);
    });

    // 保存规则
    container.querySelector('#btnSaveRule')?.addEventListener('click', () => _handleSaveRule(container));

    // 取消
    container.querySelector('#btnCancelRule')?.addEventListener('click', () => {
      container.querySelector('#ruleFormSection').classList.add('hidden');
      editingRuleId = null;
    });

    // 清除数据
    container.querySelector('#btnClearAll')?.addEventListener('click', () => {
      if (confirm('确定清除所有打卡和奖励记录？此操作不可撤销！')) {
        Storage.clearAllRecords();
        alert('已清除所有记录');
        render();
      }
    });
  }

  function _handleChangePassword() {
    const current = document.getElementById('pwdCurrent').value;
    const newPwd = document.getElementById('pwdNew').value;
    const confirm = document.getElementById('pwdConfirm').value;
    const errorEl = document.getElementById('pwdError');

    if (!current) {
      errorEl.textContent = '请输入当前密码';
      errorEl.classList.remove('hidden');
      return;
    }
    if (!newPwd) {
      errorEl.textContent = '新密码不能为空';
      errorEl.classList.remove('hidden');
      return;
    }
    if (newPwd !== confirm) {
      errorEl.textContent = '两次输入的新密码不一致';
      errorEl.classList.remove('hidden');
      return;
    }
    if (!Storage.changePassword(current, newPwd)) {
      errorEl.textContent = '当前密码错误';
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    alert('密码修改成功');
    document.getElementById('pwdCurrent').value = '';
    document.getElementById('pwdNew').value = '';
    document.getElementById('pwdConfirm').value = '';
  }

  function _showRuleForm(container) {
    const section = container.querySelector('#ruleFormSection');
    const title = container.querySelector('#ruleFormTitle');
    section.classList.remove('hidden');

    if (editingRuleId) {
      const rule = Storage.getRewardRules().find(r => r.id === editingRuleId);
      title.textContent = '✏️ 编辑奖励规则';
      document.getElementById('ruleDays').value = rule.days;
      document.getElementById('ruleReward').value = rule.reward;
      if (rule.image) {
        _showImagePreview(container, rule.image, '已上传');
      }
    } else {
      title.textContent = '✏️ 添加奖励规则';
      document.getElementById('ruleDays').value = '';
      document.getElementById('ruleReward').value = '';
      _clearImagePreview(container);
    }

    section.scrollIntoView({ behavior: 'smooth' });
  }

  async function _handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await ImageUtil.compress(file);
      const container = document.getElementById('viewSettings');
      _showImagePreview(container, base64, file.name);
    } catch {
      alert('图片处理失败，请重试');
    }
  }

  function _showImagePreview(container, base64, name) {
    const uploadArea = container.querySelector('#uploadArea');
    const preview = container.querySelector('#imagePreview');
    const img = container.querySelector('#previewImg');
    const nameEl = container.querySelector('#previewName');
    const sizeEl = container.querySelector('#previewSize');

    uploadArea.classList.add('hidden');
    preview.classList.remove('hidden');
    img.src = base64;
    nameEl.textContent = name;
    sizeEl.textContent = ImageUtil.formatSize(base64);
  }

  function _clearImagePreview(container) {
    const uploadArea = container.querySelector('#uploadArea');
    const preview = container.querySelector('#imagePreview');
    const fileInput = container.querySelector('#ruleImageInput');

    uploadArea.classList.remove('hidden');
    preview.classList.add('hidden');
    fileInput.value = '';
  }

  function _handleSaveRule(container) {
    const days = parseInt(document.getElementById('ruleDays').value);
    const reward = document.getElementById('ruleReward').value.trim();
    const preview = container.querySelector('#imagePreview');
    const img = preview.classList.contains('hidden') ? null : document.getElementById('previewImg').src;

    if (!days || days < 1) {
      alert('请输入有效的天数');
      return;
    }
    if (!reward) {
      alert('请输入奖励内容');
      return;
    }

    if (editingRuleId) {
      Storage.updateRewardRule(editingRuleId, { days, reward, image: img });
    } else {
      Storage.addRewardRule({ days, reward, image: img });
    }

    editingRuleId = null;
    render();
  }

  function resetAuth() {
    isAuthenticated = false;
  }

  return { render, resetAuth };
})();
```

- [ ] **Step 2: 添加设置页 CSS 样式**

在 `css/styles.css` 末尾追加：

```css
/* ===== 设置页 ===== */
.settings-title {
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-light);
  text-align: center;
  margin-bottom: var(--space-xl);
}

.settings-section {
  margin-bottom: var(--space-lg);
}

.settings-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.settings-section-title {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-md);
}

.settings-section-header .settings-section-title {
  margin-bottom: 0;
}

.settings-form-group {
  margin-bottom: var(--space-sm);
}

.settings-password-card {
  max-width: 400px;
  margin: var(--space-xl) auto;
}

.settings-password-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.settings-password-error {
  color: var(--color-warning);
  font-size: var(--font-size-small);
  text-align: center;
}

.settings-empty {
  text-align: center;
  color: var(--color-mute-dark);
  font-size: var(--font-size-caption);
  padding: var(--space-lg) 0;
}

.settings-form-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.settings-form-actions .btn {
  flex: 1;
}

.settings-danger-hint {
  font-size: var(--font-size-small);
  color: var(--color-mute-dark);
  text-align: center;
  margin-top: var(--space-xs);
}

/* 规则列表 */
.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.rule-item-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.rule-item-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
}

.rule-item-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.rule-item-days {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
}

.rule-item-reward {
  font-size: var(--font-size-small);
  color: var(--color-mute-dark);
}

.rule-item-actions {
  display: flex;
  gap: var(--space-xs);
}

.rule-action-btn {
  background: none;
  font-size: var(--font-size-small);
  padding: var(--space-xxs) var(--space-xs);
}

.rule-action-edit {
  color: var(--color-primary);
}

.rule-action-delete {
  color: var(--color-warning);
}

/* 图片上传 */
.settings-upload-area {
  border: 2px dashed var(--color-ash-dark);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.settings-upload-area:hover {
  border-color: var(--color-primary);
}

.settings-upload-icon {
  font-size: 28px;
  margin-bottom: var(--space-xxs);
}

.settings-upload-text {
  font-size: var(--font-size-small);
  color: var(--color-mute-dark);
}

.settings-upload-hint {
  font-size: 11px;
  color: var(--color-ash-dark);
  margin-top: var(--space-xxs);
}

.settings-image-preview {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}

.settings-preview-img {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.settings-preview-info {
  flex: 1;
}

.settings-preview-info span {
  display: block;
  font-size: var(--font-size-small);
}

.settings-preview-size {
  color: var(--color-mute-dark);
}

.settings-preview-remove {
  background: none;
  color: var(--color-warning);
  font-size: var(--font-size-small);
}

.btn-sm {
  height: 32px;
  padding: 6px 14px;
  font-size: var(--font-size-small);
}
```

- [ ] **Step 3: 浏览器中验证设置页密码验证和规则管理**

---

### Task 9: 应用入口和路由（app.js）

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: 创建应用入口模块**

```javascript
// js/app.js - 应用入口、路由、全局方法

const App = (() => {
  let currentView = 'checkin';

  function init() {
    Storage.init();
    CalendarPage.init();

    _bindNavigation();
    _navigateTo('checkin');
  }

  function _bindNavigation() {
    // PC 顶部导航
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        _navigateTo(link.dataset.view);
      });
    });

    // 手机底部导航
    document.querySelectorAll('.nav-bottom-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        _navigateTo(link.dataset.view);
      });
    });
  }

  function _navigateTo(view) {
    currentView = view;

    // 更新导航高亮
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === view);
    });
    document.querySelectorAll('.nav-bottom-item').forEach(link => {
      link.classList.toggle('active', link.dataset.view === view);
    });

    // 切换视图
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view${_capitalize(view)}`).classList.remove('hidden');

    // 渲染对应页面
    switch (view) {
      case 'checkin':
        CheckinPage.render();
        break;
      case 'calendar':
        CalendarPage.render();
        break;
      case 'settings':
        SettingsPage.render();
        break;
    }
  }

  function showModal(html) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    content.innerHTML = html;
    overlay.classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
  }

  function _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // 点击遮罩关闭弹窗
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  return { init, showModal, closeModal };
})();

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.init());
```

- [ ] **Step 2: 浏览器中验证完整应用流程**

打开 `index.html`，测试：
1. 打卡页显示三个科目
2. 点击科目勾选，三科全完成后显示"已完成"
3. 切换到记录页，日历正确显示
4. 切换到设置页，密码验证功能正常
5. 密码验证后可以管理奖励规则
6. PC 和手机视图下布局正确

---

### Task 10: 最终集成测试

**Files:**
- Modify: 所有文件（检查集成）

- [ ] **Step 1: 测试完整打卡流程**

1. 打开应用，勾选三个科目
2. 验证三科全完成后显示"✅ 今日已完成"
3. 切换到记录页，验证今天日期显示蓝色圆
4. 刷新页面，验证打卡记录持久化

- [ ] **Step 2: 测试奖励系统**

1. 设置页添加奖励规则（例如 1 天奖励）
2. 回到打卡页完成打卡
3. 验证奖励庆祝弹窗出现
4. 切换到记录页，验证奖励日显示金色标记
5. 点击奖励日，验证详情弹窗显示

- [ ] **Step 3: 测试密码管理**

1. 设置页用默认密码 "123456" 登录
2. 修改密码为新密码
3. 刷新页面，用新密码验证登录
4. 验证旧密码无法登录

- [ ] **Step 4: 测试数据清除**

1. 设置页点击"清除所有打卡和奖励记录"
2. 确认后验证打卡记录和奖励记录被清除
3. 验证奖励规则和密码保留

- [ ] **Step 5: 测试响应式布局**

1. 浏览器窗口调至手机宽度（<768px）
2. 验证底部导航显示，顶部导航隐藏
3. 验证所有页面单栏布局
4. 恢复桌面宽度，验证顶部导航恢复
