// import {PowerAppConfigName} from '../power-app-config';

// import {define} from './@utils';

// define({
//   name: 'makeflow-gitlab-issue-synchronizer',
//   displayName: 'GitLab Issue Synchronizer',
//   description: 'GitLub Issue Synchronizer for Makeflow',
//   version: 'v0.1.1',
//   contributions: {
//     powerGlances: [
//       {
//         name: 'gitlab-issue-synchronizer',
//         displayName: 'GitLab Issue Synchronizer',
//         description: 'GitLab Issue Synchronizer for Makeflow',
//         hookBaseURL:
//           'http://issue-syncer.power.makeflow.io/gitlab-issue-synchronizer',
//         configs: [
//           {
//             name: 'gitlab-url' as PowerAppConfigName,
//             type: 'string',
//             displayName: 'GitLab 地址',
//             required: true,
//           },
//           {
//             name: 'gitlab-token' as PowerAppConfigName,
//             type: 'secret-string',
//             displayName: 'GitLab Token',
//             required: true,
//           },
//           {
//             name: 'gitlab-project-name' as PowerAppConfigName,
//             type: 'string',
//             displayName: '项目名 (namespace/repository)',
//             required: true,
//           },
//           {
//             name: 'tags-pattern' as PowerAppConfigName,
//             type: 'string',
//             displayName:
//               '标签同步模式 (例如: `缺陷:bug,feature,*`), 留空为关闭同步',
//           },
//           {
//             name: 'stages-pattern' as PowerAppConfigName,
//             type: 'string',
//             displayName:
//               '阶段标签同步模式 (例如: `开发:develop,交付,*`), 留空为关闭同步',
//           },
//         ],
//         inputs: [
//           {
//             name: 'task-stage',
//             displayName: '任务状态',
//             bind: {
//               type: 'variable',
//               variable: 'task:stage',
//             },
//           },
//           {
//             name: 'task-brief',
//             displayName: '任务简述',
//             bind: {
//               type: 'variable',
//               variable: 'task:brief',
//             },
//           },
//           {
//             name: 'task-description',
//             displayName: '任务描述',
//             bind: {
//               type: 'variable',
//               variable: 'task:description',
//             },
//           },
//           {
//             name: 'task-tags',
//             displayName: '任务标签',
//             bind: {
//               type: 'variable',
//               variable: 'task:tags',
//             },
//           },
//           {
//             name: 'task-non-done-active-nodes',
//             displayName: '任务未完成的已激活节点',
//             bind: {
//               type: 'variable',
//               variable: 'task:nonDoneActiveNodes',
//             },
//           },
//           {
//             name: 'disabled',
//             displayName: '禁用同步的变量',
//             bind: {
//               type: 'variable',
//               variable: 'issue-synchronizer-disabled',
//             },
//           },
//           {
//             name: 'task-ref',
//             displayName: '任务创建来源',
//             bind: {
//               type: 'variable',
//               variable: 'task-ref',
//             },
//           },
//         ],
//       },
//     ],
//   },
// });
