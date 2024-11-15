class ProfileManager {
    constructor() {
        this.profile = {
            name: '未设置',
            bio: '还没有添加个人简介...',
            avatar: 'assets/images/avatar-placeholder.jpg',
            stats: {
                tasks: 0,
                goals: 0,
                days: 0
            }
        };
        this.lifeEvents = [];
        this.initElements();
        this.loadData();
        this.initEventListeners();
    }

    initElements() {
        // 个人信息相关元素
        this.profileAvatar = document.querySelector('.profile-avatar img');
        this.profileName = document.querySelector('.profile-name');
        this.profileBio = document.querySelector('.profile-bio');
        this.timelineContainer = document.querySelector('.timeline-container');
        this.editAvatarBtn = document.querySelector('.edit-avatar-btn');
        this.addEventBtn = document.querySelector('.add-event-btn');
    }

    initEventListeners() {
        // 头像编辑按钮点击事件
        if (this.editAvatarBtn) {
            this.editAvatarBtn.addEventListener('click', () => this.showAvatarUploadModal());
        }

        // 名字点击事件
        if (this.profileName) {
            this.profileName.addEventListener('click', () => this.showEditNameModal());
        }

        // 简介点击事件
        if (this.profileBio) {
            this.profileBio.addEventListener('click', () => this.showEditBioModal());
        }

        // 添加经历按钮事件
        if (this.addEventBtn) {
            this.addEventBtn.addEventListener('click', () => this.showAddEventModal());
        }
    }

    showAvatarUploadModal() {
        const modal = document.createElement('div');
        modal.className = 'ios-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="cancel-btn">取消</button>
                    <h3>更换头像</h3>
                    <button class="save-btn">完成</button>
                </div>
                <div class="modal-body">
                    <div class="avatar-preview">
                        <img src="${this.profile.avatar}" alt="预览">
                    </div>
                    <div class="avatar-options">
                        <button class="option-btn camera-btn">
                            <span class="icon">📸</span>
                            <span>拍照</span>
                        </button>
                        <button class="option-btn gallery-btn">
                            <span class="icon">🖼️</span>
                            <span>从相册选择</span>
                        </button>
                    </div>
                    <input type="file" accept="image/*" class="hidden" id="avatarInput">
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('show'));

        // 绑定事件
        const cancelBtn = modal.querySelector('.cancel-btn');
        const saveBtn = modal.querySelector('.save-btn');
        const fileInput = modal.querySelector('#avatarInput');
        const galleryBtn = modal.querySelector('.gallery-btn');
        const cameraBtn = modal.querySelector('.camera-btn');
        const preview = modal.querySelector('.avatar-preview img');

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        cancelBtn.addEventListener('click', closeModal);
        galleryBtn.addEventListener('click', () => fileInput.click());
        cameraBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        saveBtn.addEventListener('click', () => {
            if (preview.src !== this.profile.avatar) {
                this.profile.avatar = preview.src;
                this.profileAvatar.src = preview.src;
                this.saveProfile();
            }
            closeModal();
        });
    }

    showEditNameModal() {
        const modal = document.createElement('div');
        modal.className = 'ios-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="cancel-btn">取消</button>
                    <h3>修改名字</h3>
                    <button class="save-btn">保存</button>
                </div>
                <div class="modal-body">
                    <input type="text" class="ios-input" value="${this.profile.name}" placeholder="输入你的名字">
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('show'));

        const input = modal.querySelector('.ios-input');
        input.select();

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.querySelector('.save-btn').addEventListener('click', () => {
            this.profile.name = input.value;
            this.profileName.textContent = input.value;
            this.saveProfile();
            closeModal();
        });
    }

    showEditBioModal() {
        const modal = document.createElement('div');
        modal.className = 'ios-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="cancel-btn">取消</button>
                    <h3>修改简介</h3>
                    <button class="save-btn">保存</button>
                </div>
                <div class="modal-body">
                    <textarea class="ios-textarea" rows="4" placeholder="写一句话介绍自己...">${this.profile.bio}</textarea>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('show'));

        const textarea = modal.querySelector('.ios-textarea');
        textarea.select();

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.querySelector('.save-btn').addEventListener('click', () => {
            this.profile.bio = textarea.value;
            this.profileBio.textContent = textarea.value;
            this.saveProfile();
            closeModal();
        });
    }

    showAddEventModal(existingEvent = null) {
        const modal = document.createElement('div');
        modal.className = 'ios-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="cancel-btn">取消</button>
                    <h3>${existingEvent ? '编辑经历' : '添加经历'}</h3>
                    <button class="save-btn">${existingEvent ? '保存' : '添加'}</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <input type="text" class="event-title ios-input" 
                               value="${existingEvent?.title || ''}"
                               placeholder="事件标题">
                    </div>
                    <div class="form-group">
                        <div class="ios-select-group">
                            <label>事件类型</label>
                            <select class="event-type ios-select">
                                <option value="education" ${existingEvent?.type === 'education' ? 'selected' : ''}>
                                    🎓 教育经历
                                </option>
                                <option value="career" ${existingEvent?.type === 'career' ? 'selected' : ''}>
                                    💼 职业发展
                                </option>
                                <option value="life" ${existingEvent?.type === 'life' ? 'selected' : ''}>
                                    🌟 生活事件
                                </option>
                                <option value="achievement" ${existingEvent?.type === 'achievement' ? 'selected' : ''}>
                                    🏆 个人成就
                                </option>
                            </select>
                            <span class="select-arrow">›</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="ios-date-group">
                            <label>发生时间</label>
                            <input type="date" class="event-date ios-date" 
                                   value="${existingEvent?.date || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <textarea class="event-description ios-textarea" 
                                placeholder="描述这段经历..."
                                rows="4">${existingEvent?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <div class="image-upload">
                            <label>图片</label>
                            <div class="image-preview-container">
                                ${existingEvent?.images ? existingEvent.images.map(img => `
                                    <div class="image-preview">
                                        <img src="${img}" alt="预览">
                                        <button class="remove-image">×</button>
                                    </div>
                                `).join('') : ''}
                                <button class="add-image-btn">
                                    <span class="add-icon">+</span>
                                    <span>添加图片</span>
                                </button>
                            </div>
                            <input type="file" accept="image/*" multiple class="hidden" id="eventImages">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="ios-tags-group">
                            <label>情感标记</label>
                            <div class="emotion-tags">
                                <button class="emotion-tag ${existingEvent?.emotion === 'positive' ? 'active' : ''}" 
                                        data-emotion="positive">😊 积极</button>
                                <button class="emotion-tag ${existingEvent?.emotion === 'neutral' ? 'active' : ''}" 
                                        data-emotion="neutral">😐 中性</button>
                                <button class="emotion-tag ${existingEvent?.emotion === 'negative' ? 'active' : ''}" 
                                        data-emotion="negative">😔 消极</button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="text" class="event-tags ios-input" 
                               value="${existingEvent?.tags?.join(', ') || ''}"
                               placeholder="添加标签（用逗号分隔）">
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('show'));

        this.initEventModalEvents(modal, existingEvent);
    }

    initEventModalEvents(modal, existingEvent) {
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        // 关闭按钮
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);

        // 点击外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // 图片上传
        const imageInput = modal.querySelector('#eventImages');
        const addImageBtn = modal.querySelector('.add-image-btn');
        const previewContainer = modal.querySelector('.image-preview-container');

        addImageBtn.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.createElement('div');
                    preview.className = 'image-preview';
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="预览">
                        <button class="remove-image">×</button>
                    `;
                    previewContainer.insertBefore(preview, addImageBtn);

                    preview.querySelector('.remove-image').addEventListener('click', () => {
                        previewContainer.removeChild(preview);
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        // 情感标签
        const emotionTags = modal.querySelectorAll('.emotion-tag');
        let selectedEmotion = existingEvent?.emotion || null;

        emotionTags.forEach(tag => {
            tag.addEventListener('click', () => {
                emotionTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                selectedEmotion = tag.dataset.emotion;
            });
        });

        // 保存事件
        modal.querySelector('.save-btn').addEventListener('click', () => {
            const eventData = {
                id: existingEvent?.id || Date.now(),
                title: modal.querySelector('.event-title').value,
                type: modal.querySelector('.event-type').value,
                date: modal.querySelector('.event-date').value,
                description: modal.querySelector('.event-description').value,
                images: Array.from(modal.querySelectorAll('.image-preview img')).map(img => img.src),
                emotion: selectedEmotion,
                tags: modal.querySelector('.event-tags').value.split(',').map(tag => tag.trim()).filter(Boolean)
            };

            if (existingEvent) {
                this.updateLifeEvent(eventData);
            } else {
                this.addLifeEvent(eventData);
            }
            closeModal();
        });

        // 删除已有图片
        modal.querySelectorAll('.remove-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preview = e.target.closest('.image-preview');
                preview.parentElement.removeChild(preview);
            });
        });
    }

    async addLifeEvent(eventData) {
        try {
            const response = await fetch('/api/life-events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                this.lifeEvents.push(eventData);
                this.renderTimeline();
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Failed to add life event:', error);
            // 离线模式下保存到本地
            this.lifeEvents.push(eventData);
            this.renderTimeline();
            this.saveToLocalStorage();
        }
    }

    async updateLifeEvent(eventData) {
        try {
            const response = await fetch(`/api/life-events/${eventData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                const index = this.lifeEvents.findIndex(e => e.id === eventData.id);
                if (index !== -1) {
                    this.lifeEvents[index] = eventData;
                }
                this.renderTimeline();
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Failed to update life event:', error);
            // 离线模式下更新本地数据
            const index = this.lifeEvents.findIndex(e => e.id === eventData.id);
            if (index !== -1) {
                this.lifeEvents[index] = eventData;
            }
            this.renderTimeline();
            this.saveToLocalStorage();
        }
    }

    async deleteLifeEvent(eventId) {
        if (!confirm('确定要删除这段经历吗？')) return;

        try {
            const response = await fetch(`/api/life-events/${eventId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.lifeEvents = this.lifeEvents.filter(e => e.id !== eventId);
                this.renderTimeline();
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Failed to delete life event:', error);
            // 离线模式下删除本地数据
            this.lifeEvents = this.lifeEvents.filter(e => e.id !== eventId);
            this.renderTimeline();
            this.saveToLocalStorage();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('lifeEvents', JSON.stringify(this.lifeEvents));
    }

    saveProfile() {
        localStorage.setItem('userProfile', JSON.stringify(this.profile));
        this.syncWithServer().catch(console.error);
    }

    async syncWithServer() {
        try {
            await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.profile)
            });
        } catch (error) {
            console.log('Using offline mode');
        }
    }

    loadData() {
        // 从本地存储加载数据
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
            this.updateProfileUI(this.profile);
        }

        const savedEvents = localStorage.getItem('lifeEvents');
        if (savedEvents) {
            this.lifeEvents = JSON.parse(savedEvents);
            this.renderTimeline();
        }

        // 尝试从服务器加载数据
        this.loadFromServer();
    }

    async loadFromServer() {
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const profile = await response.json();
                this.profile = { ...this.profile, ...profile };
                this.updateProfileUI(this.profile);
                localStorage.setItem('userProfile', JSON.stringify(this.profile));
            }
        } catch (error) {
            console.log('Using offline data');
        }
    }

    updateProfileUI(profile) {
        if (this.profileAvatar && profile.avatar) {
            this.profileAvatar.src = profile.avatar;
        }
        if (this.profileName) {
            this.profileName.textContent = profile.name;
        }
        if (this.profileBio) {
            this.profileBio.textContent = profile.bio;
        }
    }

    updateStatsUI(stats) {
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.querySelector(`.stat-value[data-stat="${key}"]`);
            if (element) {
                element.textContent = value;
            }
        });
    }

    renderTimeline() {
        if (!this.timelineContainer) return;

        this.timelineContainer.innerHTML = '';
        const sortedEvents = [...this.lifeEvents].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        sortedEvents.forEach(event => {
            const eventElement = this.createTimelineEvent(event);
            this.timelineContainer.appendChild(eventElement);
        });
    }

    createTimelineEvent(event) {
        const element = document.createElement('div');
        element.className = 'timeline-item';
        element.innerHTML = `
            <div class="timeline-date">${this.formatDate(event.date)}</div>
            <div class="timeline-content">
                <div class="timeline-images">
                    ${event.images ? event.images.map(img => 
                        `<img src="${img}" alt="事件图片" loading="lazy">`
                    ).join('') : ''}
                </div>
                <h4>${event.title}</h4>
                <p>${event.description}</p>
                <div class="timeline-tags">
                    ${event.tags ? event.tags.map(tag => 
                        `<span class="tag">${tag}</span>`
                    ).join('') : ''}
                </div>
            </div>
        `;
        return element;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long'
        });
    }

    // 其他辅助方法...
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
}); 