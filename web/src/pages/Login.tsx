import { useLocation, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../auth/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  return (
    <AuthForm
      mode="login"
      onSubmit={async (email, password) => {
        await login(email, password);
        navigate(from, { replace: true });
      }}
    />
  );
}
