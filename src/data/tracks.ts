export type TrackId = 'game' | 'engine' | 'agent';
export type ProjectStatus = 'prototype' | 'development' | 'research' | 'planned';

interface Track {
  id: TrackId;
  label: string;
  english: string;
  description: string;
}

export const tracks: readonly Track[] = [
  {
    id: 'game',
    label: '游戏开发',
    english: 'Game Development',
    description: '从玩法原型到模拟系统，关注交互机制与可扩展的游戏架构。',
  },
  {
    id: 'engine',
    label: '引擎与工具',
    english: 'Engine & Tools',
    description: '围绕 C++、Unreal 编辑器与开发工具，研究系统边界与工作流。',
  },
  {
    id: 'agent',
    label: 'Agent 基础设施',
    english: 'Agent & Infrastructure',
    description: '探索任务调度、工具协议与执行隔离，逐步建立可验证的工程实践。',
  },
];

export const statusLabels: Readonly<Record<ProjectStatus, string>> = {
  prototype: '游戏原型',
  development: '开发中',
  research: '公开技术研究',
  planned: '待完善',
};
