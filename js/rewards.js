const Rewards = (() => {
  /**
   * 检查新达成的奖励。将已完成天数与奖励规则对比，
   * 对于已完成天数 >= 规则天数且历史中无对应记录的规则，
   * 创建新的奖励记录并加入 newRewards 数组。
   * @returns {Array} 新达成的奖励记录数组
   */
  function checkNewRewards() {
    const completedDays = Storage.getCompletedDays();
    const rules = Storage.getRewardRules().sort((a, b) => a.days - b.days);
    const history = Storage.getRewardHistory();
    const newRewards = [];

    for (const rule of rules) {
      if (completedDays >= rule.days) {
        var rewardKey = rule.days + ':' + rule.reward;
        const alreadyAchieved = history.some(h =>
          h.days === rule.days && h.reward === rule.reward
        );
        const wasDeleted = Storage.isRewardDeleted(rewardKey);
        if (!alreadyAchieved && !wasDeleted) {
          const record = {
            achievedAt: _today(),
            days: rule.days,
            reward: rule.reward,
            image: rule.image || null
          };
          Storage.addRewardRecord(record);
          newRewards.push(record);
        }
      }
    }
    return newRewards;
  }

  /**
   * 显示奖励庆祝弹窗。如果有多条奖励，先显示第一条，
   * 3 秒后自动显示下一条。
   * @param {Array} rewards - 要展示的奖励记录数组
   */
  function showCelebration(rewards) {
    if (!rewards.length) return;
    const reward = rewards[0];

    const imageHtml = reward.image
      ? `<img src="${reward.image}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px;">`
      : `<div style="font-size:64px;margin-bottom:16px;text-align:center;">🏆</div>`;

    const footerText = rewards.length > 1
      ? `还有 ${rewards.length - 1} 个奖励待查看`
      : '继续加油！';

    const html = `
      <div style="overflow:hidden;"><button class="modal-close" onclick="App.closeModal()">✕</button></div>
      <div style="text-align:center;padding:16px 0;">
        ${imageHtml}
        <div style="font-size:12px;color:rgba(229,229,229,0.55);margin-bottom:12px;">
          ${reward.achievedAt}
        </div>
        <div style="background:linear-gradient(135deg, rgba(255,206,33,0.15), rgba(238,142,0,0.15));border:1px solid rgba(255,206,33,0.3);border-radius:8px;padding:16px;margin-bottom:24px;">
          <div style="font-size:12px;color:#ffce21;margin-bottom:4px;">
            累计打卡 ${reward.days} 天
          </div>
          <div style="font-size:22px;font-weight:600;">
            ${reward.reward}
          </div>
        </div>
        <div style="font-size:14px;color:rgba(229,229,229,0.55);">
          ${footerText}
        </div>
      </div>
    `;

    App.showModal(html);

    if (rewards.length > 1) {
      setTimeout(() => {
        showCelebration(rewards.slice(1));
      }, 3000);
    }
  }

  /**
   * 计算距离下一个奖励的进度。
   * @returns {{ nextDays: number, currentDays: number, remaining: number }|null}
   */
  function getNextRewardProgress() {
    const completedDays = Storage.getCompletedDays();
    const rules = Storage.getRewardRules().sort((a, b) => a.days - b.days);
    const history = Storage.getRewardHistory();

    for (const rule of rules) {
      const achieved = history.some(h =>
        h.days === rule.days && h.reward === rule.reward
      );
      if (!achieved) {
        return {
          nextDays: rule.days,
          currentDays: completedDays,
          remaining: rule.days - completedDays
        };
      }
    }
    return null;
  }

  function _today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return { checkNewRewards, showCelebration, getNextRewardProgress };
})();
