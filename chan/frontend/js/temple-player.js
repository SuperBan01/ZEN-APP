import templeMusic from './temple-music.js';

class TemplePlayer {
    constructor() {
        this.playlist = templeMusic.playlist;
        this.currentTrack = 0;
        this.isPlaying = false;
        this.audio = new Audio();
        
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.musicTitle = document.querySelector('.music-title');
        this.musicArtist = document.querySelector('.music-artist');
        this.categorySelect = document.querySelector('.music-category');
        this.playBtn = document.querySelector('.player-controls .play-btn');
        this.prevBtn = document.querySelector('.player-controls .prev-btn');
        this.nextBtn = document.querySelector('.player-controls .next-btn');
        this.volumeSlider = document.querySelector('.volume-slider');
        this.progress = document.querySelector('.progress');
        this.progressTime = document.querySelector('.progress-time');
    }

    initEventListeners() {
        // 播放控制
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        
        // 音量控制
        this.volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
        });
        
        // 分类筛选
        this.categorySelect.addEventListener('change', (e) => {
            this.filterByCategory(e.target.value);
        });
        
        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.playNext());
        
        // 进度条点击
        this.progress.parentElement.addEventListener('click', (e) => {
            const clickPosition = e.offsetX / e.target.offsetWidth;
            this.audio.currentTime = clickPosition * this.audio.duration;
        });
    }

    loadTrack(index) {
        this.currentTrack = index;
        const track = this.playlist[index];
        this.audio.src = track.url;
        this.musicTitle.textContent = track.title;
        this.musicArtist.textContent = track.artist;
    }

    togglePlay() {
        if (!this.audio.src) {
            this.loadTrack(0);
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.playBtn.textContent = '▶';
        } else {
            this.audio.play();
            this.playBtn.textContent = '⏸';
        }
        this.isPlaying = !this.isPlaying;
    }

    playPrevious() {
        let prevTrack = this.currentTrack - 1;
        if (prevTrack < 0) prevTrack = this.playlist.length - 1;
        this.loadTrack(prevTrack);
        if (this.isPlaying) this.audio.play();
    }

    playNext() {
        let nextTrack = this.currentTrack + 1;
        if (nextTrack >= this.playlist.length) nextTrack = 0;
        this.loadTrack(nextTrack);
        if (this.isPlaying) this.audio.play();
    }

    updateProgress() {
        const duration = this.audio.duration;
        const currentTime = this.audio.currentTime;
        const percentage = (currentTime / duration) * 100;
        
        this.progress.style.width = percentage + '%';
        this.progressTime.textContent = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    filterByCategory(category) {
        // 实现分类筛选逻辑
        if (category === 'all') {
            this.playlist = templeMusic.playlist;
        } else {
            this.playlist = templeMusic.playlist.filter(track => track.type === category);
        }
        this.currentTrack = 0;
        if (this.playlist.length > 0) {
            this.loadTrack(0);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new TemplePlayer();
}); 