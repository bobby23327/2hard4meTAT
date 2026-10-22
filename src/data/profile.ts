interface Profile {
  name: string;
  personName: string | undefined;
  brandEnglish: string;
  title: string;
  description: string;
  heroDescription: string;
  heroPersonalNote: string;
  biographyDescription: string;
  opportunityFocus: string;
  opportunityDescription: string;
  footerDescription: string;
  university: string;
  universityEnglish: string;
  major: string;
  degree: string;
  graduation: string;
  location: string;
  github: string | undefined;
  email: string | undefined;
  resume: string | undefined;
}

export const profile: Profile = {
  name: '开发札记',
  personName: undefined,
  brandEnglish: 'ENGINEERING PORTFOLIO',
  title: '游戏开发、C++ 与 Agent 工程',
  description: '关注游戏交互、C++ 系统与 Agent 基础设施。通过项目记录架构选择、实现过程与工程思考。',
  heroDescription: '探索游戏的交互边界，构建可靠的底层系统。',
  heroPersonalNote: '喜欢把好奇心变成可运行的作品。',
  biographyDescription: '热衷于探索游戏机制，也喜欢钻进系统内部，理解每个细节如何协同。',
  opportunityFocus: '游戏研发、引擎工具与工程基础设施',
  opportunityDescription: '期待与关注游戏研发、引擎工具和基础设施的团队交流。',
  footerDescription: '把想法写成代码，把过程留在这里。',
  university: '苏州大学',
  universityEnglish: 'SUZHOU UNIVERSITY',
  major: '软件工程',
  degree: '本科',
  graduation: '2027',
  location: '上海',
  github: 'https://github.com/bobby23327',
  email: '3058216995@qq.com',
  resume: undefined,
};
