import { Button as MuiButton } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';

export const Button = (props: ButtonProps) => {
  return <MuiButton variant="contained" {...props} />;
};