const App = (() => {
  let currentView = 'checkin';

  function init() {
    Storage.init();
    CalendarPage.init();
    _applyTheme();
    _bindNavigation();
    _navigateTo('checkin');
  }

  function _applyTheme() {
    var theme = Storage.getTheme();
    if (theme && theme !== 'playstation') {
      document.body.setAttribute('data-theme', theme);
    }
  }

  function showModal(html) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    content.innerHTML = html;
    overlay.classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
  }

  function _bindNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        _navigateTo(link.dataset.view);
      });
    });

    document.querySelectorAll('.nav-bottom-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        _navigateTo(link.dataset.view);
      });
    });

    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
  }

  function _navigateTo(view) {
    currentView = view;

    // 更新导航高亮
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === view);
    });
    document.querySelectorAll('.nav-bottom-item').forEach(link => {
      link.classList.toggle('active', link.dataset.view === view);
    });

    // 切换视图可见性
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view${_capitalize(view)}`).classList.remove('hidden');

    // 渲染对应页面
    switch (view) {
      case 'checkin': CheckinPage.render(); break;
      case 'calendar': CalendarPage.render(); break;
      case 'settings': SettingsPage.render(); break;
    }
  }

  function _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return { init, showModal, closeModal };
})();

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.init());
