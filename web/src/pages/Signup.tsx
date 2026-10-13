import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../auth/useAuth';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      mode="signup"
      onSubmit={async (email, password) => {
        await signup(email, password);
        navigate('/', { replace: true });
      }}
    />
  );
}
