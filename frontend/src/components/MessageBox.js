import Alert from 'react-bootstrap/Alert';
import Stack from '@mui/material/Stack';

export default function MessageBox(props) {
  return (
    <Stack sx={{ width: '100%' }}>
      <Alert variant={props.variant || 'info'}>{props.children}</Alert>
    </Stack>
  );
}
