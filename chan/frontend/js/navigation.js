class PageNavigator {
    constructor() {
        this.currentPage = 'welcome';
        this.pages = {
            welcome: document.getElementById('welcome'),
            meditation: document.getElementById('meditation'),
            zenMaster: document.getElementById('zen-master'),
            cultivation: document.getElementById('cultivation')
        };
        
        this.initializeNavigation();
    }

    initializeNavigation() {
        // 处理开始按钮
        const startBtn = document.querySelector('.start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.navigateToPage('meditation'));
        }

        // 处理所有返回按钮
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.navigateToPage('welcome'));
        });

        // 处理底部导航
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // 阻止事件冒泡
                const target = e.target.getAttribute('href').replace('#', '');
                console.log('Navigation clicked:', target); // 添加调试日志
                
                switch(target) {
                    case 'home':
                        this.navigateToPage('meditation');
                        break;
                    case 'chat':
                        this.navigateToPage('zenMaster');
                        break;
                    case 'cultivation':
                        this.navigateToPage('cultivation');
                        break;
                }
            });
        });

        // 处理论禅按钮
        const chatBtn = document.querySelector('.chat-btn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                this.navigateToPage('zenMaster');
                setTimeout(() => {
                    this.initiateChatInterface();
                }, 100);
            });
        }

        // 添加禅境页面的按钮事件处理
        const startSessionBtn = document.querySelector('.start-session-btn');
        if (startSessionBtn) {
            startSessionBtn.addEventListener('click', () => {
                this.navigateToPage('meditation');
            });
        }
    }

    navigateToPage(pageName) {
        console.log('Navigating to:', pageName); // 添加调试日志
        
        // 隐藏所有页面
        Object.values(this.pages).forEach(page => {
            if (page) {
                page.classList.add('hidden');
            }
        });

        // 显示目标页面
        const targetPage = this.pages[pageName];
        if (targetPage) {
            targetPage.classList.remove('hidden');
            this.currentPage = pageName;
            
            // 更新底部导航激活状态
            this.updateNavigationState(pageName);
        } else {
            console.error('Target page not found:', pageName);
        }
    }

    updateNavigationState(pageName) {
        // 更新底部导航栏的激活状态
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href').replace('#', '');
            
            switch(pageName) {
                case 'meditation':
                    if (href === 'home') {
                        item.classList.add('active');
                    }
                    break;
                case 'zenMaster':
                    if (href === 'chat') {
                        item.classList.add('active');
                    }
                    break;
                case 'cultivation':
                    if (href === 'cultivation') {
                        item.classList.add('active');
                    }
                    break;
            }
        });
    }

    initiateChatInterface() {
        const masterContent = document.querySelector('.master-content');
        if (masterContent) {
            masterContent.innerHTML = '';
            new ZenChat();
        }
    }
}

// 当文档加载完成时初始化导航
document.addEventListener('DOMContentLoaded', () => {
    const navigator = new PageNavigator();
}); 