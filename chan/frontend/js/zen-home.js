class ZenHomePage {
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
        
        // 每分钟更新时间
        setInterval(() => this.updateDateTime(), 60000);
        // 每30分钟更新禅语
        setInterval(() => this.updateQuote(), 1800000);
    }

    initElements() {
        this.timeElement = document.querySelector('.zen-home-page .time');
        this.dateElement = document.querySelector('.zen-home-page .date');
        this.quoteElement = document.querySelector('.zen-home-page .zen-quote');
        this.meditationBtn = document.querySelector('.zen-home-page .meditation-toggle-btn');
    }

    // 其他方法保持不变...
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ZenHomePage();
}); 