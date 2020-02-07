import {PowerApp} from '@makeflow/types';
import {Card, Icon, Modal, notification} from 'antd';
import Meta from 'antd/lib/card/Meta';
import React, {FC, useState} from 'react';

export const Start: FC<{
  onChange(definition: PowerApp.RawDefinition): void;
}> = ({onChange}) => {
  const [toShow, setToShow] = useState<boolean>(true);

  function importDefinition(): void {
    let fileInput = document.createElement('input');

    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'json');
    fileInput.click();

    fileInput.onchange = (): void => {
      let fileReader = new FileReader();

      if (!fileInput.files) {
        return;
      }

      let [file] = fileInput.files;

      fileReader.readAsText(file);
      fileReader.onload = ({target}: ProgressEvent<FileReader>): void => {
        if (!target) {
          return;
        }

        let {readyState, result} = target;

        if (readyState === FileReader.DONE && result) {
          try {
            let importedAppString =
              typeof result === 'string'
                ? result
                : String.fromCharCode.apply(
                    undefined,
                    (new Uint16Array(result) as unknown) as number[],
                  );

            let definition: PowerApp.RawDefinition = JSON.parse(
              importedAppString,
            );

            onChange(definition);

            setToShow(false);
          } catch (error) {
            notification.open({
              message: '导入失败, 请重试',
              description: error.message,
            });
          }
        }
      };
    };
  }

  return (
    <Modal
      title="选择一种方式"
      visible={toShow}
      // tslint:disable-next-line: no-null-keyword
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      onCancel={() => setToShow(false)}
    >
      <div className="start">
        <Card onClick={importDefinition}>
          <Meta
            avatar={<Icon type="folder-open" theme="filled" />}
            title="从本地导入"
            description="导入一份 json 文件"
          />
        </Card>

        <Card onClick={() => setToShow(false)}>
          <Meta
            avatar={<Icon type="plus-circle" theme="filled" />}
            title="新建文档"
            description="从零开始定义"
          />
        </Card>
      </div>
    </Modal>
  );
};
