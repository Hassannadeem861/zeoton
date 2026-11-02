'use client';

import { App, ConfigProvider, theme } from 'antd';
import { colors } from '@/config/tokens';

const adminTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: colors.blue500,
    colorInfo: colors.blue500,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorBgBase: colors.ink900,
    colorBgContainer: colors.ink850,
    colorBgElevated: colors.ink800,
    colorBorder: colors.lineStrong,
    colorBorderSecondary: colors.line,
    colorTextBase: colors.mist100,
    borderRadius: 10,
    fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
  },
  components: {
    Layout: { siderBg: colors.ink950, headerBg: colors.ink900, bodyBg: colors.ink900 },
    Menu: { darkItemBg: colors.ink950, darkSubMenuItemBg: colors.ink950, darkItemSelectedBg: 'rgba(10,111,253,0.18)', darkItemSelectedColor: '#fff' },
    Table: { headerBg: colors.ink800 },
    Card: { colorBgContainer: colors.ink850 },
  },
};

export default function AdminThemeProvider({ children }) {
  return (
    <ConfigProvider theme={adminTheme} form={{ requiredMark: true }}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
