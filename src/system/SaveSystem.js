const STORAGE_KEY = 'avron_save_v2';

const DEFAULT_SAVE = {
    version: 3,
    settings: {
        controls: {
            left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN', jump: 'SPACE',
            attack: 'DELETE', attackAlt: 'K', cast: 'CTRL',
            sigil1: 'Z', sigil2: 'X', sigil3: 'C', sigil4: 'V',
            clear: 'Q', restart: 'R', pause: 'ESC', super: 'F'
        },
        volume: 1,
        musicVolume: 0.45,
        fullscreen: false
    },
    progress: {
        tutorial: { completed: [] },
        adventure: { started: false, completed: [] },
        dungeons: { dungeon1Unlocked: false, dungeon2Unlocked: true },
        characters: { ingor: true }
    }
};

let currentSave = readStoredSave();

function readStoredSave() {
    try {
        const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(DEFAULT_SAVE);
        const parsed = JSON.parse(raw);
        return mergeDefaults(parsed);
    } catch (_) {
        return structuredClone(DEFAULT_SAVE);
    }
}

function mergeDefaults(value = {}) {
    const defaults = structuredClone(DEFAULT_SAVE);
    const previousVersion = Number(value.version ?? 0);
    if (previousVersion < 3) {
        value = { ...value, version: 3, settings: { ...(value.settings ?? {}), controls: { ...defaults.settings.controls } } };
    }
    const incomingControls = { ...(value.settings?.controls ?? {}) };
    // Migrate the older elemental-control names to universal sigil slots.
    if (!incomingControls.sigil1 && incomingControls.flame) incomingControls.sigil1 = incomingControls.flame;
    if (!incomingControls.sigil2 && incomingControls.shadow) incomingControls.sigil2 = incomingControls.shadow;
    if (!incomingControls.sigil3 && incomingControls.ether) incomingControls.sigil3 = incomingControls.ether;
    if (!incomingControls.sigil4 && incomingControls.gravis) incomingControls.sigil4 = incomingControls.gravis;
    if (!incomingControls.cast) incomingControls.cast = 'CTRL';
    return {
        ...defaults,
        ...value,
        settings: {
            ...defaults.settings,
            ...(value.settings ?? {}),
            controls: { ...defaults.settings.controls, ...incomingControls }
        },
        progress: { ...defaults.progress, ...(value.progress ?? {}) }
    };
}

function persist() {
    try {
        globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(currentSave));
    } catch (_) {}
}

export function loadSave() {
    return currentSave;
}

export function saveGame(save) {
    currentSave = mergeDefaults(save);
    persist();
    return currentSave;
}

export function resetSave() {
    currentSave = structuredClone(DEFAULT_SAVE);
    persist();
}

export function getControls() {
    return { ...currentSave.settings.controls };
}

export function getVolumeSettings() {
    return {
        volume: Number(currentSave.settings.volume ?? 1),
        musicVolume: Number(currentSave.settings.musicVolume ?? 0.45)
    };
}

export function exportSaveJSON() {
    const json = JSON.stringify(currentSave, null, 4);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'avron_save.json';
    link.click();
    URL.revokeObjectURL(url);
}

export function importSaveJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                currentSave = mergeDefaults(JSON.parse(reader.result));
                persist();
                resolve(currentSave);
            } catch (error) { reject(error); }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

export function getDefaultSave() {
    return structuredClone(DEFAULT_SAVE);
}
