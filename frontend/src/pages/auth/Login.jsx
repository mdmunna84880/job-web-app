import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { useDispatch } from 'react-redux';
import { loginSchema } from '../../utils/validationSchemas.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import api, { setAccessToken } from '../../utils/api.js';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
