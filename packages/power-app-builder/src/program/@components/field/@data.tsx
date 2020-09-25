import {Field, Field as FieldTypes, ProcedureField} from '@makeflow/types';
import {Button, DatePicker, Form, Input, Radio, Switch, Table} from 'antd';
import {cloneDeep, findIndex} from 'lodash';
import moment from 'moment';
import React, {FC} from 'react';

import {BuiltInProcedureFieldSelect} from '../select';

interface DataProps<TData = object> {
  value: TData;
  onChange(value: TData): void;
}

const PrefixedArrayData: FC<DataProps<
  FieldTypes.PrefixedArrayBaseFieldData
>> = ({value: {prefix}, onChange}) => (
  <Form.Item label="Prefix">
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
  let dataSource = cloneDeep(candidates);

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
    <Form.Item label="Candidates">
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
        Add New
      </Button>
      <Table<FieldTypes.SelectAlikeFieldCandidate>
        rowKey={input => String(findIndex(dataSource, input))}
        size="small"
        pagination={false}
        bordered
        dataSource={dataSource}
        columns={[
          {
            title: 'Key',
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
            title: 'Value',
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
            title: 'Actions',
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
                Delete
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
      <Form.Item label="Enable Time Select">
        <Switch
          checked={showTime}
          onChange={showTime => onChange({...value, showTime})}
        />
      </Form.Item>
      <Form.Item label="StartsAt">
        <DatePicker
          value={moment(startsAt)}
          showTime={showTime}
          onChange={m => onChange({...value, startsAt: m?.toDate().getTime()})}
        />
      </Form.Item>
      <Form.Item label="EndsAt">
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
  <Form.Item label="Description">
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

const TableData: FC<DataProps<
  Partial<FieldTypes.TableBaseFieldData<string>>
>> = ({value: {columns = []}, onChange}) => {
  function handlerChange(
    fn: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return event => {
      fn.call(undefined, event);
      onChange({columns});
    };
  }

  return (
    <Form.Item label="Columns">
      <Table<FieldTypes.TableBaseFieldColumn<string>>
        rowKey={input => String(findIndex(columns, input))}
        size="small"
        pagination={false}
        bordered
        dataSource={columns}
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            render: (text, input, index) => (
              <Input
                placeholder="name"
                value={text}
                onChange={handlerChange(({target: {value}}) =>
                  columns.splice(index, 1, {
                    ...input,
                    name: value,
                  }),
                )}
              />
            ),
          },
          {
            title: 'FiledType',
            dataIndex: 'type',
            render: (text, input, index) => (
              <BuiltInProcedureFieldSelect
                value={text}
                onSelect={value => {
                  columns.splice(index, 1, {
                    ...input,
                    type: value,
                  });
                }}
              />
            ),
          },
          {
            title: 'ReadOnly',
            dataIndex: 'readOnly',
            render: (data, input, index) => (
              <Radio.Group
                value={data}
                onChange={({target: {value}}) => {
                  columns.splice(index, 1, {
                    ...input,
                    readOnly: value,
                  });
                }}
              >
                <Radio.Button value={false}>false</Radio.Button>
                <Radio.Button value={true}>true</Radio.Button>
              </Radio.Group>
            ),
          },
          {
            title: 'Actions',
            render: (_text, _input, index) => (
              <Button
                type="link"
                onClick={() => {
                  columns.splice(index, 1);
                  onChange({columns});
                }}
              >
                Delete
              </Button>
            ),
          },
        ]}
      />
    </Form.Item>
  );
};

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
  textarea: [],
  'user-array': [],
  table: [TableData],
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
  'search-select': [],
  table: [TableData],
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
