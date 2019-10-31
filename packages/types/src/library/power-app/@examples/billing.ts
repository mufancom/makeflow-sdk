import {PowerAppProcedureFieldType, PowerItemName} from '../contributions';
import {PowerAppConfigName} from '../power-app-config';
import {PowerAppDefinitionResourceName} from '../power-app-definition';
import {PowerAppInputName} from '../power-app-input';

import {define} from './@utils';

define({
  name: 'makeflow-billing',
  version: 'v0.1.1',
  displayName: 'Makeflow Billing Power App',
  description: 'Makeflow billing power app',
  hookBaseURL: 'http://billing.power.makeflow.io/api',
  permissions: [
    'task:create',
    'task:update',
    'task:send-channel-message',
    'procedure:create',
    'procedure:update',
    'user:get-user-id-by-email',
  ],
  configs: [
    {
      name: 'some-radio-option' as PowerAppConfigName,
      displayName: '单项选择',
      required: true,
      field: {
        type: 'radio',
        data: [
          {
            text: 'candidate 1',
            value: 1,
          },
          {
            text: 'candidate 2',
            value: 2,
          },
        ],
      },
    },
    {
      name: 'some-select-option' as PowerAppConfigName,
      displayName: '单项选择',
      required: true,
      field: {
        type: 'select',
        // dataSource: {
        //   inputs: [
        //     {
        //       name: 'some-input',
        //     },
        //   ],
        // },
      },
    },
    {
      name: 'mail-prefix' as PowerAppConfigName,
      displayName: '邮箱前缀',
      required: true,
      field: {
        type: 'text',
        // data: [],
      },
    },
    {
      name: 'brief-prefix' as PowerAppConfigName,
      displayName: '简述前缀',
    },
    {
      name: 'approver' as PowerAppConfigName,
      displayName: '审批者',
      field: 'user',
    },
  ],
  contributions: {
    procedureFields: [
      {
        displayName: '金额',
        type: 'currency-amount' as PowerAppProcedureFieldType,
        base: 'input',
        icon: 'text',
      },
      {
        displayName: '币种',
        type: 'currency-type' as PowerAppProcedureFieldType,
        base: 'select',
        icon: 'select',
        data: [
          {
            text: '人民币',
            value: 'cny',
          },
        ],
      },
    ],
    powerItems: [
      {
        name: 'awesome-checker' as PowerItemName,
        displayName: '很棒的检查器',
        inputs: [
          {
            name: 'input-1' as PowerAppInputName,
            displayName: '输入 1',
          },
        ],
        fields: [
          {
            displayName: '',
            base: 'input',
            options: {
              secret: true,
            },
          },
          {
            displayName: '',
            base: 'select',
            data: [
              {
                text: '',
                value: 1,
              },
            ],
          },
          {
            displayName: '',
            base: 'radio',
            dataSource: {
              url: '',
              inputs: [],
            },
          },
        ],
      },
    ],
    powerGlances: [],
  },
  resources: {
    tags: [
      {
        name: 'makeflow-billing' as PowerAppDefinitionResourceName,
        displayName: 'Billing',
        color: 'blue',
      },
    ],
    procedures: [
      {
        name: 'makeflow-billing' as PowerAppDefinitionResourceName,
        displayName: 'Billing',
        revision: {
          options: {
            description: true,
          },
          branches: [
            {
              id: 'b67b5ac4-4a80-46f1-a722-d881de08fc94' as MakeflowTypes.ProcedureBranchDefinitionId,
              options: {},
              nodes: [
                {
                  type: 'items',
                  id: '6b35304e-8004-4b8b-91bc-4199c80f1ff0' as MakeflowTypes.ProcedureItemsNodeDefinitionId,
                  options: {
                    displayName: '录入信息',
                  },
                  items: [
                    {
                      id: 'fovaq' as MakeflowTypes.ProcedureItemDefinitionId,
                      options: {
                        type: 'checkable',
                        fields: [
                          {
                            id: '686d1134-dbb2-4667-82ca-6a335f1c2a12',
                            displayName: '报销人',
                            definition: 'user',
                            output: '报销人',
                            required: true,
                            initialValue: {
                              type: 'variable',
                              variable: 'billing-applicant',
                            },
                          },
                        ],
                      },
                      content: {
                        text: '录入账单报销人',
                        inlineStyleRanges: [],
                        entityRanges: [],
                      },
                    },
                    {
                      id: 'ef0to' as MakeflowTypes.ProcedureItemDefinitionId,
                      options: {
                        type: 'checkable',
                        fields: [
                          {
                            displayName: '报销金额',
                            id: 'a7cbf101-0f2a-4c6d-8d44-2093e0ad9275',
                            definition: {
                              installation: 'self',
                              type: 'currency',
                            },
                            output: '报销金额',
                            required: true,
                            initialValue: {
                              type: 'variable',
                              variable: 'billing-amount',
                            },
                          },
                        ],
                      },
                      content: {
                        text: '录入账单信息',
                        inlineStyleRanges: [],
                        entityRanges: [],
                      },
                    },
                  ],
                },
                {
                  type: 'items',
                  id: 'dc5c2dfb-4bd4-4154-86c1-ef7641b4d303' as MakeflowTypes.ProcedureItemsNodeDefinitionId,
                  options: {
                    displayName: '审批',
                    approval: true,
                    assignment: 'node-owner',
                  },
                  items: [
                    {
                      id: '25ps6' as MakeflowTypes.ProcedureItemDefinitionId,
                      options: {
                        type: 'checkable',
                      },
                      content: {
                        text: '确认报销账单属实切满足报销要求',
                        inlineStyleRanges: [],
                        entityRanges: [],
                      },
                    },
                    {
                      id: '9vvsr' as MakeflowTypes.ProcedureItemDefinitionId,
                      options: {
                        type: 'checkable',
                      },
                      content: {
                        text: '确认报销信息准确无误',
                        inlineStyleRanges: [],
                        entityRanges: [],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },
});
