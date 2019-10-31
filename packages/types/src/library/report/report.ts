import {Dict, Nominal, OmitValueOfKey} from 'tslang';

export type ReportDefinitionName = Nominal<string, 'report-name'>;

export type ReportIconName =
  | 'chart-bar'
  | 'chart-pie'
  | 'star'
  | 'in-progress'
  | 'chart-line'
  | 'chart-area'
  | 'bug';

// Create by developer
// Store as json or js
export interface IReportElement<
  TType extends string = string,
  TConfig extends object = object,
  TData = unknown
> {
  type: TType;
  config: TConfig;
  // just for type definition
  data: TData;
}

export interface ReportDefinition<TReportElement = ReportElement> {
  name: ReportDefinitionName;
  title: string;
  description: string | undefined;
  icon: ReportIconName | undefined;
  // data is transformed by makeflow, so you cannot define in element
  elements: TReportElement[];
  defaultGlanceLayout?: {
    width?: number;
    height?: number;
  };
  layout: {
    columns: string;
    rows: string;
    padding?: string;
    margin?: string;
  };
}

/////////////////////
// Report Element //
///////////////////

export type ReportElementDefinition =
  | LineChart
  | TextRank
  | ColoredLabel
  | TextLine;

export type ReportElement = OmitValueOfKey<ReportElementView, 'data'>;

export type ReportElementView = ReportElementDefinition & {
  dataName?: MakeflowTypes.GlanceDataName;
  gird: {
    column: string;
    row: string;
  };
};

export type ReportElementDefinitionType = ReportElementDefinition['type'];

/////////////////////
///  line-chart  ///
///////////////////
export interface LineChartConfig {
  title: string;
  axisNames: {
    x: string;
    y: string;
  };
}

export type LineChartData = Dict<string>;

export interface LineChart
  extends IReportElement<'line-chart', LineChartConfig, LineChartData> {}

///////////////////
///  text-rank  ///
///////////////////

export interface TextRankConfig {
  title: string;
  numeratorName: string;
  denominatorName: string[] | 'all';
}

type TextRankData = Dict<string>;

export interface TextRank
  extends IReportElement<'text-rank', TextRankConfig, TextRankData> {}

///////////////////////
///  colored-label  ///
///////////////////////

export interface ColoredLabelConfig {
  title: string;
}

type ColoredLabelData = {text: string; color: string}[];

export interface ColoredLabel
  extends IReportElement<
    'colored-label',
    ColoredLabelConfig,
    ColoredLabelData
  > {}

///////////////////
///  text-line  ///
///////////////////

export interface TextLineConfig {
  title: string;
}

export interface TextLine extends IReportElement<'text-line', TextLineConfig> {}
