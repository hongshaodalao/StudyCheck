const CheckinPage = (() => {
  const SUBJECTS = [
    { key: 'english', label: '英语', icon: '📚' },
    { key: 'math', label: '数学', icon: '📐' },
    { key: 'chinese', label: '语文', icon: '📖' }
  ];

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
      + '</div>'
      + '</div>';
  }

  function _renderRewardProgress(progress) {
    if (!progress) return '';
    var percent = progress.nextDays > 0 ? Math.min(100, Math.round(progress.currentDays / progress.nextDays * 100)) : 0;
    var remaining = progress.remaining;

    return '<div class="card reward-progress">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-xs);">'
      + '<span>🏆 奖励进度</span>'
      + '<span style="font-size:var(--text-caption);color:var(--color-mute-dark);">'
      + progress.currentDays + ' / ' + progress.nextDays + ' 天'
      + '</span>'
      + '</div>'
      + '<div class="reward-progress-bar">'
      + '<div class="reward-progress-bar-fill" style="width:' + percent + '%"></div>'
      + '</div>'
      + '<div style="font-size:var(--text-caption);color:var(--color-mute-dark);margin-top:var(--spacing-xs);">'
      + (remaining > 0 ? '再打卡 ' + remaining + ' 天即可获得奖励！' : '已达成！')
      + '</div>'
      + '</div>';
  }

  function _handleSubjectClick(date, subjectKey) {
    if (Storage.isDayComplete(date)) return;

    var checkin = Storage.getCheckin(date);
    checkin[subjectKey] = !checkin[subjectKey];
    Storage.setCheckin(date, checkin);

    // 检查是否全部完成
    if (Storage.isDayComplete(date)) {
      // 检查新奖励
      var newRewards = Rewards.checkNewRewards();
      if (newRewards.length > 0) {
        setTimeout(function () {
          Rewards.showCelebration(newRewards);
        }, 500);
      }
    }

    render();
  }

  function render() {
    var container = document.getElementById('viewCheckin');
    if (!container) return;

    var today = _today();
    var checkin = Storage.getCheckin(today);
    var isComplete = Storage.isDayComplete(today);

    // 构建头部
    var html = '<div class="checkin-header">'
      + '<div class="checkin-date">' + _formatDate(today) + '</div>'
      + '<div class="checkin-title">今日打卡</div>'
      + '</div>';

    // 构建科目卡片
    html += '<div class="card">';
    for (var i = 0; i < SUBJECTS.length; i++) {
      var subject = SUBJECTS[i];
      var isChecked = checkin[subject.key] === true;
      html += _renderSubjectRow(subject, isChecked, isComplete);
    }
    html += '</div>';

    // 状态提示
    html += '<div class="checkin-status">';
    if (isComplete) {
      html += '<div class="status-complete">✅ 今日已完成</div>';
    } else {
      html += '<div class="status-pending">完成全部科目后自动打卡</div>';
    }
    html += '</div>';

    // 奖励进度
    var progress = Rewards.getNextRewardProgress();
    html += _renderRewardProgress(progress);

    container.innerHTML = html;

    // 绑定科目点击事件
    var rows = container.querySelectorAll('.checkin-subject:not(.locked)');
    for (var j = 0; j < rows.length; j++) {
      (function (row) {
        row.addEventListener('click', function () {
          var key = row.getAttribute('data-subject');
          _handleSubjectClick(today, key);
        });
      })(rows[j]);
    }
  }

  return { render: render };
})();
