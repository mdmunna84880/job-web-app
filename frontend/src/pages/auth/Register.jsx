import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { registerSchema } from '../../utils/validationSchemas.js';
import api from '../../utils/api.js';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

export default function Register() {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: joiResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'candidate',
    },
  });

  const onSubmit = async (data) => {
    setSuccessMsg('');
    try {
      await api.post('/auth/register', data);
      setSuccessMsg('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.errors) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((field) => {
          setError(field, { type: 'server', message: backendErrors[field] });
        });
      } else {
        setError('root', {
          type: 'server',
          message: err.response?.data?.message || 'Something went wrong. Please try again.',
        });
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 font-sans">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Get started with Placement Readiness Tracker
          </p>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg" role="alert">
            {successMsg}
          </div>
        )}

        {errors.root && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-lg" role="alert">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            id="name"
            placeholder="John Doe"
            required
            error={errors.name?.message}
            {...register('name')}
          />

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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium text-slate-700">
              I am joining as a <span className="text-rose-500">*</span>
            </label>
            <select
              id="role"
              className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
              {...register('role')}
            >
              <option value="candidate">Candidate (Job Seeker)</option>
              <option value="mentor">Mentor / Career Coach</option>
              <option value="admin">Program Coordinator / Admin</option>
            </select>
            {errors.role && (
              <span className="text-xs text-rose-500 font-medium">{errors.role.message}</span>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
