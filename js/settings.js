const SettingsPage = (() => {
  var isAuthenticated = false;
  var calYear, calMonth;

  function render() {
    var container = document.getElementById('viewSettings');
    if (!isAuthenticated) {
      container.innerHTML = _renderPasswordPrompt();
      _bindPasswordEvents(container);
    } else {
      var now = new Date();
      calYear = now.getFullYear();
      calMonth = now.getMonth() + 1;
      container.innerHTML = _renderSettingsPanel();
      _bindSettingsEvents(container);
    }
  }

  function resetAuth() { isAuthenticated = false; }

  // ==================== Password ====================

  function _renderPasswordPrompt() {
    return '<div class="settings-password-card card" style="margin-top:80px;">' +
      '<div class="settings-title">🔒 家长设置</div>' +
      '<div class="settings-form-group">' +
        '<input type="password" class="input" id="settingsPwdInput" placeholder="请输入家长密码">' +
      '</div>' +
      '<div class="settings-password-error hidden" id="settingsPwdError">密码错误，请重试</div>' +
      '<div style="margin-top:var(--spacing-md);">' +
        '<button class="btn btn-primary btn-full" id="settingsPwdSubmit">验证</button>' +
      '</div></div>';
  }

  function _bindPasswordEvents(container) {
    var pwdInput = container.querySelector('#settingsPwdInput');
    var submitBtn = container.querySelector('#settingsPwdSubmit');
    var errorEl = container.querySelector('#settingsPwdError');
    function doSubmit() {
      if (Storage.verifyPassword(pwdInput.value.trim())) {
        isAuthenticated = true;
        render();
      } else {
        errorEl.classList.remove('hidden');
        pwdInput.value = '';
        pwdInput.focus();
      }
    }
    submitBtn.addEventListener('click', doSubmit);
    pwdInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSubmit(); });
  }

  // ==================== Settings Panel ====================

  function _renderSettingsPanel() {
    return _renderThemeSection() +
      _renderSubjectSection() +
      _renderCalendarSection() +
      _renderPasswordSection() +
      _renderClearSection();
  }

  // ---------- Theme ----------

  function _renderThemeSection() {
    var current = Storage.getTheme();
    var themes = [
      { id: 'playstation', name: 'PlayStation', desc: '深邃黑蓝', color: '#0070d1', bg: '#000' },
      { id: 'nintendo', name: 'Nintendo 2001', desc: '灰蓝金属', color: '#e60012', bg: '#7a8aba' },
      { id: 'tesla', name: 'Tesla', desc: '极简白净', color: '#3E6AE1', bg: '#fff' }
    ];
    var html = '<div class="settings-section"><div class="settings-section-header"><h3>🎨 配色方案</h3></div><div class="theme-selector">';
    for (var i = 0; i < themes.length; i++) {
      var t = themes[i];
      var active = current === t.id;
      var border = t.id === 'tesla' ? 'border:1px solid #D0D1D2;' : '';
      html += '<div class="theme-option' + (active ? ' theme-option-active' : '') + '" data-theme-id="' + t.id + '" style="background:' + t.bg + ';' + border + '">' +
        '<div class="theme-option-color" style="background:' + t.color + ';"></div>' +
        '<div class="theme-option-name" style="color:' + (t.id === 'tesla' ? '#171A20' : '#fff') + ';">' + t.name + '</div>' +
        '<div class="theme-option-desc" style="color:' + (t.id === 'tesla' ? '#5C5E62' : 'rgba(255,255,255,0.6)') + ';">' + t.desc + '</div>' +
        (active ? '<div class="theme-option-check">✓</div>' : '') + '</div>';
    }
    html += '</div></div>';
    return html;
  }

  // ---------- Subjects ----------

  function _renderSubjectSection() {
    var subjects = Storage.getSubjects();
    var listHtml = '';
    for (var i = 0; i < subjects.length; i++) {
      var s = subjects[i];
      listHtml += '<div class="rule-item">' +
        '<div class="rule-item-info">' +
          '<div class="rule-item-thumb rule-item-thumb-default">' + s.icon + '</div>' +
          '<div><div class="rule-item-reward" style="font-size:var(--text-body);color:var(--color-on-dark);">' + s.label + '</div>' +
          '<div class="rule-item-days" style="font-size:var(--text-small);color:var(--color-mute-dark);">Key: ' + s.key + '</div></div>' +
        '</div>' +
        '<div class="rule-item-actions">' +
          '<button class="rule-action-btn rule-action-edit-subject" data-key="' + s.key + '">编辑</button>' +
          '<button class="rule-action-btn rule-action-delete-subject" data-key="' + s.key + '">删除</button>' +
        '</div></div>';
    }

    return '<div class="settings-section">' +
      '<div class="settings-section-header"><h3>📚 科目管理</h3>' +
        '<button class="btn btn-primary btn-sm" id="addSubjectBtn">+ 添加</button></div>' +
      '<div id="subjectList">' + listHtml + '</div>' +
      '<div id="subjectForm" class="hidden" style="margin-top:var(--spacing-md);padding-top:var(--spacing-md);border-top:1px solid var(--color-hairline-dark);">' +
        '<div class="settings-form-group"><label class="input-label">科目标识（英文）</label><input type="text" class="input" id="subjectKeyInput" placeholder="例如：english"></div>' +
        '<div class="settings-form-group"><label class="input-label">科目名称</label><input type="text" class="input" id="subjectLabelInput" placeholder="例如：英语"></div>' +
        '<div class="settings-form-group"><label class="input-label">图标（Emoji）</label><input type="text" class="input" id="subjectIconInput" placeholder="例如：📚" value="📝"></div>' +
        '<div style="display:flex;gap:var(--spacing-sm);">' +
          '<button class="btn btn-primary" style="flex:1;" id="saveSubjectBtn">保存</button>' +
          '<button class="btn btn-secondary" style="flex:1;" id="cancelSubjectBtn">取消</button>' +
        '</div>' +
      '</div></div>';
  }

  // ---------- Calendar (Retroactive Check-in) ----------

  function _renderCalendarSection() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header"><h3>📅 补卡日历</h3></div>' +
      '<div style="font-size:var(--text-small);color:var(--color-mute-dark);margin-bottom:var(--spacing-sm);">点击日期可补打卡</div>' +
      '<div id="settingsCalendar"></div></div>';
  }

  function _renderCalendar() {
    var container = document.getElementById('settingsCalendar');
    if (!container) return;

    var daysInMonth = new Date(calYear, calMonth, 0).getDate();
    var firstDay = new Date(calYear, calMonth - 1, 1).getDay();
    var rules = Storage.getRewardRules();
    var ruleMap = {};
    for (var r = 0; r < rules.length; r++) ruleMap[rules[r].date] = rules[r];

    var gridHtml = '';
    for (var i = 0; i < firstDay; i++) {
      gridHtml += '<span class="calendar-day calendar-day-empty"></span>';
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var dateStr = calYear + '-' + String(calMonth).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      var hasRule = !!ruleMap[dateStr];
      var isComplete = Storage.isDayComplete(dateStr);
      var classes = 'calendar-day';
      var icon = '';
      if (hasRule && isComplete) {
        classes += ' calendar-day-reward';
        icon = '<span class="calendar-reward-icon">🏆</span>';
      } else if (hasRule) {
        classes += ' calendar-day-reward-target';
        icon = '<span class="calendar-reward-icon">🎁</span>';
      } else if (isComplete) {
        classes += ' calendar-day-complete';
      }
      gridHtml += '<span class="' + classes + '" data-date="' + dateStr + '">' + day + icon + '</span>';
    }

    var weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    var weekdayHtml = weekdays.map(function (w) { return '<span>' + w + '</span>'; }).join('');

    container.innerHTML =
      '<div class="calendar-nav">' +
        '<button class="calendar-nav-btn" id="settingsCalPrev">◀</button>' +
        '<span class="calendar-nav-title">' + calYear + '年' + calMonth + '月</span>' +
        '<button class="calendar-nav-btn" id="settingsCalNext">▶</button>' +
      '</div>' +
      '<div class="card">' +
        '<div class="calendar-weekdays">' + weekdayHtml + '</div>' +
        '<div class="calendar-grid">' + gridHtml + '</div>' +
      '</div>';

    container.querySelector('#settingsCalPrev').addEventListener('click', function () {
      calMonth--; if (calMonth < 1) { calMonth = 12; calYear--; } _renderCalendar();
    });
    container.querySelector('#settingsCalNext').addEventListener('click', function () {
      calMonth++; if (calMonth > 12) { calMonth = 1; calYear++; } _renderCalendar();
    });

    var days = container.querySelectorAll('.calendar-day:not(.calendar-day-empty)');
    for (var j = 0; j < days.length; j++) {
      days[j].addEventListener('click', function () {
        _showCheckinPopup(this.getAttribute('data-date'));
      });
    }
  }

  function _showCheckinPopup(dateStr) {
    var subjects = Storage.getSubjects();
    var checkin = Storage.getCheckin(dateStr);
    var rule = Storage.getRewardRuleByDate(dateStr);

    var subjectsHtml = '';
    for (var i = 0; i < subjects.length; i++) {
      var s = subjects[i];
      var checked = checkin[s.key] ? ' checked' : '';
      subjectsHtml += '<label style="display:flex;align-items:center;gap:var(--spacing-sm);padding:var(--spacing-sm) 0;cursor:pointer;border-bottom:1px solid var(--color-hairline-dark);">' +
        '<span style="font-size:18px;">' + s.icon + '</span>' +
        '<span style="flex:1;">' + s.label + '</span>' +
        '<input type="checkbox" class="popup-checkbox" data-key="' + s.key + '"' + checked + ' style="width:20px;height:20px;accent-color:var(--color-primary);">' +
      '</label>';
    }

    var rewardHtml = rule
      ? '<div style="background:linear-gradient(135deg, rgba(255,206,33,0.15), rgba(238,142,0,0.15));border:1px solid rgba(255,206,33,0.3);border-radius:var(--radius-md);padding:var(--spacing-sm);margin-bottom:var(--spacing-md);text-align:center;">' +
        '<div style="font-size:var(--text-small);color:#ffce21;">🎁 奖励日</div>' +
        '<div style="font-weight:600;">' + rule.reward + '</div></div>'
      : '';

    var html =
      '<div style="overflow:hidden;"><button class="modal-close" onclick="App.closeModal()">✕</button></div>' +
      '<div style="margin-bottom:var(--spacing-md);">' +
        '<div style="font-size:var(--text-heading);font-weight:600;">补卡</div>' +
        '<div style="font-size:var(--text-caption);color:var(--color-mute-dark);">' + dateStr + '</div>' +
      '</div>' +
      rewardHtml +
      '<div>' + subjectsHtml + '</div>' +
      '<div style="margin-top:var(--spacing-md);">' +
        '<button class="btn btn-primary btn-full" id="popupSaveCheckin">保存</button>' +
      '</div>';

    App.showModal(html);

    document.getElementById('popupSaveCheckin').addEventListener('click', function () {
      var checkboxes = document.querySelectorAll('.popup-checkbox');
      var result = {};
      for (var i = 0; i < checkboxes.length; i++) {
        result[checkboxes[i].getAttribute('data-key')] = checkboxes[i].checked;
      }
      Storage.setCheckinFull(dateStr, result);
      App.closeModal();
      _renderCalendar();
    });
  }

  // ---------- Password Management ----------

  function _renderPasswordSection() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header"><h3>🔐 密码管理</h3></div>' +
      '<div class="settings-form-group"><label class="input-label">当前密码</label><input type="password" class="input" id="currentPwdInput" placeholder="当前密码"></div>' +
      '<div class="settings-form-group"><label class="input-label">新密码</label><input type="password" class="input" id="newPwdInput" placeholder="新密码"></div>' +
      '<div class="settings-form-group"><label class="input-label">确认新密码</label><input type="password" class="input" id="confirmPwdInput" placeholder="再次输入新密码"></div>' +
      '<div class="settings-password-error hidden" id="pwdChangeError"></div>' +
      '<div style="margin-top:var(--spacing-md);"><button class="btn btn-primary btn-full" id="changePwdBtn">修改密码</button></div></div>';
  }

  // ---------- Clear Data ----------

  function _renderClearSection() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header"><h3>⚠️ 数据管理</h3></div>' +
      '<button class="btn btn-danger btn-full" id="clearAllBtn">清除所有数据</button>' +
      '<div style="font-size:var(--text-small);color:var(--color-mute-dark);margin-top:var(--spacing-xs);text-align:center;">将清除所有打卡记录和奖励规则，此操作不可恢复</div></div>';
  }

  // ==================== Event Binding ====================

  function _bindSettingsEvents(container) {
    _renderCalendar();

    // Theme
    container.addEventListener('click', function (e) {
      var themeOpt = e.target.closest('.theme-option');
      if (themeOpt) {
        var themeId = themeOpt.getAttribute('data-theme-id');
        Storage.setTheme(themeId);
        if (themeId === 'playstation') document.body.removeAttribute('data-theme');
        else document.body.setAttribute('data-theme', themeId);
        render();
        return;
      }
    });

    // Subject management
    var addSubjectBtn = container.querySelector('#addSubjectBtn');
    var subjectForm = container.querySelector('#subjectForm');
    var subjectKeyInput = container.querySelector('#subjectKeyInput');
    var subjectLabelInput = container.querySelector('#subjectLabelInput');
    var subjectIconInput = container.querySelector('#subjectIconInput');
    var editingSubjectKey = null;

    if (addSubjectBtn) {
      addSubjectBtn.addEventListener('click', function () {
        editingSubjectKey = null;
        subjectKeyInput.value = '';
        subjectKeyInput.disabled = false;
        subjectLabelInput.value = '';
        subjectIconInput.value = '📝';
        subjectForm.classList.remove('hidden');
        subjectKeyInput.focus();
      });
    }

    // Edit subject
    container.addEventListener('click', function (e) {
      if (e.target.classList.contains('rule-action-edit-subject')) {
        var key = e.target.getAttribute('data-key');
        var subjects = Storage.getSubjects();
        var subject = null;
        for (var i = 0; i < subjects.length; i++) {
          if (subjects[i].key === key) { subject = subjects[i]; break; }
        }
        if (subject) {
          editingSubjectKey = key;
          subjectKeyInput.value = subject.key;
          subjectKeyInput.disabled = true;
          subjectLabelInput.value = subject.label;
          subjectIconInput.value = subject.icon;
          subjectForm.classList.remove('hidden');
          subjectLabelInput.focus();
        }
      }
    });

    // Delete subject
    container.addEventListener('click', function (e) {
      if (e.target.classList.contains('rule-action-delete-subject')) {
        var key = e.target.getAttribute('data-key');
        if (!confirm('确定删除该科目？相关打卡记录将保留但不再显示。')) return;
        Storage.deleteSubject(key);
        render();
      }
    });

    // Save subject
    var saveSubjectBtn = container.querySelector('#saveSubjectBtn');
    if (saveSubjectBtn) {
      saveSubjectBtn.addEventListener('click', function () {
        var key = subjectKeyInput.value.trim();
        var label = subjectLabelInput.value.trim();
        var icon = subjectIconInput.value.trim() || '📝';
        if (!key || !label) { alert('请填写标识和名称'); return; }
        if (editingSubjectKey) {
          Storage.updateSubject(editingSubjectKey, label, icon);
        } else {
          if (!Storage.addSubject(key, label, icon)) {
            alert('该标识已存在');
            return;
          }
        }
        subjectForm.classList.add('hidden');
        render();
      });
    }

    var cancelSubjectBtn = container.querySelector('#cancelSubjectBtn');
    if (cancelSubjectBtn) {
      cancelSubjectBtn.addEventListener('click', function () {
        subjectForm.classList.add('hidden');
      });
    }

    // Password change
    var changePwdBtn = container.querySelector('#changePwdBtn');
    if (changePwdBtn) {
      changePwdBtn.addEventListener('click', function () {
        var cur = container.querySelector('#currentPwdInput').value;
        var newPwd = container.querySelector('#newPwdInput').value;
        var conf = container.querySelector('#confirmPwdInput').value;
        var err = container.querySelector('#pwdChangeError');
        if (!Storage.verifyPassword(cur)) { err.textContent = '当前密码错误'; err.classList.remove('hidden'); return; }
        if (!newPwd.trim()) { err.textContent = '新密码不能为空'; err.classList.remove('hidden'); return; }
        if (newPwd !== conf) { err.textContent = '两次输入不一致'; err.classList.remove('hidden'); return; }
        Storage.changePassword(cur, newPwd);
        err.classList.add('hidden');
        alert('密码修改成功');
        container.querySelector('#currentPwdInput').value = '';
        container.querySelector('#newPwdInput').value = '';
        container.querySelector('#confirmPwdInput').value = '';
      });
    }

    // Clear all
    var clearBtn = container.querySelector('#clearAllBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!confirm('确定清除所有数据？不可恢复！')) return;
        Storage.clearAllRecords();
        alert('所有数据已清除');
        _renderCalendar();
      });
    }
  }

  return { render: render, resetAuth: resetAuth };
})();
