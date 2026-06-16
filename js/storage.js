const Storage = (() => {
  function _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  var DEFAULT_SUBJECTS = [
    { key: 'english', label: '英语', icon: '📚' },
    { key: 'math', label: '数学', icon: '📐' },
    { key: 'chinese', label: '语文', icon: '📖' }
  ];

  function init() {
    if (_get('parentPassword') === null) _set('parentPassword', '123456');
    if (_get('checkins') === null) _set('checkins', {});
    if (_get('rewardRules') === null) _set('rewardRules', []);
    if (_get('theme') === null) _set('theme', 'playstation');
    if (_get('subjects') === null) _set('subjects', DEFAULT_SUBJECTS);
  }

  // Theme
  function getTheme() { return _get('theme') || 'playstation'; }
  function setTheme(theme) { _set('theme', theme); }

  // Subjects — 科目管理
  function getSubjects() { return _get('subjects') || DEFAULT_SUBJECTS; }

  function setSubjects(subjects) { _set('subjects', subjects); }

  function addSubject(key, label, icon) {
    var subjects = getSubjects();
    for (var i = 0; i < subjects.length; i++) {
      if (subjects[i].key === key) return false;
    }
    subjects.push({ key: key, label: label, icon: icon || '📝' });
    _set('subjects', subjects);
    return true;
  }

  function updateSubject(key, label, icon) {
    var subjects = getSubjects();
    for (var i = 0; i < subjects.length; i++) {
      if (subjects[i].key === key) {
        if (label) subjects[i].label = label;
        if (icon) subjects[i].icon = icon;
        _set('subjects', subjects);
        return true;
      }
    }
    return false;
  }

  function deleteSubject(key) {
    var subjects = getSubjects();
    var filtered = subjects.filter(function (s) { return s.key !== key; });
    if (filtered.length === subjects.length) return false;
    _set('subjects', filtered);
    return true;
  }

  // Checkins
  function getCheckins() { return _get('checkins') || {}; }

  function getCheckin(date) {
    var subjects = getSubjects();
    var stored = getCheckins()[date] || {};
    var result = {};
    for (var i = 0; i < subjects.length; i++) {
      result[subjects[i].key] = stored[subjects[i].key] === true;
    }
    return result;
  }

  function setCheckin(date, subjectKey, value) {
    var checkins = getCheckins();
    if (!checkins[date]) checkins[date] = {};
    checkins[date][subjectKey] = value;
    _set('checkins', checkins);
  }

  function setCheckinFull(date, subjectsObj) {
    var checkins = getCheckins();
    checkins[date] = subjectsObj;
    _set('checkins', checkins);
  }

  function isDayComplete(date) {
    var subjects = getSubjects();
    var c = getCheckin(date);
    for (var i = 0; i < subjects.length; i++) {
      if (!c[subjects[i].key]) return false;
    }
    return true;
  }

  function getCompletedDays() {
    var checkins = getCheckins();
    var subjects = getSubjects();
    var count = 0;
    for (var d in checkins) {
      if (checkins.hasOwnProperty(d)) {
        var s = checkins[d];
        var allDone = true;
        for (var i = 0; i < subjects.length; i++) {
          if (!s[subjects[i].key]) { allDone = false; break; }
        }
        if (allDone) count++;
      }
    }
    return count;
  }

  function getCompletedDaysInMonth(year, month) {
    var checkins = getCheckins();
    var subjects = getSubjects();
    var prefix = year + '-' + String(month).padStart(2, '0');
    var count = 0;
    for (var d in checkins) {
      if (checkins.hasOwnProperty(d) && d.startsWith(prefix)) {
        var s = checkins[d];
        var allDone = true;
        for (var i = 0; i < subjects.length; i++) {
          if (!s[subjects[i].key]) { allDone = false; break; }
        }
        if (allDone) count++;
      }
    }
    return count;
  }

  // Reward Rules — { id, date, reward, image }
  function getRewardRules() { return _get('rewardRules') || []; }

  function getRewardRuleByDate(date) {
    var rules = getRewardRules();
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].date === date) return rules[i];
    }
    return null;
  }

  function addRewardRule(rule) {
    var rules = getRewardRules();
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].date === rule.date) return null;
    }
    rule.id = 'rule_' + Date.now();
    rules.push(rule);
    _set('rewardRules', rules);
    return rule;
  }

  function updateRewardRule(id, updates) {
    var rules = getRewardRules();
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].id === id) {
        Object.assign(rules[i], updates);
        _set('rewardRules', rules);
        return rules[i];
      }
    }
    return null;
  }

  function deleteRewardRule(id) {
    var rules = getRewardRules();
    var filtered = rules.filter(function (r) { return r.id !== id; });
    _set('rewardRules', filtered);
    return filtered.length < rules.length;
  }

  function getRewardAtDate(date) {
    var rule = getRewardRuleByDate(date);
    if (!rule) return null;
    return { date: rule.date, reward: rule.reward, image: rule.image || null, earned: isDayComplete(date) };
  }

  function getEarnedRewardDates() {
    var rules = getRewardRules();
    var earned = [];
    for (var i = 0; i < rules.length; i++) {
      if (isDayComplete(rules[i].date)) earned.push(rules[i].date);
    }
    return earned;
  }

  // Password
  function getPassword() { return _get('parentPassword') || '123456'; }
  function verifyPassword(pwd) { return getPassword() === pwd; }
  function changePassword(oldPwd, newPwd) {
    if (!verifyPassword(oldPwd)) return false;
    _set('parentPassword', newPwd);
    return true;
  }

  // Clear
  function clearAllRecords() {
    _set('checkins', {});
    _set('rewardRules', []);
  }

  return {
    init: init,
    getSubjects: getSubjects, setSubjects: setSubjects,
    addSubject: addSubject, updateSubject: updateSubject, deleteSubject: deleteSubject,
    getCheckins: getCheckins, getCheckin: getCheckin, setCheckin: setCheckin, setCheckinFull: setCheckinFull,
    isDayComplete: isDayComplete, getCompletedDays: getCompletedDays, getCompletedDaysInMonth: getCompletedDaysInMonth,
    getRewardRules: getRewardRules, getRewardRuleByDate: getRewardRuleByDate,
    addRewardRule: addRewardRule, updateRewardRule: updateRewardRule, deleteRewardRule: deleteRewardRule,
    getRewardAtDate: getRewardAtDate, getEarnedRewardDates: getEarnedRewardDates,
    getPassword: getPassword, verifyPassword: verifyPassword, changePassword: changePassword,
    clearAllRecords: clearAllRecords, getTheme: getTheme, setTheme: setTheme
  };
})();
