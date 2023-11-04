# Screeps-World AI

## Todo
* [X] 全局参数管理模块，支持运行时读写，所以要放在 Memory 上
* [X] Pioneer 完成、运行，测试 Role 系统
* [X] Role 配置规划模块
* [ ] Harvester、Worker、Carrier、Defender
* [ ] Tower 管理
* [ ] 拆分 MemoryManager
* [X] Spawn 管理，单房间多 Spawn 公用多级队列
* [ ] 数据统计中枢，支持动态注册字段、多种统计手段、统计数据获取、日志输出等
* [ ] 完善同 Tick 动作衔接、优先级冲突问题，考虑每个creep持有当前tick可用动作表，执行act直到重复
