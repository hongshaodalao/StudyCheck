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

  function resetAuth() { isAuthenticated = false; }

  // ==================== Password Prompt ====================

  function _renderPasswordPrompt() {
    return `
      <div class="settings-password-card card" style="margin-top:80px;">
        <div class="settings-title">🔒 家长设置</div>
        <div class="settings-form-group">
          <input type="password" class="input" id="settingsPwdInput" placeholder="请输入家长密码">
        </div>
        <div class="settings-password-error hidden" id="settingsPwdError">密码错误，请重试</div>
        <div class="settings-form-group" style="margin-top:var(--spacing-md);">
          <button class="btn btn-primary btn-full" id="settingsPwdSubmit">验证</button>
        </div>
      </div>
    `;
  }

  function _bindPasswordEvents(container) {
    var pwdInput = container.querySelector('#settingsPwdInput');
    var submitBtn = container.querySelector('#settingsPwdSubmit');
    var errorEl = container.querySelector('#settingsPwdError');

    function _doSubmit() {
      var pwd = pwdInput.value.trim();
      if (Storage.verifyPassword(pwd)) {
        isAuthenticated = true;
        render();
      } else {
        errorEl.classList.remove('hidden');
        pwdInput.value = '';
        pwdInput.focus();
      }
    }

    submitBtn.addEventListener('click', _doSubmit);
    pwdInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        _doSubmit();
      }
    });
    pwdInput.addEventListener('input', function () {
      errorEl.classList.add('hidden');
    });

    pwdInput.focus();
  }

  // ==================== Settings Panel ====================

  function _renderSettingsPanel() {
    var rules = Storage.getRewardRules();
    var rulesHtml = rules.length > 0
      ? rules.map(function (rule) { return _renderRuleItem(rule); }).join('')
      : '<div style="text-align:center;color:var(--color-mute-dark);padding:var(--spacing-md);">暂无奖励规则</div>';

    return `
      <div class="settings-title">⚙ 家长设置</div>

      <!-- 密码管理 -->
      <div class="settings-section">
        <div class="settings-section-header">
          <h3>🔐 密码管理</h3>
        </div>
        <div class="settings-form-group">
          <label class="input-label">当前密码</label>
          <input type="password" class="input" id="currentPwdInput" placeholder="当前密码">
        </div>
        <div class="settings-form-group">
          <label class="input-label">新密码</label>
          <input type="password" class="input" id="newPwdInput" placeholder="新密码">
        </div>
        <div class="settings-form-group">
          <label class="input-label">确认新密码</label>
          <input type="password" class="input" id="confirmPwdInput" placeholder="再次输入新密码">
        </div>
        <div class="settings-password-error hidden" id="pwdChangeError"></div>
        <div style="margin-top:var(--spacing-md);">
          <button class="btn btn-primary btn-full" id="changePwdBtn">修改密码</button>
        </div>
      </div>

      <!-- 奖励规则 -->
      <div class="settings-section">
        <div class="settings-section-header">
          <h3>🏆 奖励规则</h3>
          <button class="btn btn-primary btn-sm" id="addRuleBtn">+ 添加</button>
        </div>
        <div id="ruleListContainer">
          ${rulesHtml}
        </div>
      </div>

      <!-- 添加/编辑表单 -->
      <div class="settings-section hidden" id="ruleFormSection">
        <div class="settings-section-header">
          <h3 id="ruleFormTitle">✏️ 添加奖励规则</h3>
        </div>
        <div class="settings-form-group">
          <label class="input-label">天数</label>
          <input type="number" class="input" id="ruleDaysInput" placeholder="打卡天数" min="1">
        </div>
        <div class="settings-form-group">
          <label class="input-label">奖励内容</label>
          <input type="text" class="input" id="ruleRewardInput" placeholder="奖励描述">
        </div>
        <div class="settings-form-group">
          <label class="input-label">奖励图片（可选）</label>
          <div class="settings-upload-area" id="uploadArea">
            <div style="font-size:32px;margin-bottom:var(--spacing-xs);">🖼️</div>
            <div>点击上传图片</div>
            <div style="font-size:var(--text-small);color:var(--color-mute-dark);margin-top:var(--spacing-xs);">支持 JPG、PNG，自动压缩至 300×300</div>
          </div>
          <input type="file" id="ruleImageInput" accept="image/*" style="display:none">
          <div class="settings-image-preview hidden" id="imagePreview">
            <img id="previewImg" class="settings-preview-img" style="width:60px;height:60px;object-fit:cover;border-radius:var(--radius-sm);">
            <div style="flex:1;min-width:0;">
              <div id="previewName" style="font-size:var(--text-small);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
              <div id="previewSize" style="font-size:var(--text-small);color:var(--color-mute-dark);"></div>
            </div>
            <button class="btn btn-sm btn-secondary" id="removeImage">移除</button>
          </div>
        </div>
        <div style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-md);">
          <button class="btn btn-primary" style="flex:1;" id="saveRuleBtn">保存</button>
          <button class="btn btn-secondary" style="flex:1;" id="cancelRuleBtn">取消</button>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="settings-section">
        <div class="settings-section-header">
          <h3>⚠️ 数据管理</h3>
        </div>
        <button class="btn btn-danger btn-full" id="clearAllBtn">清除所有打卡和奖励记录</button>
        <div style="font-size:var(--text-small);color:var(--color-mute-dark);margin-top:var(--spacing-xs);text-align:center;">
          此操作不可恢复，请谨慎操作
        </div>
      </div>
    `;
  }

  // ==================== Rule Item HTML ====================

  function _renderRuleItem(rule) {
    var thumbHtml = '';
    if (rule.image && rule.image.length > 10) {
      thumbHtml = '<img src="' + rule.image + '" class="rule-item-thumb">';
    } else {
      thumbHtml = '<div class="rule-item-icon">🏆</div>';
    }

    return `
      <div class="rule-item" data-rule-id="${rule.id}">
        <div class="rule-item-info">
          ${thumbHtml}
          <div>
            <div class="rule-item-days" style="font-size:var(--text-caption);color:var(--color-mute-dark);">累计 ${rule.days} 天</div>
            <div class="rule-item-reward" style="font-size:var(--text-body);color:var(--color-on-dark);">${rule.reward}</div>
          </div>
        </div>
        <div class="rule-item-actions">
          <button class="rule-action-btn rule-action-edit" data-id="${rule.id}">编辑</button>
          <button class="rule-action-btn rule-action-delete" data-id="${rule.id}">删除</button>
        </div>
      </div>
    `;
  }

  // ==================== Bind Settings Events ====================

  function _bindSettingsEvents(container) {
    // Password change
    var changePwdBtn = container.querySelector('#changePwdBtn');
    if (changePwdBtn) {
      changePwdBtn.addEventListener('click', function () {
        _handleChangePassword(container);
      });
    }

    // Add rule
    var addRuleBtn = container.querySelector('#addRuleBtn');
    if (addRuleBtn) {
      addRuleBtn.addEventListener('click', function () {
        _showRuleForm(container, null);
      });
    }

    // Edit / Delete rule buttons
    container.addEventListener('click', function (e) {
      var target = e.target;
      if (target.classList.contains('rule-action-edit')) {
        var ruleId = target.getAttribute('data-id');
        _handleEditRule(container, ruleId);
      } else if (target.classList.contains('rule-action-delete')) {
        var ruleId2 = target.getAttribute('data-id');
        _handleDeleteRule(container, ruleId2);
      }
    });

    // Upload area click
    var uploadArea = container.querySelector('#uploadArea');
    var fileInput = container.querySelector('#ruleImageInput');
    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', function () {
        fileInput.click();
      });
      fileInput.addEventListener('change', function () {
        _handleImageUpload(container, fileInput);
      });
    }

    // Remove image
    var removeBtn = container.querySelector('#removeImage');
    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        _removeImagePreview(container);
      });
    }

    // Save rule
    var saveBtn = container.querySelector('#saveRuleBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        _handleSaveRule(container);
      });
    }

    // Cancel rule form
    var cancelBtn = container.querySelector('#cancelRuleBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        _hideRuleForm(container);
      });
    }

    // Clear all
    var clearBtn = container.querySelector('#clearAllBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        _handleClearAll(container);
      });
    }
  }

  // ==================== Password Change ====================

  function _handleChangePassword(container) {
    var currentPwd = container.querySelector('#currentPwdInput').value;
    var newPwd = container.querySelector('#newPwdInput').value;
    var confirmPwd = container.querySelector('#confirmPwdInput').value;
    var errorEl = container.querySelector('#pwdChangeError');

    // Validate
    if (!Storage.verifyPassword(currentPwd)) {
      _showPwdError(errorEl, '当前密码错误');
      return;
    }
    if (!newPwd.trim()) {
      _showPwdError(errorEl, '新密码不能为空');
      return;
    }
    if (newPwd !== confirmPwd) {
      _showPwdError(errorEl, '两次输入的新密码不一致');
      return;
    }

    Storage.changePassword(currentPwd, newPwd);
    container.querySelector('#currentPwdInput').value = '';
    container.querySelector('#newPwdInput').value = '';
    container.querySelector('#confirmPwdInput').value = '';
    errorEl.classList.add('hidden');
    alert('密码修改成功');
  }

  function _showPwdError(errorEl, msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }

  // ==================== Rule Form ====================

  function _showRuleForm(container, rule) {
    var formSection = container.querySelector('#ruleFormSection');
    var titleEl = container.querySelector('#ruleFormTitle');
    var daysInput = container.querySelector('#ruleDaysInput');
    var rewardInput = container.querySelector('#ruleRewardInput');

    formSection.classList.remove('hidden');

    if (rule) {
      editingRuleId = rule.id;
      titleEl.textContent = '✏️ 编辑奖励规则';
      daysInput.value = rule.days;
      rewardInput.value = rule.reward;
      if (rule.image) {
        _showImagePreview(container, rule.image, '已上传图片', '');
      } else {
        _removeImagePreview(container);
      }
    } else {
      editingRuleId = null;
      titleEl.textContent = '✏️ 添加奖励规则';
      daysInput.value = '';
      rewardInput.value = '';
      _removeImagePreview(container);
    }

    // Scroll into view
    formSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function _hideRuleForm(container) {
    var formSection = container.querySelector('#ruleFormSection');
    formSection.classList.add('hidden');
    editingRuleId = null;
    _removeImagePreview(container);
  }

  // ==================== Image Upload ====================

  function _handleImageUpload(container, fileInput) {
    var file = fileInput.files[0];
    if (!file) return;

    ImageUtil.compress(file).then(function (base64) {
      var sizeStr = ImageUtil.formatSize(base64);
      _showImagePreview(container, base64, file.name, sizeStr);
    }).catch(function (err) {
      alert('图片处理失败：' + err.message);
    });

    // Reset file input so the same file can be selected again
    fileInput.value = '';
  }

  function _showImagePreview(container, base64, name, sizeStr) {
    var previewEl = container.querySelector('#imagePreview');
    var previewImg = container.querySelector('#previewImg');
    var previewName = container.querySelector('#previewName');
    var previewSize = container.querySelector('#previewSize');
    var uploadArea = container.querySelector('#uploadArea');

    previewImg.src = base64;
    previewName.textContent = name;
    previewSize.textContent = sizeStr;
    previewEl.classList.remove('hidden');
    uploadArea.classList.add('hidden');

    // Store the base64 on the preview element for retrieval
    previewEl.setAttribute('data-image', base64);
  }

  function _removeImagePreview(container) {
    var previewEl = container.querySelector('#imagePreview');
    var uploadArea = container.querySelector('#uploadArea');

    previewEl.classList.add('hidden');
    previewEl.removeAttribute('data-image');
    uploadArea.classList.remove('hidden');
    container.querySelector('#previewImg').src = '';
    container.querySelector('#previewName').textContent = '';
    container.querySelector('#previewSize').textContent = '';
  }

  // ==================== Save Rule ====================

  function _handleSaveRule(container) {
    var daysInput = container.querySelector('#ruleDaysInput');
    var rewardInput = container.querySelector('#ruleRewardInput');
    var previewEl = container.querySelector('#imagePreview');

    var days = parseInt(daysInput.value, 10);
    var reward = rewardInput.value.trim();

    if (!days || days < 1) {
      alert('请输入有效的天数');
      daysInput.focus();
      return;
    }
    if (!reward) {
      alert('请输入奖励内容');
      rewardInput.focus();
      return;
    }

    var image = previewEl.classList.contains('hidden') ? null : (previewEl.getAttribute('data-image') || null);

    if (editingRuleId) {
      Storage.updateRewardRule(editingRuleId, {
        days: days,
        reward: reward,
        image: image
      });
    } else {
      Storage.addRewardRule({
        days: days,
        reward: reward,
        image: image
      });
    }

    _hideRuleForm(container);
    _refreshRuleList(container);
  }

  // ==================== Edit / Delete Rule ====================

  function _handleEditRule(container, ruleId) {
    var rules = Storage.getRewardRules();
    var rule = null;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].id === ruleId) {
        rule = rules[i];
        break;
      }
    }
    if (rule) {
      _showRuleForm(container, rule);
    }
  }

  function _handleDeleteRule(container, ruleId) {
    if (!confirm('确定要删除此奖励规则吗？')) return;
    Storage.deleteRewardRule(ruleId);

    // If currently editing this rule, hide the form
    if (editingRuleId === ruleId) {
      _hideRuleForm(container);
    }

    _refreshRuleList(container);
  }

  // ==================== Clear All ====================

  function _handleClearAll(container) {
    if (!confirm('确定要清除所有打卡和奖励记录吗？此操作不可恢复！')) return;
    Storage.clearAllRecords();
    alert('所有记录已清除');
    _refreshRuleList(container);
  }

  // ==================== Refresh Rule List ====================

  function _refreshRuleList(container) {
    var rules = Storage.getRewardRules();
    var listContainer = container.querySelector('#ruleListContainer');
    if (rules.length > 0) {
      listContainer.innerHTML = rules.map(function (rule) {
        return _renderRuleItem(rule);
      }).join('');
    } else {
      listContainer.innerHTML = '<div style="text-align:center;color:var(--color-mute-dark);padding:var(--spacing-md);">暂无奖励规则</div>';
    }
  }

  return { render, resetAuth };
})();
