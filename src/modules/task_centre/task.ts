import { Durable } from "utils/durable";


type TaskId = string;
type TaskSubjectType = Creep | OwnedStructure;
type SubjectId = Id<TaskSubjectType>;
type TaskName = string;

enum TaskState {
    INITIALIZING = 0,
    PROCESSING = 1,
    BLOCKED = 2,
    Done = 3
}

declare global {
interface Memory {
    taskCenterMemory: {
        Tasks: Map<TaskId, Task<TaskSubjectType>>
        Subjects: Map<SubjectId, TaskId>
    }
}
}

abstract class Task<T extends TaskSubjectType> extends Durable {
    readonly TASK_NAME: TaskName = "BASE";
    readonly ID: TaskId;
    state: TaskState = TaskState.INITIALIZING;
    blockingTasks: Set<TaskId> = new Set();
    blockedTasks: Set<TaskId> = new Set();
    level: number = 0;
    subjectId?: SubjectId;

    constructor(
        public id_suffix?: string,
    ) {
        super()
        this.ID = `${this.TASK_NAME}_${Game.time}_${_.uniqueId()}`;
    }

    run() {
        if (this.state === TaskState.BLOCKED) {
            return;
        }
        if (this.isEnd()) {
            this.state = TaskState.Done;
            return;
        }
        this.blockingTasks.
    }





    abstract subjectFilter(subject: T): boolean;
    abstract isEnd(): boolean;
    abstract prepareSubject(): void;
    abstract exec(): void;
}


class UpgradeController implements Task<Creep | StructureTower> {

    filter = (subject: Creep | StructureTower) => { return subject.id; }

    constructor(public id: TaskId) {
        id = "123";
    }
}


