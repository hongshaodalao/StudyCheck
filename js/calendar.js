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

    // 确保奖励记录完整（补偿可能遗漏的奖励检测）
    Rewards.checkNewRewards();

    // Build calendar grid cells
    let gridHtml = '';

    // Empty cells for alignment before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      gridHtml += '<span class="calendar-day calendar-day-empty"></span>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = currentYear + '-' +
        String(currentMonth).padStart(2, '0') + '-' +
        String(day).padStart(2, '0');

      let classes = 'calendar-day';
      let rewardIcon = '';

      // Check reward first (takes priority over complete styling)
      const rewardRecord = Storage.getRewardAtDate(dateStr);
      if (rewardRecord) {
        classes += ' calendar-day-reward';
        rewardIcon = '<span class="calendar-reward-icon">\u{1F3C6}</span>';
      } else if (Storage.isDayComplete(dateStr)) {
        classes += ' calendar-day-complete';
      }

      // Today outline
      if (dateStr === todayStr) {
        classes += ' calendar-day-today';
      }

      gridHtml += '<span class="' + classes + '" data-date="' + dateStr + '">' +
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

    // Click on reward day
    var rewardDays = container.querySelectorAll('.calendar-day-reward');
    for (var i = 0; i < rewardDays.length; i++) {
      rewardDays[i].addEventListener('click', function () {
        var dateStr = this.getAttribute('data-date');
        _showRewardDetail(dateStr);
      });
    }
  }

  function _showRewardDetail(dateStr) {
    var record = Storage.getRewardAtDate(dateStr);
    if (!record) return;

    var imageHtml = record.image
      ? '<img src="' + record.image + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px;">'
      : '<div style="font-size:48px;margin-bottom:16px;">🏆</div>';

    var progress = Rewards.getNextRewardProgress();
    var remainingText = '';
    if (progress) {
      remainingText = '距下个奖励还差 ' + progress.remaining + ' 天';
    } else {
      remainingText = '所有奖励已全部获得！';
    }

    var html =
      '<button class="modal-close" onclick="App.closeModal()">✕</button>' +
      '<div style="text-align:center;padding:16px 0;">' +
        imageHtml +
        '<div style="font-size:12px;color:rgba(229,229,229,0.55);margin-bottom:12px;">' +
          record.achievedAt +
        '</div>' +
        '<div style="background:linear-gradient(135deg, rgba(255,206,33,0.15), rgba(238,142,0,0.15));border:1px solid rgba(255,206,33,0.3);border-radius:8px;padding:16px;margin-bottom:24px;">' +
          '<div style="font-size:12px;color:#ffce21;margin-bottom:4px;">' +
            '累计打卡 ' + record.days + ' 天' +
          '</div>' +
          '<div style="font-size:22px;font-weight:600;">' +
            record.reward +
          '</div>' +
        '</div>' +
        '<div style="font-size:14px;color:rgba(229,229,229,0.55);">' +
          remainingText +
        '</div>' +
      '</div>';

    App.showModal(html);
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
