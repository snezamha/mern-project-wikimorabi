import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
export default function LoadingBox() {
  return (
    <div>
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    </div>
  );
}