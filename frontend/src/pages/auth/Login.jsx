import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { useDispatch, useSelector } from 'react-redux';
import { loginSchema } from '../../utils/validationSchemas.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import api, { setAccessToken } from '../../utils/api.js';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useEffect } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // If the user session is already active, direct them to their dashboard
    if (!loading && user) {
      if (user.role === 'candidate') {
        navigate('/dashboard/candidate', { replace: true });
      } else if (user.role === 'mentor') {
        navigate('/dashboard/mentor', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: joiResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      const { token, data: payload } = response.data;
      
      // Save access token in memory
      setAccessToken(token);
      
      // Update global Redux state
      dispatch(setCredentials({ user: payload.user, token }));

      // Redirect based on role
      if (payload.user.role === 'candidate') {
        navigate('/dashboard/candidate');
      } else if (payload.user.role === 'mentor') {
        navigate('/dashboard/mentor');
      } else if (payload.user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.errors) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((field) => {
          setError(field, { type: 'server', message: backendErrors[field] });
        });
      } else {
        setError('root', {
          type: 'server',
          message: err.response?.data?.message || 'Invalid email or password.',
        });
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-650 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500 font-sans">Loading session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 font-sans">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Log in to manage placement tracking
          </p>
        </div>

        {errors.root && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-lg" role="alert">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="john@example.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </main>
  );
}
