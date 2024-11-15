class WelcomePage {
    constructor() {
        this.quotes = [
            "心若冰清，天塌不惊。",
            "万法归一，一归何处？",
            "一花一世界，一叶一菩提。",
            "春有百花秋有月，夏有凉风冬有雪。",
            "心若无事便是禅。",
            "禅心一片清风明月。",
            "万缘放下，一念不生。",
            "明月松间照，清泉石上流。",
            "菩提本无树，明镜亦非台。",
            "静坐常思己过，闲谈莫论人非。"
        ];
        
        this.initElements();
        this.updateDateTime();
        this.updateQuote();
        this.initEventListeners();
        this.initButtons();
        
        // 每分钟更新时间
        setInterval(() => this.updateDateTime(), 60000);
        // 每30分钟更新禅语
        setInterval(() => this.updateQuote(), 1800000);
    }

    initElements() {
        this.timeElement = document.querySelector('.time');
        this.dateElement = document.querySelector('.date');
        this.quoteElement = document.querySelector('.zen-quote');
        this.meditationBtn = document.querySelector('.meditation-toggle-btn');
    }

    updateDateTime() {
        const now = new Date();
        
        // 更新时间
        this.timeElement.textContent = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        // 更新日期
        this.dateElement.textContent = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    updateQuote() {
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        this.quoteElement.textContent = randomQuote;
    }

    initEventListeners() {
        if (this.meditationBtn) {
            this.meditationBtn.addEventListener('click', () => {
                const isActive = this.meditationBtn.classList.toggle('active');
                
                if (isActive) {
                    this.meditationBtn.querySelector('.meditation-label').textContent = '结束冥想';
                    window.zenSounds.playMeditationSounds();
                } else {
                    this.meditationBtn.querySelector('.meditation-label').textContent = '开始冥想';
                    window.zenSounds.stopMeditationSounds();
                }
            });
        }
    }

    initButtons() {
        // 获取按钮元素
        const zenButton = document.querySelector('.zen-btn');
        const motoButton = document.querySelector('.moto-btn');

        // 添加禅境模式按钮点击事件
        if (zenButton) {
            zenButton.addEventListener('click', () => {
                // 隐藏欢迎页面
                document.querySelector('#welcome').classList.add('hidden');
                // 显示禅境首页
                document.querySelector('#zen-home').classList.remove('hidden');
            });
        }

        // 添加机车模式按钮点击事件
        if (motoButton) {
            motoButton.addEventListener('click', () => {
                // 跳转到机车模式页面
                window.location.href = 'motormode/index.html';
            });
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new WelcomePage();
}); 