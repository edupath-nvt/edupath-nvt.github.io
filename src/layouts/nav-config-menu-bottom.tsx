import { t } from 'src/hooks/lang';

import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const menuBottom: AccountPopoverProps['data'] = [
  {
    label: t('Target'),
    href: '/target',
    icon: <Iconify width={22} icon="streamline-flex:target-solid" />,
  },
  {
    label: t('Ranking'),
    href: '/ranking',
    icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
  },
  {
    label: t('Settings'),
    href: '/setting',
    icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
  },
];
