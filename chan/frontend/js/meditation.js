// import { cultivationManager } from './cultivation.js';

class MeditationPage {
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

        this.isPlaying = false;
        this.duration = 180; // 3分钟
        this.currentTime = this.duration;
        this.timer = null;
        
        this.initElements();
        this.initEventListeners();
        this.loadPreferredCard();
    }

    initElements() {
        this.timeElement = document.querySelector('.meditation-page .time');
        this.dateElement = document.querySelector('.meditation-page .date');
        this.quoteElement = document.querySelector('.meditation-page .zen-quote');
        this.minutesDisplay = document.querySelector('.meditation-page .minutes');
        this.secondsDisplay = document.querySelector('.meditation-page .seconds');
        this.startTimerBtn = document.querySelector('.meditation-page .start-timer-btn');
        this.meditationSoundBtn = document.querySelector('.meditation-page .meditation-sound-btn');
        
        console.log('Timer button found:', this.startTimerBtn);
        
        this.simpleCard = document.querySelector('.meditation-page .simple-card');
        this.timerCard = document.querySelector('.meditation-page .timer-card');
        this.switchBtn = document.querySelector('.meditation-page .switch-card-btn');
    }

    updateDateTime() {
        const now = new Date();
        // 只在没有计时的时候更新时间显示
        if (!this.timer) {
            this.timeElement.textContent = now.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
        
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
        console.log('Initializing event listeners');
        this.startTimerBtn.addEventListener('click', () => {
            console.log('Timer button clicked');
            this.toggleTimer();
        });

        if (this.meditationSoundBtn) {
            this.meditationSoundBtn.addEventListener('click', () => {
                const isActive = this.meditationSoundBtn.classList.toggle('active');
                if (isActive) {
                    window.zenSounds.playMeditationSounds();
                } else {
                    window.zenSounds.stopMeditationSounds();
                }
            });
        }
        
        if (this.switchBtn) {
            this.switchBtn.addEventListener('click', () => this.toggleCardStyle());
        }
    }

    toggleTimer() {
        if (!this.timer) {
            this.startTimer();
        } else {
            this.stopTimer();
        }
    }

    startTimer() {
        if (this.timer) return;

        // 重置计时器
        this.currentTime = this.duration;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.updateTimerDisplay();
            } else {
                this.stopTimer();
                // 播放风声
                if (window.zenSounds) {
                    window.zenSounds.playWhiteNoise();
                }
                // 记录冥想完成
                if (window.realmSystem) {
                    window.realmSystem.addExperience(50);
                }
                // 3秒后停止风声
                setTimeout(() => {
                    if (window.zenSounds) {
                        window.zenSounds.stopWhiteNoise();
                    }
                }, 3000);
            }
        }, 1000);
        
        this.startTimerBtn.textContent = '停止计时';
        this.startTimerBtn.classList.add('active');
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            this.currentTime = this.duration;
            this.updateTimerDisplay();
            this.startTimerBtn.textContent = '开始计时';
            this.startTimerBtn.classList.remove('active');
            
            // 恢复显示当前时间
            this.updateDateTime();
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        
        // 更新计时器显示
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        
        // 同步更新时间显示
        if (this.timer) {
            // 如果正在计时，显示倒计时
            this.timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            // 如果没有计时，显示当前时间
            const now = new Date();
            this.timeElement.textContent = now.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
    }

    toggleCardStyle() {
        const isSimpleVisible = !this.simpleCard.classList.contains('hidden');
        
        if (isSimpleVisible) {
            this.simpleCard.classList.add('hidden');
            this.timerCard.classList.remove('hidden');
        } else {
            this.simpleCard.classList.remove('hidden');
            this.timerCard.classList.add('hidden');
        }

        // 保存用户偏好
        localStorage.setItem('preferredMeditationCard', isSimpleVisible ? 'timer' : 'simple');
    }

    loadPreferredCard() {
        const preferred = localStorage.getItem('preferredMeditationCard') || 'simple';
        
        if (preferred === 'timer') {
            this.simpleCard.classList.add('hidden');
            this.timerCard.classList.remove('hidden');
        } else {
            this.simpleCard.classList.remove('hidden');
            this.timerCard.classList.add('hidden');
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    window.meditationPage = new MeditationPage();
}); 