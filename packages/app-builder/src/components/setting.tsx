import {Drawer} from 'antd';
import React, {FC} from 'react';

export const Setting: FC<{
  visible: boolean;
  setVisible(visible: boolean): void;
}> = ({visible, setVisible}) => {
  return (
    <Drawer
      title="发布设置"
      placement="right"
      mask={false}
      closable={true}
      onClose={() => {
        setVisible(false);
      }}
      visible={visible}
    >
      WIP
    </Drawer>
  );
};
