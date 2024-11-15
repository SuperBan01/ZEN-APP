class ZenSounds {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isPlaying = false;
    }

    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initSounds();
        }
    }

    initSounds() {
        // 创建钵音
        this.sounds.singingBowl = {
            oscillator: null,
            gainNode: null,
            frequency: 432, // 432Hz 是一个常用的冥想频率
            play: () => this.playSingingBowl(),
            stop: () => this.stopSingingBowl()
        };

        // 创建白噪音（类似风声）
        this.sounds.whiteNoise = {
            node: null,
            gainNode: null,
            play: () => this.playWhiteNoise(),
            stop: () => this.stopWhiteNoise()
        };

        // 创建Om音效
        this.sounds.om = {
            oscillator: null,
            gainNode: null,
            frequency: 136.1, // Om频率
            play: () => this.playOm(),
            stop: () => this.stopOm()
        };
    }

    // 钵音效果
    playSingingBowl() {
        this.initAudioContext();
        const sound = this.sounds.singingBowl;
        sound.oscillator = this.audioContext.createOscillator();
        sound.gainNode = this.audioContext.createGain();

        sound.oscillator.connect(sound.gainNode);
        sound.gainNode.connect(this.audioContext.destination);

        sound.oscillator.type = 'sine';
        sound.oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);

        // 设置音量渐变
        sound.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        sound.gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.1);
        
        sound.oscillator.start();

        // 添加泛音
        this.addHarmonics(sound.frequency, 0.15);

        // 设置自然衰减
        setTimeout(() => {
            sound.gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 5);
            setTimeout(() => this.stopSingingBowl(), 5000);
        }, 2000);
    }

    // 添加泛音以使声音更自然
    addHarmonics(fundamental, volume) {
        const harmonics = [2, 3, 4, 5]; // 泛音倍数
        harmonics.forEach(harmonic => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.frequency.setValueAtTime(fundamental * harmonic, this.audioContext.currentTime);
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(volume / harmonic, this.audioContext.currentTime + 0.1);

            osc.start();
            setTimeout(() => {
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 4);
                setTimeout(() => osc.stop(), 4000);
            }, 2000);
        });
    }

    stopSingingBowl() {
        const sound = this.sounds.singingBowl;
        if (sound.oscillator) {
            sound.oscillator.stop();
            sound.oscillator = null;
        }
    }

    // 白噪音（风声）效果
    playWhiteNoise() {
        this.initAudioContext();
        const sound = this.sounds.whiteNoise;
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        sound.node = this.audioContext.createBufferSource();
        sound.gainNode = this.audioContext.createGain();

        sound.node.buffer = noiseBuffer;
        sound.node.loop = true;
        sound.node.connect(sound.gainNode);
        sound.gainNode.connect(this.audioContext.destination);

        sound.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        sound.gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 1);

        sound.node.start();
    }

    stopWhiteNoise() {
        const sound = this.sounds.whiteNoise;
        if (sound.node) {
            sound.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
            setTimeout(() => {
                sound.node.stop();
                sound.node = null;
            }, 1000);
        }
    }

    // Om音效
    playOm() {
        this.initAudioContext();
        const sound = this.sounds.om;
        sound.oscillator = this.audioContext.createOscillator();
        sound.gainNode = this.audioContext.createGain();

        sound.oscillator.connect(sound.gainNode);
        sound.gainNode.connect(this.audioContext.destination);

        sound.oscillator.type = 'sine';
        sound.oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);

        sound.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        sound.gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 2);

        sound.oscillator.start();
        
        // 添加泛音使声音更丰富
        this.addOmHarmonics(sound.frequency);
    }

    addOmHarmonics(fundamental) {
        const harmonics = [2, 3, 4];
        harmonics.forEach((harmonic, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.frequency.setValueAtTime(fundamental * harmonic, this.audioContext.currentTime);
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.1 / (index + 2), this.audioContext.currentTime + 2);

            osc.start();
        });
    }

    stopOm() {
        const sound = this.sounds.om;
        if (sound.oscillator) {
            sound.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
            setTimeout(() => {
                sound.oscillator.stop();
                sound.oscillator = null;
            }, 2000);
        }
    }

    // 播放组合音效
    playMeditationSounds() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        // 播放钵音
        this.playSingingBowl();
        
        // 轻柔的背景白噪音
        setTimeout(() => {
            this.playWhiteNoise();
        }, 2000);

        // 定期播放钵音
        this.bowlInterval = setInterval(() => {
            this.playSingingBowl();
        }, 30000); // 每30秒播放一次
    }

    stopMeditationSounds() {
        this.isPlaying = false;
        clearInterval(this.bowlInterval);
        
        this.stopSingingBowl();
        this.stopWhiteNoise();
        this.stopOm();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.zenSounds = new ZenSounds();
}); 