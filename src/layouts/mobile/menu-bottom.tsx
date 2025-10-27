import { Tab, Card, Tabs } from '@mui/material';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { menuBottom } from '../nav-config-menu-bottom';

export function MenuButtom() {
  const path = usePathname();

  return (
    <Card sx={{ p: 1 }}>
      <Tabs value={path} type="button" sx={{ borderRadius: 1, '& a': { flex: 1, height: 76 } }}>
        {menuBottom?.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            icon={tab.icon as any}
            iconPosition="top"
            LinkComponent={RouterLink}
            href={tab.href}
            value={tab.href}
          />
        ))}
      </Tabs>
    </Card>
  );
}
