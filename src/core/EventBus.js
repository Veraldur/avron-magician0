export class EventBus {

    constructor() {
        this.listeners = new Map();
    }


    on(event, callback) {

        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners
            .get(event)
            .add(callback);

        return () => {
            this.off(event, callback);
        };
    }


    off(event, callback) {

        this.listeners
            .get(event)
            ?.delete(callback);
    }


    emit(event, data = {}) {

        const listeners =
            this.listeners.get(event);

        if (!listeners) {
            return;
        }

        for (const callback of listeners) {
            callback(data);
        }
    }


    clear() {

        this.listeners.clear();
    }
}


export default EventBus;