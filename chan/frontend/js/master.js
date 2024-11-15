class ZenChat {
    constructor() {
        this.chatHistory = [];
        this.remainingChats = 3; // 默认值
        this.initializeElements();
        this.bindEvents();
        this.checkRemainingChats();
    }

    initializeElements() {
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'chat-container';
        
        // 添加剩余对话次数显示
        this.remainingChatsDisplay = document.createElement('div');
        this.remainingChatsDisplay.className = 'remaining-chats';
        
        this.messageInput = document.createElement('div');
        this.messageInput.className = 'message-input';
        this.messageInput.innerHTML = `
            <textarea placeholder="写下你的困惑..."></textarea>
            <button class="send-btn">发送</button>
        `;
        
        // 将元素添加到论禅页面
        const masterContent = document.querySelector('.master-content');
        if (masterContent) {
            masterContent.innerHTML = '';
            masterContent.appendChild(this.remainingChatsDisplay);
            masterContent.appendChild(this.chatContainer);
            masterContent.appendChild(this.messageInput);
        }
    }

    async checkRemainingChats() {
        try {
            const response = await fetch('http://localhost:5000/api/master/remaining_chats?user_id=default_user');
            const data = await response.json();
            this.remainingChats = data.remaining_chats;
            this.updateRemainingChatsDisplay();
        } catch (error) {
            console.error('获取剩余对话次数失败:', error);
        }
    }

    updateRemainingChatsDisplay() {
        this.remainingChatsDisplay.innerHTML = `
            <div class="remaining-chats-info">
                今日剩余对话次数: ${this.remainingChats}
            </div>
        `;
        
        // 如果没有剩余次数，禁用输入
        const textarea = this.messageInput.querySelector('textarea');
        const sendBtn = this.messageInput.querySelector('.send-btn');
        if (this.remainingChats <= 0) {
            textarea.disabled = true;
            sendBtn.disabled = true;
            textarea.placeholder = '今日对话次数已用完，明日再来';
        }
    }

    bindEvents() {
        const sendBtn = this.messageInput.querySelector('.send-btn');
        const textarea = this.messageInput.querySelector('textarea');

        sendBtn.addEventListener('click', () => {
            const message = textarea.value.trim();
            if (message) {
                this.sendMessage(message);
            }
        });

        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = textarea.value.trim();
                if (message) {
                    this.sendMessage(message);
                }
            }
        });
    }

    async sendMessage(content) {
        if (!content.trim() || this.remainingChats <= 0) return;

        try {
            // 添加用户消息到界面
            this.addMessageToUI('user', content);

            // 显示加载状态
            const loadingMessage = this.addMessageToUI('master', '思考中...');

            // 发送请求到后端
            const response = await fetch('http://localhost:5000/api/master/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    user_id: 'default_user',
                    timestamp: new Date().toISOString()
                })
            });

            // 打印原始响应以进行调试
            console.log('API Response:', response);

            const data = await response.json();
            console.log('Response Data:', data);  // 添加数据日志

            // 更新剩余对话次数
            if (data.remaining_chats !== undefined) {
                this.remainingChats = data.remaining_chats;
                this.updateRemainingChatsDisplay();
            }

            // 移除加载消息
            if (loadingMessage) {
                loadingMessage.remove();
            }

            if (response.ok) {  // 检查响应状态
                // 添加禅师回复到界面
                this.addMessageToUI('master', data.response);
            } else {
                // 处理错误情况，显示具体错误信息
                const errorMessage = data.error || data.details || '禅师暂时无法回应，请稍后再试。';
                console.error('API Error:', errorMessage);
                this.addMessageToUI('master', errorMessage);
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            // 显示更具体的错误信息
            const errorMessage = error.message || '与禅师的连接似乎出现了问题，请稍后再试。';
            this.addMessageToUI('master', errorMessage);
        }

        // 清空输入框
        this.messageInput.querySelector('textarea').value = '';
    }

    addMessageToUI(type, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        
        const timestamp = new Date().toLocaleTimeString('zh', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="sender">${type === 'user' ? '你' : '禅师'}</span>
                <span class="time">${timestamp}</span>
            </div>
            <div class="message-content">${content}</div>
        `;

        this.chatContainer.appendChild(messageElement);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        
        return messageElement; // 返回消息元素，用于后续可能的更新或删除
    }
}

// 添加相应的 CSS 样式
const style = document.createElement('style');
style.textContent = `
    .remaining-chats {
        padding: 1rem;
        background-color: var(--secondary-bg);
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .remaining-chats-info {
        text-align: center;
        color: #666;
        font-size: 0.9rem;
    }

    .message-input textarea:disabled,
    .message-input .send-btn:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

// 当点击论禅按钮时初始化聊天界面
document.addEventListener('DOMContentLoaded', () => {
    const chatBtn = document.querySelector('.chat-btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', () => {
            new ZenChat();
        });
    }
}); 