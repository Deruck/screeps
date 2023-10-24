export class StatsLogger {
    static logOnReset() {
        console.log("global reset");
    };

    static logOnTickStart() {
        console.log(`Current game tick is ${Game.time}`);
    }

    static logOnTickEnd() { }
}
