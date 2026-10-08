import { getVolumeSettings } from '../system/SaveSystem.js';

export default class MusicManager {
    constructor(game) {
        this.game = game;
        this.sound = game.sound;
        this.tracks = [
            { key: 'avron_test2', name: 'AVRON TEST 2' },
            { key: 'avron_test', name: 'AVRON TEST 1' }
        ];
        this.current = null;
        this.currentIndex = 0;
        const volumes = getVolumeSettings();
        this.volume = volumes.musicVolume;
        if (this.game.sound) this.game.sound.setVolume(volumes.volume);

        this._keyboardHandler = event => {
            if (event.repeat) return;
            if (event.code === 'Comma') {
                event.preventDefault();
                this.previous();
            } else if (event.code === 'Period') {
                event.preventDefault();
                this.next();
            }
        };
        window.addEventListener('keydown', this._keyboardHandler);
    }

    unlockAudio() {
        try {
            const context = this.sound?.context;
            if (context?.state === 'suspended') {
                const result = context.resume();
                if (result?.catch) result.catch(() => {});
            }
        } catch (_) {}
    }

    play(indexOrKey = 0) {
        this.unlockAudio();

        let index = indexOrKey;
        if (typeof indexOrKey === 'string') {
            index = this.tracks.findIndex(track => track.key === indexOrKey);
        }
        if (!Number.isInteger(index) || index < 0 || index >= this.tracks.length) index = 0;

        const track = this.tracks[index];
        this.currentIndex = index;

        if (this.current?.key === track.key && this.current.isPlaying) return;

        if (this.current) {
            this.current.stop();
            this.current.destroy();
            this.current = null;
        }

        if (!this.game.cache?.audio?.exists(track.key)) return;

        this.current = this.sound.add(track.key, { volume: this.volume, loop: true });
        this.current.key = track.key;
        const result = this.current.play();
        if (result?.catch) result.catch(() => {});
    }

    ensureStarted() {
        this.unlockAudio();
        if (!this.current || !this.current.isPlaying) this.play(this.currentIndex);
    }

    next() {
        this.play((this.currentIndex + 1) % this.tracks.length);
    }

    previous() {
        this.play((this.currentIndex - 1 + this.tracks.length) % this.tracks.length);
    }

    pause() { if (this.current?.isPlaying) this.current.pause(); }

    resume() {
        this.unlockAudio();
        if (this.current && !this.current.isPlaying) {
            const result = this.current.resume();
            if (result?.catch) result.catch(() => {});
        } else if (!this.current) this.play(this.currentIndex);
    }

    togglePause() {
        if (this.current?.isPlaying) this.pause();
        else this.resume();
    }

    stop() {
        if (!this.current) return;
        this.current.stop();
        this.current.destroy();
        this.current = null;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.current) this.current.setVolume(this.volume);
    }

    getCurrentTrackName() {
        return this.tracks[this.currentIndex]?.name ?? '';
    }

    destroy() {
        window.removeEventListener('keydown', this._keyboardHandler);
        this.stop();
    }
}
