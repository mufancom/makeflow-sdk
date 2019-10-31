import {Dict, OmitValueOfKey} from 'tslang';

import {
  ReportDefinition,
  ReportDefinitionName,
  ReportElementDefinition,
} from './report';

/////////////////////////////
// Report Data Definitions //
/////////////////////////////
export interface BuiltInReportData {
  'task-status-to-number-dict': Dict<string>;
  'tags-info': {text: string; color: string}[];
  'task-briefs': string[];
}

/////////////////////////////////
// Built in report definitions //
/////////////////////////////////
export const BUILT_IN_REPORT_NAME_TO_DEFINITIONS_DICT: Dict<
  OmitValueOfKey<
    ReportDefinition<OmitValueOfKey<BuiltInReportElement, 'data'>>,
    'name'
  >
> = {
  'comprehensive-evaluation1': {
    title: '综合评分',
    description: '用于查看在项目中个人的综合评分',
    icon: 'chart-bar',
    layout: {
      columns: 'repeat(3, 33.33%)',
      rows: 'auto auto 50px',
    },
    defaultGlanceLayout: {
      height: 6,
    },
    elements: [
      {
        type: 'text-rank',
        dataName: 'task-status-to-number-dict',
        gird: {
          column: '1 / 2',
          row: '1 / 3',
        },
        config: {
          title: '已完成任务比例',
          numeratorName: 'done',
          denominatorName: 'all',
        },
      },
      {
        type: 'line-chart',
        dataName: 'task-status-to-number-dict',
        gird: {
          column: '2 / 4',
          row: '1 / 3',
        },
        config: {
          title: '月排名变化',
          axisNames: {
            x: '月份',
            y: '排名',
          },
        },
      },
      {
        type: 'colored-label',
        dataName: 'tags-info',
        gird: {
          column: '1 / 4',
          row: '3 / 4',
        },
        config: {
          title: '标签统计',
        },
      },
    ],
  },
};

export const BUILT_IN_REPORT_DEFINITIONS = Object.entries(
  BUILT_IN_REPORT_NAME_TO_DEFINITIONS_DICT,
).map(([name, definition]) => ({
  name: name as ReportDefinitionName,
  ...definition,
})) as ReportDefinition[];

/////////////////////////////////////////////////////
// Boring types that don't need to be cared about //
///////////////////////////////////////////////////
export type BuiltInReportDataName = keyof BuiltInReportData;

type _BuiltInReportElement = ReportElementDefinition & {
  gird: {
    column: string;
    row: string;
  };
  dataName: BuiltInReportDataName;
};

type BuiltInReportElement<
  TElement = _BuiltInReportElement
> = TElement extends _BuiltInReportElement
  ? (TElement['data'] extends BuiltInReportData[TElement['dataName']]
      ? TElement
      : never)
  : never;
