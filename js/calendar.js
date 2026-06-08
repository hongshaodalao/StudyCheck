const CalendarPage = (() => {
  let currentYear, currentMonth;

  function init() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;
  }

  function render() {
    const container = document.getElementById('viewCalendar');
    if (!container) return;
    const todayStr = _today();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0=Sunday
    const monthCompleted = Storage.getCompletedDaysInMonth(currentYear, currentMonth);
    const totalCompleted = Storage.getCompletedDays();

    // Build calendar grid cells
    let gridHtml = '';

    // Empty cells for alignment before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      gridHtml += '<span class="calendar-day calendar-day-empty"></span>';
    }

    // 计算未来奖励目标日期
    var futureRewardDates = _calcFutureRewardDates(totalCompleted, todayStr);

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = currentYear + '-' +
        String(currentMonth).padStart(2, '0') + '-' +
        String(day).padStart(2, '0');

      let classes = 'calendar-day';
      let rewardIcon = '';
      let dataAttr = '';

      // 已获得的奖励（金色实心）— 需确认规则仍存在
      const rewardRecord = Storage.getRewardAtDate(dateStr);
      if (rewardRecord && _ruleExists(rewardRecord.days, rewardRecord.reward)) {
        classes += ' calendar-day-reward';
        rewardIcon = '<span class="calendar-reward-icon">🏆</span>';
        dataAttr = ' data-date="' + dateStr + '" data-type="earned"';
      } else if (futureRewardDates[dateStr]) {
        // 未来奖励目标（金色描边）
        classes += ' calendar-day-reward-target';
        rewardIcon = '<span class="calendar-reward-icon">🎁</span>';
        dataAttr = ' data-date="' + dateStr + '" data-type="target" data-rule=\'' + JSON.stringify(futureRewardDates[dateStr]) + '\'';
      } else if (Storage.isDayComplete(dateStr)) {
        classes += ' calendar-day-complete';
      }

      // Today outline
      if (dateStr === todayStr) {
        classes += ' calendar-day-today';
      }

      gridHtml += '<span class="' + classes + '"' + dataAttr + '>' +
        day + rewardIcon + '</span>';
    }

    // Weekday headers
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekdayHtml = weekdays.map(function (w) {
      return '<span>' + w + '</span>';
    }).join('');

    container.innerHTML =
      '<div class="calendar-nav">' +
        '<button class="calendar-nav-btn" id="calendarPrev">◀</button>' +
        '<span class="calendar-nav-title">' + currentYear + '年' + currentMonth + '月</span>' +
        '<button class="calendar-nav-btn" id="calendarNext">▶</button>' +
      '</div>' +
      '<div class="card">' +
        '<div class="calendar-weekdays">' + weekdayHtml + '</div>' +
        '<div class="calendar-grid">' + gridHtml + '</div>' +
        '<div class="calendar-legend">' +
          '<div class="calendar-legend-item">' +
            '<span class="calendar-legend-dot calendar-legend-dot-complete"></span>' +
            '<span>已打卡</span>' +
          '</div>' +
          '<div class="calendar-legend-item">' +
            '<span class="calendar-legend-dot calendar-legend-dot-reward"></span>' +
            '<span>奖励</span>' +
          '</div>' +
          '<div class="calendar-legend-item">' +
            '<span class="calendar-legend-dot calendar-legend-dot-today"></span>' +
            '<span>今天</span>' +
          '</div>' +
        '</div>' +
        '<div class="calendar-stats">' +
          '<div class="calendar-stat">' +
            '<div class="calendar-stat-value">' + monthCompleted + '</div>' +
            '<div class="calendar-stat-label">本月完成 ' + monthCompleted + ' 天</div>' +
          '</div>' +
          '<div class="calendar-stat">' +
            '<div class="calendar-stat-value">' + totalCompleted + '</div>' +
            '<div class="calendar-stat-label">累计完成 ' + totalCompleted + ' 天</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Bind events
    _bindEvents(container);
  }

  /**
   * 计算未来奖励目标日期
   * @param {number} totalCompleted - 已完成天数
   * @param {string} todayStr - 今天日期
   * @returns {Object} { "YYYY-MM-DD": rule } 映射
   */
  function _calcFutureRewardDates(totalCompleted, todayStr) {
    var rules = Storage.getRewardRules().sort(function (a, b) { return a.days - b.days; });
    var history = Storage.getRewardHistory();
    var todayComplete = Storage.isDayComplete(todayStr);
    var result = {};

    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      // 检查是否已获得或已删除
      var rewardKey = rule.days + ':' + rule.reward;
      var achieved = history.some(function (h) {
        return h.days === rule.days && h.reward === rule.reward;
      });
      var wasDeleted = Storage.isRewardDeleted(rewardKey);
      if (achieved || wasDeleted) continue;

      // 如果今天已完成，算上今天；否则不算今天
      var effectiveCompleted = todayComplete ? totalCompleted : totalCompleted;
      // 还需要多少天（含今天如果未完成）
      var remaining = rule.days - totalCompleted;
      if (remaining <= 0) continue;

      // 如果今天还没打卡，今天也算一天（今天打卡就能完成）
      // 所以目标日期 = 今天 + (remaining - 1) 天
      var daysFromToday = todayComplete ? remaining : remaining - 1;
      if (daysFromToday < 0) daysFromToday = 0;

      var targetDate = new Date(todayStr + 'T00:00:00');
      targetDate.setDate(targetDate.getDate() + daysFromToday);
      var dateStr = targetDate.getFullYear() + '-' +
        String(targetDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(targetDate.getDate()).padStart(2, '0');
      result[dateStr] = rule;
    }

    return result;
  }

  function _bindEvents(container) {
    // Prev / Next month
    var prevBtn = container.querySelector('#calendarPrev');
    var nextBtn = container.querySelector('#calendarNext');
    if (prevBtn) {
      prevBtn.addEventListener('click', _prevMonth);
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', _nextMonth);
    }

    // 已获得的奖励（金色实心）
    var earnedDays = container.querySelectorAll('.calendar-day-reward');
    for (var i = 0; i < earnedDays.length; i++) {
      earnedDays[i].addEventListener('click', function () {
        _showEarnedRewardDetail(this.getAttribute('data-date'));
      });
    }

    // 未来奖励目标（金色描边）
    var targetDays = container.querySelectorAll('.calendar-day-reward-target');
    for (var j = 0; j < targetDays.length; j++) {
      targetDays[j].addEventListener('click', function () {
        var ruleData = this.getAttribute('data-rule');
        _showTargetRewardDetail(ruleData, this.getAttribute('data-date'));
      });
    }
  }

  // 已获得奖励弹窗
  function _showEarnedRewardDetail(dateStr) {
    var record = Storage.getRewardAtDate(dateStr);
    if (!record) return;

    var imageHtml = record.image
      ? '<img src="' + record.image + '" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:12px;">'
      : '<div style="font-size:48px;margin-bottom:12px;text-align:center;">🏆</div>';

    var progress = Rewards.getNextRewardProgress();
    var remainingText = progress
      ? '距下个奖励还需 ' + progress.remaining + ' 天'
      : '已获得全部奖励 🎉';

    var html =
      '<div style="overflow:hidden;">' +
      '<button class="modal-close" onclick="App.closeModal()">✕</button>' +
      '</div>' +
      '<div style="text-align:center;padding:12px 0;">' +
        imageHtml +
        '<div style="font-size:12px;color:rgba(229,229,229,0.55);margin-bottom:8px;">' +
          '获得日期：' + record.achievedAt +
        '</div>' +
        '<div style="background:linear-gradient(135deg, rgba(255,206,33,0.15), rgba(238,142,0,0.15));border:1px solid rgba(255,206,33,0.3);border-radius:8px;padding:14px;margin-bottom:12px;">' +
          '<div style="font-size:12px;color:#ffce21;margin-bottom:4px;">' +
            '累计打卡 ' + record.days + ' 天' +
          '</div>' +
          '<div style="font-size:20px;font-weight:600;">' +
            record.reward +
          '</div>' +
        '</div>' +
        '<div style="font-size:13px;color:rgba(229,229,229,0.55);">' +
          remainingText +
        '</div>' +
      '</div>';

    App.showModal(html);
  }

  // 未来奖励目标弹窗
  function _showTargetRewardDetail(ruleJson, dateStr) {
    var rule;
    try { rule = JSON.parse(ruleJson); } catch (e) { return; }

    var imageHtml = rule.image && rule.image.length > 10
      ? '<img src="' + rule.image + '" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:12px;">'
      : '<div style="font-size:48px;margin-bottom:12px;text-align:center;">🎁</div>';

    var totalCompleted = Storage.getCompletedDays();
    var remaining = rule.days - totalCompleted;

    var html =
      '<div style="overflow:hidden;">' +
      '<button class="modal-close" onclick="App.closeModal()">✕</button>' +
      '</div>' +
      '<div style="text-align:center;padding:12px 0;">' +
        imageHtml +
        '<div style="font-size:12px;color:rgba(229,229,229,0.55);margin-bottom:8px;">' +
          '预计获得日期：' + dateStr +
        '</div>' +
        '<div style="background:linear-gradient(135deg, rgba(255,206,33,0.15), rgba(238,142,0,0.15));border:1px solid rgba(255,206,33,0.3);border-radius:8px;padding:14px;margin-bottom:12px;">' +
          '<div style="font-size:12px;color:#ffce21;margin-bottom:4px;">' +
            '累计打卡 ' + rule.days + ' 天' +
          '</div>' +
          '<div style="font-size:20px;font-weight:600;">' +
            rule.reward +
          '</div>' +
        '</div>' +
        '<div style="font-size:13px;color:rgba(229,229,229,0.55);">' +
          '还需再打卡 ' + remaining + ' 天' +
        '</div>' +
      '</div>';

    App.showModal(html);
  }

  function _ruleExists(days, reward) {
    var rules = Storage.getRewardRules();
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].days === days && rules[i].reward === reward) return true;
    }
    return false;
  }

  function _today() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
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

  return { init: init, render: render };
})();
