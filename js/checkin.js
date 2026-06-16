const CheckinPage = (() => {
  function _today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function _formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    var weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + weekdays[d.getDay()];
  }

  function _renderSubjectRow(subject, isChecked, isLocked) {
    return '<div class="checkin-subject ' + (isLocked ? 'locked' : '') + '" data-subject="' + subject.key + '">'
      + '<span class="checkin-subject-icon">' + subject.icon + '</span>'
      + '<span class="checkin-subject-label">' + subject.label + '</span>'
      + '<div class="checkin-checkbox ' + (isChecked ? 'checked' : '') + '">'
      + (isChecked ? '✓' : '')
      + '</div></div>';
  }

  function _handleSubjectClick(date, subjectKey) {
    if (Storage.isDayComplete(date)) return;
    var checkin = Storage.getCheckin(date);
    checkin[subjectKey] = !checkin[subjectKey];
    Storage.setCheckinFull(date, checkin);
    if (Storage.isDayComplete(date)) {
      setTimeout(function () { Rewards.checkTodayReward(); }, 300);
    }
    render();
  }

  function render() {
    var container = document.getElementById('viewCheckin');
    if (!container) return;
    var today = _today();
    var subjects = Storage.getSubjects();
    var checkin = Storage.getCheckin(today);
    var isComplete = Storage.isDayComplete(today);

    var html = '<div class="checkin-header">'
      + '<div class="checkin-date">' + _formatDate(today) + '</div>'
      + '<div class="checkin-title">今日打卡</div></div>';

    html += '<div class="card">';
    for (var i = 0; i < subjects.length; i++) {
      html += _renderSubjectRow(subjects[i], checkin[subjects[i].key] === true, isComplete);
    }
    html += '</div>';

    html += '<div class="checkin-status">';
    if (isComplete) {
      html += '<div class="status-complete">✅ 今日已完成</div>';
    } else {
      html += '<div class="status-pending">完成全部科目后自动打卡</div>';
    }
    html += '</div>';

    // 奖励区域
    var todayRule = Storage.getRewardRuleByDate(today);
    if (todayRule) {
      html += '<div class="card" style="margin-top:var(--spacing-lg);text-align:center;">';
      html += '<div style="font-size:var(--text-small);color:var(--color-mute-dark);">🎁 今日奖励</div>';
      html += '<div style="font-size:var(--text-body);font-weight:600;margin-top:var(--spacing-xxs);">' + todayRule.reward + '</div>';
      if (isComplete) {
        html += '<div style="font-size:var(--text-small);color:#ffce21;margin-top:var(--spacing-xs);">🎉 已获得！</div>';
      } else {
        html += '<div style="font-size:var(--text-small);color:var(--color-mute-dark);margin-top:var(--spacing-xs);">完成打卡即可获得</div>';
      }
      html += '</div>';
    } else {
      var nextReward = _getNextReward(today);
      if (nextReward) {
        var daysUntil = _daysBetween(today, nextReward.date);
        html += _renderRewardProgress(nextReward, daysUntil);
      }
    }

    container.innerHTML = html;

    // 绑定事件
    var rows = container.querySelectorAll('.checkin-subject:not(.locked)');
    for (var j = 0; j < rows.length; j++) {
      (function (row) {
        row.addEventListener('click', function () {
          _handleSubjectClick(today, row.getAttribute('data-subject'));
        });
      })(rows[j]);
    }
  }

  function _getNextReward(today) {
    var rules = Storage.getRewardRules();
    var next = null;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].date >= today && !Storage.isDayComplete(rules[i].date)) {
        if (!next || rules[i].date < next.date) next = rules[i];
      }
    }
    return next;
  }

  function _daysBetween(d1, d2) {
    return Math.round((new Date(d2 + 'T00:00:00') - new Date(d1 + 'T00:00:00')) / 86400000);
  }

  function _renderRewardProgress(rule, daysUntil) {
    return '<div class="card reward-progress" style="margin-top:var(--spacing-lg);">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-xs);">'
      + '<span style="font-size:var(--text-caption);">🎁 下一个奖励</span>'
      + '<span style="font-size:var(--text-small);color:var(--color-mute-dark);">' + rule.date + '</span></div>'
      + '<div style="font-size:var(--text-body);font-weight:600;margin-bottom:var(--spacing-sm);">' + rule.reward + '</div>'
      + '<div class="reward-progress-bar"><div class="reward-progress-bar-fill" style="width:0%"></div></div>'
      + '<div style="font-size:var(--text-small);color:var(--color-mute-dark);margin-top:var(--spacing-xs);">还需 ' + daysUntil + ' 天</div></div>';
  }

  return { render: render };
})();
