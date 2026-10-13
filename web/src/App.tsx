import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Workout from './pages/Workout';
import History from './pages/History';
import Stats from './pages/Stats';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthProvider from './auth/AuthProvider';
import { RedirectIfAuthenticated, RequireAuth } from './auth/RouteGuards';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="workout" element={<Workout />} />
              <Route path="history" element={<History />} />
              <Route path="stats" element={<Stats />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
