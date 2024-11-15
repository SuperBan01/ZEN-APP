class JournalManager {
    constructor() {
        this.modal = document.querySelector('.journal-modal');
        this.addButton = document.querySelector('.add-journal-btn');
        this.journalEntries = document.querySelector('.journal-entries');
        this.cancelBtn = document.querySelector('.cancel-btn');
        this.saveBtn = document.querySelector('.save-btn');
        this.journalText = document.querySelector('#journalText');
        
        this.initializeEventListeners();
        this.loadJournals();
    }

    initializeEventListeners() {
        this.addButton.addEventListener('click', () => this.openModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.saveBtn.addEventListener('click', () => this.saveJournal());
        
        // 点击模态框外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        this.modal.classList.remove('hidden');
        this.journalText.value = '';
    }

    closeModal() {
        this.modal.classList.add('hidden');
    }

    saveJournal() {
        const text = this.journalText.value.trim();
        if (!text) return;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        
        const journalCard = document.createElement('div');
        journalCard.className = 'journal-card';
        journalCard.innerHTML = `
            <div class="journal-date">${formattedDate}</div>
            <div class="journal-text">${text}</div>
        `;

        // 将新卡片插入到最前面
        this.journalEntries.insertBefore(journalCard, this.journalEntries.firstChild);
        
        // 保存到本地存储
        this.saveToLocalStorage({date: formattedDate, text});
        
        this.closeModal();
    }

    saveToLocalStorage(journal) {
        const journals = this.getJournalsFromStorage();
        journals.unshift(journal);
        localStorage.setItem('zenJournals', JSON.stringify(journals));
    }

    getJournalsFromStorage() {
        const journals = localStorage.getItem('zenJournals');
        return journals ? JSON.parse(journals) : [];
    }

    loadJournals() {
        const journals = this.getJournalsFromStorage();
        journals.forEach(journal => {
            const journalCard = document.createElement('div');
            journalCard.className = 'journal-card';
            journalCard.innerHTML = `
                <div class="journal-date">${journal.date}</div>
                <div class="journal-text">${journal.text}</div>
            `;
            this.journalEntries.appendChild(journalCard);
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new JournalManager();
}); 