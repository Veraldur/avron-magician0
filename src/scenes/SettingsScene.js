import { loadSave, saveGame } from '../system/SaveSystem.js';

const CONTROL_ROWS = [
    ['Движение влево', 'left'], ['Движение вправо', 'right'], ['Вверх', 'up'], ['Вниз', 'down'],
    ['Прыжок', 'jump'], ['Атака', 'attack'], ['Альт. атака', 'attackAlt'], ['Каст', 'cast'],
    ['Сигил 1', 'sigil1'], ['Сигил 2', 'sigil2'], ['Сигил 3', 'sigil3'], ['Сигил 4', 'sigil4'],
    ['Очистить сигилы', 'clear'], ['Перезапуск', 'restart'], ['Пауза', 'pause'], ['Супер', 'super']
];

const KEY_NAMES = {
    SPACE: 'SPACE', CTRL: 'CTRL', ESC: 'ESC', ENTER: 'ENTER', SHIFT: 'SHIFT', TAB: 'TAB', DELETE: 'DELETE', BACKSPACE: 'BACKSPACE',
    LEFT: '←', RIGHT: '→', UP: '↑', DOWN: '↓'
};

function labelKey(key) { return KEY_NAMES[key] ?? key; }

export default class SettingsScene extends Phaser.Scene {
    constructor() { super({ key: 'SettingsScene' }); }

