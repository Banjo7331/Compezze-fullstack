import { Typography, Container } from '@mui/material';
import { Button } from '@/shared/ui/Button';

const HomePage = () => {
  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Witaj na Stronie Głównej
      </Typography>
      <Typography paragraph>
        To jest strona główna. Możesz zacząć dodawać tu swoje funkcjonalności
        (features).
      </Typography>
      <Button onClick={() => alert('Działam!')}>Testowy Przycisk</Button>
    </Container>
  );
};

export default HomePage;