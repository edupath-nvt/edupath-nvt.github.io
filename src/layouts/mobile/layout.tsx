import { Card, Stack, Container, CardContent } from '@mui/material';

import { MenuButtom } from './menu-bottom';

export function LayoutMobile({ children }: React.PropsWithChildren) {
  return (
    <Container maxWidth="sm">
      <Stack height="100dvh" spacing={2} py={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>{children}</CardContent>
        </Card>
        <MenuButtom />
      </Stack>
    </Container>
  );
}
