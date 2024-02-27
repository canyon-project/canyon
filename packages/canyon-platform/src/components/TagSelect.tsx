import { Editor } from '@monaco-editor/react';
import { ColorPicker, Input, Tag } from 'antd';
import { useState } from 'react';

const TagSelect = () => {
  const [value, setValue] = useState<{ text: string; color: string }[]>([]);
  return (
    <div>
      <Editor value={JSON.stringify(value, null, 2)} height={'200px'} language={'json'} />
      <Input
        placeholder='input placeholder'
        value={value.map((i) => i.text).join(',')}
        onChange={(val) => {
          setValue(
            val.target.value.split(',').map((item) => {
              return { text: item, color: value.find((i) => i.text === item)?.color || '#000000' };
            }),
          );
        }}
      />
      {value.map((item, index) => {
        return (
          <div key={index} className={'flex items-center gap-2'}>
            <Tag color={item.color}>{item.text}</Tag>
            <ColorPicker
              defaultValue={item.color}
              showText={(color) => <span>{color.toHexString()}</span>}
              onChange={(color) => {
                setValue((prev) => {
                  prev[index].color = color.toHexString();
                  return [...prev];
                });
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TagSelect;
