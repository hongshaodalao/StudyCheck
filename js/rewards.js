const Rewards = (() => {
  /**
   * 检查今天是否有奖励规则，且三科全部完成
   * 如有则弹出庆祝弹窗
   */
  function checkTodayReward() {
    var today = _today();
    var rule = Storage.getRewardRuleByDate(today);
    if (!rule) return;
    if (!Storage.isDayComplete(today)) return;
    showCelebration(rule);
  }

  /**
   * 显示奖励庆祝弹窗
   */
  function showCelebration(rule) {
    var imageHtml = rule.image && rule.image.length > 10
      ? '<img src="' + rule.image + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-bottom:12px;">'
      : '<div style="font-size:64px;margin-bottom:16px;text-align:center;">🏆</div>';

    var html =
      '<div style="overflow:hidden;"><button class="modal-close" onclick="App.closeModal()">✕</button></div>' +
      '<div style="text-align:center;padding:16px 0;">' +
        imageHtml +
        '<div style="font-size:12px;color:rgba(229,229,229,0.55);margin-bottom:12px;">' +
          rule.date +
        '</div>' +
        '<div style="background:linear-gradient(135deg, rgba(255,206,33,0.15), rgba(238,142,0,0.15));border:1px solid rgba(255,206,33,0.3);border-radius:8px;padding:16px;margin-bottom:12px;">' +
          '<div style="font-size:12px;color:#ffce21;margin-bottom:4px;">' +
            '🎉 恭喜获得奖励！' +
          '</div>' +
          '<div style="font-size:22px;font-weight:600;">' +
            rule.reward +
          '</div>' +
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

  return { checkTodayReward, showCelebration };
})();
