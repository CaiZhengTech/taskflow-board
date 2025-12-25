import { useAuthStore } from '@/stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { BoardPage } from './pages/BoardPage';
import { Toaster } from '@/components/ui/toaster';

const App = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <>
      {isAuthenticated ? <BoardPage /> : <LoginPage />}
      <Toaster />
    </>
  );
};

export default App;
