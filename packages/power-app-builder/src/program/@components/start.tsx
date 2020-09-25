import CopyFilled from '@ant-design/icons/CopyFilled';
import FolderOpenFilled from '@ant-design/icons/FolderOpenFilled';
import PlusCircleFilled from '@ant-design/icons/PlusCircleFilled';
import {PowerApp} from '@makeflow/types';
import {Card, Modal, notification} from 'antd';
import React, {FC, useState} from 'react';

const Meta = Card.Meta;

export const Start: FC<{
  toShow: boolean;
  setToShow(toShow: boolean): void;
  onChange(definition: PowerApp.RawDefinition): void;
}> = ({onChange, toShow, setToShow}) => {
  const [copying, setCopying] = useState<boolean>(false);

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
              message: 'Import Failed',
              description: error.message,
            });
          }
        }
      };
    };
  }

  return (
    <Modal
      title="Bootstrap"
      width={580}
      visible={toShow}
      // eslint-disable-next-line no-null/no-null
      footer={null}
      closable={false}
      maskClosable={true}
      centered
      onCancel={() => setToShow(false)}
    >
      <div className="start">
        <Card onClick={importDefinition}>
          <Meta avatar={<FolderOpenFilled />} title="Import" />
        </Card>

        <Card
          className={copying ? 'active' : ''}
          onClick={() => {
            const once = (): void => {
              setCopying(false);
              document.removeEventListener('click', once);
            };
            document.addEventListener('click', once);
            setCopying(true);
          }}
          onPaste={({clipboardData}) => {
            try {
              const data = JSON.parse(clipboardData.getData('text/plain'));
              setCopying(false);
              onChange(data);
              setToShow(false);
            } catch (error) {
              notification.open({
                message: 'Paste Failed',
                description: error.message,
              });
            }
          }}
        >
          <Meta avatar={<CopyFilled />} title="Clipboard" />
        </Card>

        <Card onClick={() => setToShow(false)}>
          <Meta avatar={<PlusCircleFilled />} title="New" />
        </Card>
      </div>
    </Modal>
  );
};
