const Storage = (() => {
  function _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function init() {
    if (_get('parentPassword') === null) _set('parentPassword', '123456');
    if (_get('checkins') === null) _set('checkins', {});
    if (_get('rewardRules') === null) _set('rewardRules', []);
    if (_get('theme') === null) _set('theme', 'playstation');
  }

  // Theme
  function getTheme() { return _get('theme') || 'playstation'; }
  function setTheme(theme) { _set('theme', theme); }

  // Checkins
  function getCheckins() { return _get('checkins') || {}; }

  function getCheckin(date) {
    return getCheckins()[date] || { english: false, math: false, chinese: false };
  }

  function setCheckin(date, subjects) {
    var checkins = getCheckins();
    checkins[date] = subjects;
    _set('checkins', checkins);
  }

  function isDayComplete(date) {
    var c = getCheckin(date);
    return c.english === true && c.math === true && c.chinese === true;
  }

  function getCompletedDays() {
    var checkins = getCheckins();
    var count = 0;
    for (var d in checkins) {
      if (checkins.hasOwnProperty(d)) {
        var s = checkins[d];
        if (s.english && s.math && s.chinese) count++;
      }
    }
    return count;
  }

  function getCompletedDaysInMonth(year, month) {
    var checkins = getCheckins();
    var prefix = year + '-' + String(month).padStart(2, '0');
    var count = 0;
    for (var d in checkins) {
      if (checkins.hasOwnProperty(d) && d.startsWith(prefix)) {
        var s = checkins[d];
        if (s.english && s.math && s.chinese) count++;
      }
    }
    return count;
  }

  // Reward Rules — { id, date, reward, image }
  function getRewardRules() {
    return _get('rewardRules') || [];
  }

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

  // 获取某日期的奖励状态（规则 + 是否已完成）
  function getRewardAtDate(date) {
    var rule = getRewardRuleByDate(date);
    if (!rule) return null;
    return {
      date: rule.date,
      reward: rule.reward,
      image: rule.image || null,
      earned: isDayComplete(date)
    };
  }

  // 获取所有已完成的奖励日期
  function getEarnedRewardDates() {
    var rules = getRewardRules();
    var earned = [];
    for (var i = 0; i < rules.length; i++) {
      if (isDayComplete(rules[i].date)) {
        earned.push(rules[i].date);
      }
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
    getCheckins: getCheckins,
    getCheckin: getCheckin,
    setCheckin: setCheckin,
    isDayComplete: isDayComplete,
    getCompletedDays: getCompletedDays,
    getCompletedDaysInMonth: getCompletedDaysInMonth,
    getRewardRules: getRewardRules,
    getRewardRuleByDate: getRewardRuleByDate,
    addRewardRule: addRewardRule,
    updateRewardRule: updateRewardRule,
    deleteRewardRule: deleteRewardRule,
    getRewardAtDate: getRewardAtDate,
    getEarnedRewardDates: getEarnedRewardDates,
    getPassword: getPassword,
    verifyPassword: verifyPassword,
    changePassword: changePassword,
    clearAllRecords: clearAllRecords,
    getTheme: getTheme,
    setTheme: setTheme
  };
})();
