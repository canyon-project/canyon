import { BulbFilled, BulbOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import { type FC, useEffect } from 'react';
import { ThemeEnum } from '../../types';

interface ThemeSwitchProps {
  theme: ThemeEnum | string;
  onChange: (theme: ThemeEnum) => void;
}

const ThemeSwitch: FC<ThemeSwitchProps> = ({ theme, onChange }) => {
  const isDark = theme === ThemeEnum.Dark;

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      onChange(e.matches ? ThemeEnum.Dark : ThemeEnum.Light);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [onChange]);

  return (
    <Switch
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
      checked={isDark}
      onChange={(checked) => onChange(checked ? ThemeEnum.Dark : ThemeEnum.Light)}
    />
  );
};

export default ThemeSwitch;