    create() {
        this.save = loadSave();
        this.waitingFor = null;
        this.rows = [];
        this.cameras.main.setBackgroundColor('#08080d');
        this.draw();

        this.input.keyboard.on('keydown', this.onKeyDown, this);
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.waitingFor) { this.waitingFor = null; this.updateUI(); return; }
            this.back();
        });
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.off('keydown', this.onKeyDown, this);
        });
    }

    draw() {
        const w = this.scale.width;
        this.add.text(w / 2, 44, 'НАСТРОЙКИ', { fontFamily:'Arial', fontSize:'42px', color:'#fff', fontStyle:'bold' }).setOrigin(.5);
        this.add.text(w / 2, 84, 'УПРАВЛЕНИЕ', { fontFamily:'Arial', fontSize:'18px', color:'#888899' }).setOrigin(.5);

        const left = w / 2 - 360;
        const top = 120;
        CONTROL_ROWS.forEach(([name, id], i) => {
            const col = i < 8 ? 0 : 1;
            const row = i % 8;
            const x = left + col * 360;
            const y = top + row * 46;
            const bg = this.add.rectangle(x + 160, y, 320, 38, 0x11111c, .9).setStrokeStyle(1, 0x44445e).setInteractive({useHandCursor:true});
            const nameText = this.add.text(x + 12, y, name, {fontFamily:'Arial',fontSize:'16px',color:'#c8c8d8'}).setOrigin(0, .5);
            const keyText = this.add.text(x + 300, y, '', {fontFamily:'Arial',fontSize:'16px',color:'#fff'}).setOrigin(1, .5);
            bg.on('pointerdown', () => this.beginRebind(id));
            this.rows.push({id, bg, nameText, keyText});
        });

        const volumeY = top + 8 * 46 + 24;
        this.add.text(w / 2 - 360, volumeY, 'ГРОМКОСТЬ', {fontFamily:'Arial',fontSize:'18px',color:'#888899'}).setOrigin(0,.5);
        this.createSlider(w / 2 - 120, volumeY, 'Общая', 'volume');
        this.createSlider(w / 2 + 190, volumeY, 'Музыка', 'musicVolume');

        this.statusText = this.add.text(w / 2, volumeY + 42, '', {fontFamily:'Arial',fontSize:'15px',color:'#aab0d0'}).setOrigin(.5);
        this.backButton = this.add.text(w / 2, this.scale.height - 34, 'НАЗАД', {fontFamily:'Arial',fontSize:'20px',color:'#fff'}).setOrigin(.5).setInteractive({useHandCursor:true});
        this.backButton.on('pointerdown', () => this.back());
        this.updateUI();
    }

    createSlider(x, y, title, setting) {
        this.add.text(x - 120, y, title, {fontFamily:'Arial',fontSize:'15px',color:'#ccc'}).setOrigin(0,.5);
        const track = this.add.rectangle(x + 25, y, 180, 8, 0x333346).setInteractive();
        const fill = this.add.rectangle(x - 65, y, 0, 8, 0x8888aa).setOrigin(0,.5);
        const knob = this.add.circle(x - 65, y, 9, 0xffffff).setInteractive({draggable:true});
        const update = pointer => {
            const value = Phaser.Math.Clamp((pointer.x - (x - 65)) / 180, 0, 1);
            this.save.settings[setting] = Number(value.toFixed(2));
            saveGame(this.save);
            fill.width = 180 * value;
            knob.x = x - 65 + 180 * value;
            this.applyVolume();
        };
        track.on('pointerdown', update);
        this.input.setDraggable(knob);
        knob.on('drag', (_p, px) => update({x:px}));
        this[`${setting}UI`] = {fill, knob, x};
    }

    updateUI() {
        for (const row of this.rows) {
            const active = this.waitingFor === row.id;
            row.keyText.setText(active ? 'НАЖМИТЕ...' : labelKey(this.save.settings.controls[row.id]));
            row.bg.setFillStyle(active ? 0x292945 : 0x11111c, .94);
        }
        for (const setting of ['volume','musicVolume']) {
            const ui = this[`${setting}UI`]; if (!ui) continue;
            const value = Number(this.save.settings[setting] ?? 0);
            ui.fill.width = 180 * value;
            ui.knob.x = ui.x - 65 + 180 * value;
        }
        this.statusText?.setText(this.waitingFor ? 'ESC — отменить переназначение' : 'Нажмите на клавишу управления, чтобы переназначить её.');
    }

    beginRebind(id) { this.waitingFor = id; this.updateUI(); }

    onKeyDown(event) {
        if (!this.waitingFor) return;
        if (event.code === 'Escape') { this.waitingFor = null; this.updateUI(); return; }
        const key = this.phaserKeyToConfig(event);
        if (!key) return;
        const controls = this.save.settings.controls;
        const occupied = Object.entries(controls).find(([id, value]) => id !== this.waitingFor && value === key);
        if (occupied) {
            this.statusText.setText(`Клавиша уже назначена: ${CONTROL_ROWS.find(r => r[1] === occupied[0])?.[0] ?? occupied[0]}`);
            return;
        }
        controls[this.waitingFor] = key;
        this.waitingFor = null;
        saveGame(this.save);
        this.updateUI();
    }

    phaserKeyToConfig(event) {
        if (event.key === ' ') return 'SPACE';
        if (event.key === 'Control') return 'CTRL';
        if (event.key === 'Escape') return 'ESC';
        if (event.key === 'Shift') return 'SHIFT';
        if (event.key === 'Delete') return 'DELETE';
        if (event.key === 'Backspace') return 'BACKSPACE';
        const code = String(event.code ?? '');
        if (/^Key[A-Z]$/.test(code)) return code.slice(3);
        if (/^Digit\d$/.test(code)) return code.slice(5);
        if (/^Arrow(Left|Right|Up|Down)$/.test(code)) return code.slice(5).toUpperCase();
        if (/^F\d+$/.test(code)) return code;
        return null;
    }

    applyVolume() {
        const manager = this.registry.get('musicManager');
        const master = Number(this.save.settings.volume ?? 1);
        if (this.game.sound) this.game.sound.setVolume(master);
        manager?.setVolume(Number(this.save.settings.musicVolume ?? .45));
    }

    back() {
        saveGame(this.save);
        this.applyVolume();
        this.scene.start('MainMenuScene');
    }
}
