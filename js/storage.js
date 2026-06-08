const Storage = (() => {
  // Private helpers
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

  // Initialize defaults if not present
  function init() {
    if (_get('parentPassword') === null) {
      _set('parentPassword', '123456');
    }
    if (_get('checkins') === null) {
      _set('checkins', {});
    }
    if (_get('rewardRules') === null) {
      _set('rewardRules', []);
    }
    if (_get('rewardHistory') === null) {
      _set('rewardHistory', []);
    }
  }

  // Checkins
  function getCheckins() {
    return _get('checkins') || {};
  }

  function getCheckin(date) {
    const checkins = getCheckins();
    return checkins[date] || { english: false, math: false, chinese: false };
  }

  function setCheckin(date, subjects) {
    const checkins = getCheckins();
    checkins[date] = subjects;
    _set('checkins', checkins);
  }

  function isDayComplete(date) {
    const checkin = getCheckin(date);
    return checkin.english === true && checkin.math === true && checkin.chinese === true;
  }

  function getCompletedDays() {
    const checkins = getCheckins();
    let count = 0;
    for (const date in checkins) {
      if (checkins.hasOwnProperty(date)) {
        const s = checkins[date];
        if (s.english === true && s.math === true && s.chinese === true) {
          count++;
        }
      }
    }
    return count;
  }

  function getCompletedDaysInMonth(year, month) {
    const checkins = getCheckins();
    const prefix = year + '-' + String(month).padStart(2, '0');
    let count = 0;
    for (const date in checkins) {
      if (checkins.hasOwnProperty(date) && date.startsWith(prefix)) {
        const s = checkins[date];
        if (s.english === true && s.math === true && s.chinese === true) {
          count++;
        }
      }
    }
    return count;
  }

  // Reward Rules
  function getRewardRules() {
    return _get('rewardRules') || [];
  }

  function addRewardRule(rule) {
    const rules = getRewardRules();
    const newRule = Object.assign({}, rule, { id: String(Date.now()) });
    rules.push(newRule);
    _set('rewardRules', rules);
    return newRule;
  }

  function updateRewardRule(id, updates) {
    const rules = getRewardRules();
    for (let i = 0; i < rules.length; i++) {
      if (rules[i].id === id) {
        Object.assign(rules[i], updates);
        _set('rewardRules', rules);
        return rules[i];
      }
    }
    return null;
  }

  function deleteRewardRule(id) {
    const rules = getRewardRules();
    const filtered = rules.filter(function (r) { return r.id !== id; });
    _set('rewardRules', filtered);
    return filtered.length < rules.length;
  }

  // Reward History
  function getRewardHistory() {
    return _get('rewardHistory') || [];
  }

  function addRewardRecord(record) {
    const history = getRewardHistory();
    history.push(record);
    _set('rewardHistory', history);
  }

  function getRewardAtDate(date) {
    const history = getRewardHistory();
    for (let i = 0; i < history.length; i++) {
      if (history[i].achievedAt === date) {
        return history[i];
      }
    }
    return null;
  }

  // Password
  function getPassword() {
    return _get('parentPassword') || '123456';
  }

  function verifyPassword(pwd) {
    return getPassword() === pwd;
  }

  function changePassword(oldPwd, newPwd) {
    if (!verifyPassword(oldPwd)) {
      return false;
    }
    _set('parentPassword', newPwd);
    return true;
  }

  // Clear
  function clearAllRecords() {
    _set('checkins', {});
    _set('rewardHistory', []);
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
    addRewardRule: addRewardRule,
    updateRewardRule: updateRewardRule,
    deleteRewardRule: deleteRewardRule,
    getRewardHistory: getRewardHistory,
    addRewardRecord: addRewardRecord,
    getRewardAtDate: getRewardAtDate,
    getPassword: getPassword,
    verifyPassword: verifyPassword,
    changePassword: changePassword,
    clearAllRecords: clearAllRecords
  };
})();
