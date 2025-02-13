import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from './Layouts/MainLayout';
import { HomePage } from './components/home/HomePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <div>404 Not Found</div>,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
