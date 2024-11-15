class RealmSystem {
    constructor() {
        this.realms = {
            'initial': { name: '初心', range: [1, 5], description: '万法归一，一归何处？' },
            'aware': { name: '明心', range: [6, 15], description: '心似明镜台，时时勤拂拭。' },
            'enlightened': { name: '见性', range: [16, 30], description: '菩提本无树，明镜亦非台。' },
            'mastery': { name: '明道', range: [31, 50], description: '青山绿水，尽是真如。' }
        };
        
        this.levelUpQuotes = [
            "一花一世界，一叶一菩提。",
            "心若冰清，天塌不惊。",
            "万般皆是命，半点不由人。",
            "明心见性，本来面目。"
        ];

        this.initElements();
        this.initEventListeners();
        this.loadProgress();
    }

    initElements() {
        this.realmCard = document.querySelector('.realm-card');
        this.realmName = document.querySelector('.realm-name');
        this.realmLevel = document.querySelector('.realm-level');
        this.progressBar = document.querySelector('.progress-bar');
        this.currentExp = document.querySelector('.current-exp');
        this.nextExp = document.querySelector('.next-exp');
        this.infoBtn = document.querySelector('.info-btn');
        this.infoModal = document.querySelector('.realm-info-modal');
        this.levelUpModal = document.querySelector('.level-up-modal');
    }

    initEventListeners() {
        if (this.infoBtn) {
            this.infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showInfoModal();
            });
        }

        const closeButtons = document.querySelectorAll('.realm-info-modal .close-modal-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.infoModal.classList.add('hidden');
            });
        });

        this.infoModal.addEventListener('click', (e) => {
            if (e.target === this.infoModal) {
                this.infoModal.classList.add('hidden');
            }
        });

        const levelUpCloseButtons = document.querySelectorAll('.level-up-modal .close-modal-btn');
        levelUpCloseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.levelUpModal.classList.add('hidden');
            });
        });
    }

    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('zenProgress')) || {
            level: 1,
            exp: 0
        };
        this.updateProgress(progress);
    }

    updateProgress(progress) {
        const { level, exp } = progress;
        const expForNextLevel = this.calculateExpForNextLevel(level);
        const progressPercentage = (exp / expForNextLevel) * 100;
        
        this.realmLevel.textContent = level;
        this.currentExp.textContent = exp;
        this.nextExp.textContent = expForNextLevel;
        
        // 更新进度条
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (progressPercentage / 100) * circumference;
        this.progressBar.style.strokeDasharray = `${circumference} ${circumference}`;
        this.progressBar.style.strokeDashoffset = offset;

        // 更新境界名称
        const currentRealm = this.getCurrentRealm(level);
        this.realmName.textContent = currentRealm.name;
    }

    getCurrentRealm(level) {
        return Object.values(this.realms).find(realm => 
            level >= realm.range[0] && level <= realm.range[1]
        );
    }

    calculateExpForNextLevel(level) {
        return level * 1000;
    }

    addExperience(amount) {
        const currentProgress = JSON.parse(localStorage.getItem('zenProgress')) || {
            level: 1,
            exp: 0
        };

        currentProgress.exp += amount;
        const expForNextLevel = this.calculateExpForNextLevel(currentProgress.level);

        // 检查是否升级
        if (currentProgress.exp >= expForNextLevel) {
            currentProgress.exp -= expForNextLevel;
            currentProgress.level += 1;
            this.showLevelUpAnimation(currentProgress.level);
        }

        localStorage.setItem('zenProgress', JSON.stringify(currentProgress));
        this.updateProgress(currentProgress);
    }

    showLevelUpAnimation(newLevel) {
        const modal = this.levelUpModal;
        const newLevelSpan = modal.querySelector('.new-level');
        const quoteP = modal.querySelector('.level-up-quote');
        
        newLevelSpan.textContent = `${this.getCurrentRealm(newLevel).name} (${newLevel}级)`;
        quoteP.textContent = this.levelUpQuotes[Math.floor(Math.random() * this.levelUpQuotes.length)];
        
        modal.classList.remove('hidden');
        
        // 添加动画效果
        const animation = modal.querySelector('.level-up-animation');
        animation.classList.add('animate');
        setTimeout(() => animation.classList.remove('animate'), 1000);
    }

    showInfoModal() {
        if (this.infoModal) {
            this.infoModal.classList.remove('hidden');
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.realmSystem = new RealmSystem();
}); 