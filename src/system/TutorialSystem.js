export class TutorialSystem {

    constructor(scene, eventBus, objectives = []) {

        this.scene = scene;
        this.eventBus = eventBus;

        this.objectives =
            objectives.map(
                objective => ({
                    ...objective,
                    progress: 0,
                    completed: false
                })
            );

        this.currentIndex = 0;

        this.unsubscribe = [];

        this.bindEvents();
    }


    bindEvents() {
        const actions = new Set(
            this.objectives.map(objective => objective.action).filter(Boolean)
        );

        for (const action of actions) {
            this.unsubscribe.push(
                this.eventBus.on(`tutorial:${action}`, () => this.record(action))
            );
        }
    }

    get current() {

        return (
            this.objectives[
                this.currentIndex
            ] ?? null
        );
    }


    record(action) {

        const objective =
            this.current;

        if (!objective) {
            return;
        }


        if (
            objective.action !== action
        ) {
            return;
        }


        if (
            objective.completed
        ) {
            return;
        }


        objective.progress++;


        if (
            objective.progress >=
            objective.required
        ) {

            objective.progress =
                objective.required;

            objective.completed = true;


            this.eventBus.emit(
                'tutorial:objectiveComplete',
                {
                    objective
                }
            );


            this.currentIndex++;


            const next =
                this.current;


            if (next) {

                this.eventBus.emit(
                    'tutorial:objectiveChanged',
                    {
                        objective: next
                    }
                );

            } else {

                this.eventBus.emit(
                    'tutorial:complete'
                );
            }
        }


        this.eventBus.emit(
            'tutorial:progress',
            {
                objective
            }
        );
    }


    getProgress() {

        return this.current;
    }


    destroy() {

        for (
            const unsubscribe
            of this.unsubscribe
        ) {

            unsubscribe?.();
        }


        this.unsubscribe.length = 0;
    }
}


export default TutorialSystem;
