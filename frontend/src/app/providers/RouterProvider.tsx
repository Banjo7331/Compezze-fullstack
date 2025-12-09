import { BrowserRouter } from 'react-router-dom';

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};