import {Field, Field as FieldTypes, ProcedureField} from '@makeflow/types';
import {Button, DatePicker, Form, Input, Switch, Table} from 'antd';
import _ from 'lodash';
import moment from 'moment';
import React, {FC} from 'react';

interface DataProps<TData = object> {
  value: TData;
  onChange(value: TData): void;
}

const PrefixedArrayData: FC<DataProps<
  FieldTypes.PrefixedArrayBaseFieldData
>> = ({value: {prefix}, onChange}) => (
  <Form.Item label="前缀 (prefix)">
    <Input
      placeholder="prefix"
      value={prefix}
      onChange={({target: {value}}) =>
        onChange({
          prefix: value,
        })
      }
    />
  </Form.Item>
);

const SelectAlikeData: FC<DataProps<FieldTypes.SelectAlikeFieldData>> = ({
  value: {candidates = []},
  onChange,
}) => {
  let dataSource = _.cloneDeep(candidates);

  function handlerChange(
    fn: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return event => {
      fn.call(undefined, event);
      onChange({
        candidates: dataSource,
      });
    };
  }

  return (
    <Form.Item label="选项 (candidates)">
      <Button
        onClick={() => {
          dataSource.push({
            text: 'name',
            value: '',
          });

          onChange({
            candidates: dataSource,
          });
        }}
        type="primary"
        style={{marginBottom: 10}}
      >
        新增选项
      </Button>
      <Table<FieldTypes.SelectAlikeFieldCandidate>
        rowKey={input => String(_.findIndex(dataSource, input))}
        size="small"
        pagination={false}
        bordered
        dataSource={dataSource}
        columns={[
          {
            title: '键',
            dataIndex: 'text',
            render: (text, input, index) => (
              <Input
                placeholder="name"
                value={text}
                onChange={handlerChange(({target: {value}}) =>
                  dataSource.splice(index, 1, {
                    ...input,
                    text: value,
                  }),
                )}
              />
            ),
          },
          {
            title: '值',
            dataIndex: 'value',
            render: (text, input, index) => (
              <Input
                placeholder="value"
                value={text}
                onChange={handlerChange(({target: {value}}) =>
                  dataSource.splice(index, 1, {
                    ...input,
                    value,
                  }),
                )}
              />
            ),
          },
          {
            title: '操作',
            render: (_text, _input, index) => (
              <Button
                type="link"
                onClick={() => {
                  dataSource.splice(index, 1);
                  onChange({
                    candidates: dataSource,
                  });
                }}
              >
                删除
              </Button>
            ),
          },
        ]}
      />
    </Form.Item>
  );
};

const DateData: FC<DataProps<FieldTypes.DateBaseFieldData>> = ({
  value,
  onChange,
}) => {
  let {showTime, startsAt, endsAt} = value;

  return (
    <>
      <Form.Item label="选择时间 (默认值只能日期)">
        <Switch
          checked={showTime}
          onChange={showTime => onChange({...value, showTime})}
        />
      </Form.Item>
      <Form.Item label="起于 (startsAt)">
        <DatePicker
          value={moment(startsAt)}
          showTime={showTime}
          onChange={m => onChange({...value, startsAt: m?.toDate().getTime()})}
        />
      </Form.Item>
      <Form.Item label="止于 (endsAt)">
        <DatePicker
          value={moment(endsAt)}
          showTime={showTime}
          onChange={m => onChange({...value, endsAt: m?.toDate().getTime()})}
        />
      </Form.Item>
    </>
  );
};

const LinkData: FC<DataProps<Partial<FieldTypes.LinkBaseFieldData>>> = ({
  value: {description},
  onChange,
}) => (
  <Form.Item label="链接描述 (description)">
    <Input
      placeholder="description"
      value={description}
      onChange={({target: {value}}) =>
        onChange({
          description: value,
        })
      }
    />
  </Form.Item>
);

const BaseFieldDataDict: {[key in Field.BaseFieldType]: FC<DataProps>[]} = {
  'input-array': [PrefixedArrayData],
  select: [SelectAlikeData],
  'select-array': [PrefixedArrayData, SelectAlikeData],
  radio: [SelectAlikeData],
  link: [LinkData],
  date: [DateData],
  input: [],
  user: [],
  team: [],
  file: [],
  'team-array': [],
  'procedure-array': [],
  'tag-array': [],
  'file-array': [],
  // TODO: not support. just fix types
  table: [],
  textarea: [],
  'user-array': [],
};

const BuildInFieldDataDict: {
  [key in ProcedureField.BuiltInProcedureFieldType]: FC<DataProps>[];
} = {
  'text-array': [PrefixedArrayData],
  select: [SelectAlikeData],
  'select-array': [PrefixedArrayData, SelectAlikeData],
  radio: [SelectAlikeData],
  link: [LinkData],
  date: [DateData],
  text: [],
  user: [],
  team: [],
  file: [],
  password: [],
  'team-array': [],
  'procedure-array': [],
  'tag-array': [],
  'file-array': [],
  // TODO: not support. just fix types
  'search-select': [],
  table: [],
  textarea: [],
  'user-array': [],
};

export function getBaseFieldData(
  base: FieldTypes.BaseFieldType,
): FC<DataProps>[] | undefined {
  return BaseFieldDataDict[base];
}

export function getBuiltInProcedureFieldData(
  base: ProcedureField.BuiltInProcedureFieldType,
): FC<DataProps>[] | undefined {
  return BuildInFieldDataDict[base];
}
