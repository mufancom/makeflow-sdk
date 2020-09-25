import {AccessToken, PowerApp} from '@makeflow/types';
import {Checkbox, Form, Input} from 'antd';
import React, {FC} from 'react';

import {permissionData} from '../@permission';

const Wrapper: FC<{
  state: PowerApp.RawDefinition;
  setState(state: PowerApp.RawDefinition): void;
}> = ({state, setState}) => {
  return (
    <>
      <Form.Item label="Name" required>
        <Input
          value={state.name}
          placeholder="name"
          onChange={({target: {value}}) => setState({...state, name: value})}
        />
      </Form.Item>
      <Form.Item label="Version" required>
        <Input
          value={state.version}
          placeholder="version"
          onChange={({target: {value}}) => setState({...state, version: value})}
        />
      </Form.Item>
      <Form.Item label="DisplayName" required>
        <Input
          value={state.displayName}
          placeholder="displayName"
          onChange={({target: {value}}) =>
            setState({...state, displayName: value})
          }
        />
      </Form.Item>
      <Form.Item label="Description">
        <Input
          value={state.description}
          placeholder="description"
          onChange={({target: {value}}) =>
            setState({...state, description: value})
          }
        />
      </Form.Item>
      <Form.Item label="HomePage">
        <Input
          value={state.homePageURL}
          placeholder="homePageURL"
          onChange={({target: {value}}) =>
            setState({...state, homePageURL: value})
          }
        />
      </Form.Item>
      <Form.Item label="HookBaseURL">
        <Input
          value={state.hookBaseURL}
          placeholder="hookBaseURL"
          onChange={({target: {value}}) =>
            setState({...state, hookBaseURL: value})
          }
        />
      </Form.Item>
      <Form.Item label="Permissions">
        <Checkbox.Group
          value={state.permissions}
          options={permissionData}
          onChange={values =>
            setState({
              ...state,
              permissions: values as AccessToken.AccessTokenPermissionName[],
            })
          }
        />
      </Form.Item>
    </>
  );
};

export default Wrapper;
