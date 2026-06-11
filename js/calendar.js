const CalendarPage = (() => {
  let currentYear, currentMonth;

  function init() {
    var now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;
  }

  function render() {
    var container = document.getElementById('viewCalendar');
    if (!container) return;
    var todayStr = _today();
    var daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    var firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();
    var monthCompleted = Storage.getCompletedDaysInMonth(currentYear, currentMonth);
    var totalCompleted = Storage.getCompletedDays();

    // 构建奖励规则日期映射
    var rules = Storage.getRewardRules();
    var ruleMap = {};
    for (var r = 0; r < rules.length; r++) {
      ruleMap[rules[r].date] = rules[r];
    }

    // 构建日历格子
    var gridHtml = '';
    for (var i = 0; i < firstDayOfWeek; i++) {
      gridHtml += '<span class="calendar-day calendar-day-empty"></span>';
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var dateStr = currentYear + '-' +
        String(currentMonth).padStart(2, '0') + '-' +
        String(day).padStart(2, '0');

      var classes = 'calendar-day';
      var icon = '';
      var dataAttr = '';

      var hasRule = !!ruleMap[dateStr];
      var isComplete = Storage.isDayComplete(dateStr);

      if (hasRule && isComplete) {
        // 已获得奖励（金色实心 + 🏆）
        classes += ' calendar-day-reward';
        icon = '<span class="calendar-reward-icon">🏆</span>';
        dataAttr = ' data-date="' + dateStr + '" data-type="earned"';
      } else if (hasRule) {
        // 有奖励但未完成（金色描边 + 🎁）
        classes += ' calendar-day-reward-target';
        icon = '<span class="calendar-reward-icon">🎁</span>';
        dataAttr = ' data-date="' + dateStr + '" data-type="pending"';
      } else if (isComplete) {
        // 已完成无奖励（蓝色）
        classes += ' calendar-day-complete';
      }

      if (dateStr === todayStr) {
        classes += ' calendar-day-today';
      }

      gridHtml += '<span class="' + classes + '"' + dataAttr + '>' + day + icon + '</span>';
    }

    var weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    var weekdayHtml = weekdays.map(function (w) { return '<span>' + w + '</span>'; }).join('');

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
          '<div class="calendar-legend-item"><span class="calendar-legend-dot calendar-legend-dot-complete"></span><span>已打卡</span></div>' +
          '<div class="calendar-legend-item"><span class="calendar-legend-dot calendar-legend-dot-reward"></span><span>奖励</span></div>' +
          '<div class="calendar-legend-item"><span class="calendar-legend-dot calendar-legend-dot-today"></span><span>今天</span></div>' +
        '</div>' +
        '<div class="calendar-stats">' +
          '<div class="calendar-stat"><div class="calendar-stat-value">' + monthCompleted + '</div><div class="calendar-stat-label">本月完成</div></div>' +
          '<div class="calendar-stat"><div class="calendar-stat-value">' + totalCompleted + '</div><div class="calendar-stat-label">累计完成</div></div>' +
        '</div>' +
      '</div>';

    _bindEvents(container);
  }

  function _bindEvents(container) {
    var prevBtn = container.querySelector('#calendarPrev');
    var nextBtn = container.querySelector('#calendarNext');
    if (prevBtn) prevBtn.addEventListener('click', _prevMonth);
    if (nextBtn) nextBtn.addEventListener('click', _nextMonth);

    // 点击奖励日查看详情
    var rewardDays = container.querySelectorAll('.calendar-day-reward, .calendar-day-reward-target');
    for (var i = 0; i < rewardDays.length; i++) {
      rewardDays[i].addEventListener('click', function () {
        _showRewardDetail(this.getAttribute('data-date'));
      });
    }
  }

  function _showRewardDetail(dateStr) {
    var rule = Storage.getRewardRuleByDate(dateStr);
    if (!rule) return;

    var isComplete = Storage.isDayComplete(dateStr);
    var imageHtml = rule.image && rule.image.length > 10
      ? '<img src="' + rule.image + '" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:12px;">'
      : '<div style="font-size:48px;margin-bottom:12px;text-align:center;">' + (isComplete ? '🏆' : '🎁') + '</div>';

    var statusText = isComplete
      ? '<div style="color:#ffce21;font-size:13px;font-weight:600;">✅ 已获得</div>'
      : '<div style="font-size:13px;color:rgba(229,229,229,0.55);">完成今日打卡即可获得</div>';

    var html =
      '<div style="overflow:hidden;"><button class="modal-close" onclick="App.closeModal()">✕</button></div>' +
      '<div style="text-align:center;padding:12px 0;">' +
        imageHtml +
        '<div style="font-size:12px;color:rgba(229,229,229,0.55);margin-bottom:8px;">' + dateStr + '</div>' +
        '<div style="background:linear-gradient(135deg, rgba(255,206,33,0.15), rgba(238,142,0,0.15));border:1px solid rgba(255,206,33,0.3);border-radius:8px;padding:14px;margin-bottom:12px;">' +
          '<div style="font-size:12px;color:#ffce21;margin-bottom:4px;">🎁 奖励内容</div>' +
          '<div style="font-size:20px;font-weight:600;">' + rule.reward + '</div>' +
        '</div>' +
        statusText +
      '</div>';

    App.showModal(html);
  }

  function _today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function _prevMonth() {
    currentMonth--;
    if (currentMonth < 1) { currentMonth = 12; currentYear--; }
    render();
  }

  function _nextMonth() {
    currentMonth++;
    if (currentMonth > 12) { currentMonth = 1; currentYear++; }
    render();
  }

  return { init: init, render: render };
})();
