import { t } from 'src/i18n';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: t('Target'),
    path: '/',
    icon: icon('ic-target'),
  },
  {
    title: t('Calendar'),
    path: '/calendar',
    icon: icon('ic-calendar'),
  },
  {
    title: t('Leaderboard'),
    path: '/leaderboard',
    icon: icon('ic-analytics'),
  },
  {
    title: t('Setting'),
    path: '/setting',
    icon: icon('ic-setting'),
  },
];
