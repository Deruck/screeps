export function clean() {
    console.log(`clean memory...`);
    cleanDeadCreeps();
}

function cleanDeadCreeps() {
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            console.log(`clean dead creep memory ${name}.`);
            delete Memory.creeps[name];
        }
    }
}
