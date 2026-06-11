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
      '</div>' +
    '</div>';
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
      _renderCalendarSection() +
      _renderPasswordSection() +
      _renderClearSection();
  }

  // ---------- Theme ----------

  function _renderThemeSection() {
    var current = Storage.getTheme();
    var themes = [
      { id: 'playstation', name: 'PlayStation', desc: '深邃黑蓝', color: '#0070d1', bg: '#000000' },
      { id: 'nintendo', name: 'Nintendo 2001', desc: '灰蓝金属', color: '#e60012', bg: '#7a8aba' },
      { id: 'tesla', name: 'Tesla', desc: '极简白净', color: '#3E6AE1', bg: '#ffffff' }
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
        (active ? '<div class="theme-option-check">✓</div>' : '') +
      '</div>';
    }
    html += '</div></div>';
    return html;
  }

  // ---------- Calendar Reward Manager ----------

  function _renderCalendarSection() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header"><h3>🎁 奖励日历</h3></div>' +
      '<div style="font-size:var(--text-small);color:var(--color-mute-dark);margin-bottom:var(--spacing-sm);">点击日期添加或编辑奖励</div>' +
      '<div id="settingsCalendar"></div>' +
    '</div>';
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
      var classes = 'calendar-day';
      var icon = '';
      if (hasRule) {
        classes += ' calendar-day-reward';
        icon = '<span class="calendar-reward-icon">🎁</span>';
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

    // 绑定事件
    container.querySelector('#settingsCalPrev').addEventListener('click', function () {
      calMonth--; if (calMonth < 1) { calMonth = 12; calYear--; }
      _renderCalendar();
    });
    container.querySelector('#settingsCalNext').addEventListener('click', function () {
      calMonth++; if (calMonth > 12) { calMonth = 1; calYear++; }
      _renderCalendar();
    });

    var days = container.querySelectorAll('.calendar-day:not(.calendar-day-empty)');
    for (var j = 0; j < days.length; j++) {
      days[j].addEventListener('click', function () {
        _showRewardPopup(this.getAttribute('data-date'));
      });
    }
  }

  function _showRewardPopup(dateStr) {
    var rule = Storage.getRewardRuleByDate(dateStr);
    var isEdit = !!rule;

    var imagePreviewHtml = '';
    if (isEdit && rule.image && rule.image.length > 10) {
      imagePreviewHtml = '<img id="settingsPreviewImg" style="width:100px;height:100px;object-fit:cover;border-radius:var(--radius-sm);margin-top:var(--spacing-xs);" src="' + rule.image + '">';
    }

    var html =
      '<div style="overflow:hidden;"><button class="modal-close" onclick="App.closeModal()">✕</button></div>' +
      '<div style="margin-bottom:var(--spacing-md);">' +
        '<div style="font-size:var(--text-heading);font-weight:600;margin-bottom:var(--spacing-xxs);">' + (isEdit ? '编辑奖励' : '添加奖励') + '</div>' +
        '<div style="font-size:var(--text-caption);color:var(--color-mute-dark);">' + dateStr + '</div>' +
      '</div>' +
      '<div class="settings-form-group">' +
        '<label class="input-label">奖励内容</label>' +
        '<input type="text" class="input" id="popupRewardInput" placeholder="例如：看一集动画片" value="' + (isEdit ? rule.reward : '') + '">' +
      '</div>' +
      '<div class="settings-form-group">' +
        '<label class="input-label">奖励图片（可选）</label>' +
        '<div class="settings-upload-area" id="popupUploadArea" data-has-image="' + (isEdit && rule.image ? 'true' : 'false') + '" style="width:200px;height:150px;margin:0 auto;">' +
          '<button class="btn btn-sm btn-secondary" id="popupRemoveImg" style="display:' + (isEdit && rule.image ? '' : 'none') + ';position:absolute;top:8px;right:8px;z-index:1;">移除</button>' +
          '<div id="popupPlaceholder" style="display:' + (isEdit && rule.image ? 'none' : '') + ';">' +
            '<div style="font-size:24px;">🖼️</div>' +
            '<div style="font-size:var(--text-small);">点击上传</div>' +
          '</div>' +
          '<div id="popupPreviewWrap" style="display:' + (isEdit && rule.image ? '' : 'none') + ';">' +
            '<img id="popupPreviewImg" style="width:100px;height:100px;object-fit:cover;border-radius:var(--radius-sm);"' +
            (isEdit && rule.image ? ' src="' + rule.image + '"' : '') + '>' +
          '</div>' +
        '</div>' +
        '<input type="file" id="popupFileInput" accept="image/*" style="display:none">' +
      '</div>' +
      '<div style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-md);">' +
        '<button class="btn btn-primary" style="flex:1;" id="popupSaveBtn">保存</button>' +
        (isEdit ? '<button class="btn btn-danger" style="flex:1;" id="popupDeleteBtn">删除</button>' : '') +
      '</div>';

    App.showModal(html);

    // 获取弹窗元素
    var modal = document.getElementById('modalContent');
    var uploadArea = modal.querySelector('#popupUploadArea');
    var fileInput = modal.querySelector('#popupFileInput');
    var placeholder = modal.querySelector('#popupPlaceholder');
    var previewWrap = modal.querySelector('#popupPreviewWrap');
    var previewImg = modal.querySelector('#popupPreviewImg');
    var removeBtn = modal.querySelector('#popupRemoveImg');
    var saveBtn = modal.querySelector('#popupSaveBtn');
    var deleteBtn = modal.querySelector('#popupDeleteBtn');
    var rewardInput = modal.querySelector('#popupRewardInput');

    // 图片上传
    var currentImage = (isEdit && rule.image) ? rule.image : null;

    uploadArea.addEventListener('click', function () {
      if (uploadArea.getAttribute('data-has-image') !== 'true') fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (!file) return;
      ImageUtil.compress(file).then(function (base64) {
        currentImage = base64;
        previewImg.src = base64;
        placeholder.style.display = 'none';
        previewWrap.style.display = '';
        removeBtn.style.display = '';
        uploadArea.setAttribute('data-has-image', 'true');
      });
      fileInput.value = '';
    });

    removeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      currentImage = null;
      previewImg.src = '';
      placeholder.style.display = '';
      previewWrap.style.display = 'none';
      removeBtn.style.display = 'none';
      uploadArea.setAttribute('data-has-image', 'false');
    });

    // 保存
    saveBtn.addEventListener('click', function () {
      var rewardText = rewardInput.value.trim();
      if (!rewardText) { alert('请输入奖励内容'); return; }

      if (isEdit) {
        Storage.updateRewardRule(rule.id, { reward: rewardText, image: currentImage });
      } else {
        var result = Storage.addRewardRule({ date: dateStr, reward: rewardText, image: currentImage });
        if (!result) { alert('该日期已有奖励，无法重复添加'); return; }
      }
      App.closeModal();
      _renderCalendar();
    });

    // 删除
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function () {
        if (!confirm('确定删除此奖励？')) return;
        Storage.deleteRewardRule(rule.id);
        App.closeModal();
        _renderCalendar();
      });
    }
  }

  // ---------- Password Management ----------

  function _renderPasswordSection() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header"><h3>🔐 密码管理</h3></div>' +
      '<div class="settings-form-group"><label class="input-label">当前密码</label><input type="password" class="input" id="currentPwdInput" placeholder="当前密码"></div>' +
      '<div class="settings-form-group"><label class="input-label">新密码</label><input type="password" class="input" id="newPwdInput" placeholder="新密码"></div>' +
      '<div class="settings-form-group"><label class="input-label">确认新密码</label><input type="password" class="input" id="confirmPwdInput" placeholder="再次输入新密码"></div>' +
      '<div class="settings-password-error hidden" id="pwdChangeError"></div>' +
      '<div style="margin-top:var(--spacing-md);"><button class="btn btn-primary btn-full" id="changePwdBtn">修改密码</button></div>' +
    '</div>';
  }

  // ---------- Clear Data ----------

  function _renderClearSection() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header"><h3>⚠️ 数据管理</h3></div>' +
      '<button class="btn btn-danger btn-full" id="clearAllBtn">清除所有数据</button>' +
      '<div style="font-size:var(--text-small);color:var(--color-mute-dark);margin-top:var(--spacing-xs);text-align:center;">将清除所有打卡记录和奖励规则，此操作不可恢复</div>' +
    '</div>';
  }

  // ==================== Event Binding ====================

  function _bindSettingsEvents(container) {
    _renderCalendar();

    // Theme selection
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

    // Password change
    var changePwdBtn = container.querySelector('#changePwdBtn');
    if (changePwdBtn) {
      changePwdBtn.addEventListener('click', function () {
        var cur = container.querySelector('#currentPwdInput').value;
        var newPwd = container.querySelector('#newPwdInput').value;
        var confirm = container.querySelector('#confirmPwdInput').value;
        var err = container.querySelector('#pwdChangeError');
        if (!Storage.verifyPassword(cur)) { err.textContent = '当前密码错误'; err.classList.remove('hidden'); return; }
        if (!newPwd.trim()) { err.textContent = '新密码不能为空'; err.classList.remove('hidden'); return; }
        if (newPwd !== confirm) { err.textContent = '两次输入不一致'; err.classList.remove('hidden'); return; }
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
        if (!confirm('确定清除所有数据？包括打卡记录和奖励规则，不可恢复！')) return;
        Storage.clearAllRecords();
        alert('所有数据已清除');
        _renderCalendar();
      });
    }
  }

  return { render: render, resetAuth: resetAuth };
})();
