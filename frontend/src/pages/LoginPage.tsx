import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});
type LoginForm = z.infer<typeof schema>;

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.add);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', data);
      login(res.data.token, res.data.user);
      addToast({ type: 'success', message: `Bem-vindo, ${res.data.user?.name ?? 'Usuário'}! 🎉` });
      onLoginSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.';
      addToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '8px',
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
    color: 'white', fontSize: '1rem', outline: 'none',
    transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.4rem',
    color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
  };
  const errorStyle: React.CSSProperties = {
    color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15), transparent 40%),
        radial-gradient(circle at 80% 20%, rgba(236,72,153,0.12), transparent 35%)
      `,
    }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '440px', maxWidth: '95%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #E0E7FF 0%, #6366F1 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.3rem',
          }}>
            AssetFlow
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gestão Inteligente de Ativos de TI
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} data-testid="login-form" noValidate>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle} htmlFor="email">Email Corporativo</label>
            <input
              id="email" type="email" placeholder="usuario@empresa.com"
              style={inputStyle} data-testid="email-input"
              {...register('email')}
            />
            {errors.email && <p style={errorStyle} role="alert">{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={labelStyle} htmlFor="password">Senha</label>
            <input
              id="password" type="password" placeholder="••••••••"
              style={inputStyle} data-testid="password-input"
              {...register('password')}
            />
            {errors.password && <p style={errorStyle} role="alert">{errors.password.message}</p>}
          </div>

          <button
            type="submit" disabled={loading} className="btn-primary"
            data-testid="submit-button"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '⏳ Autenticando...' : '🔐 Entrar no Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <div style={{ marginBottom: '0.4rem' }}>Credenciais de demonstração:</div>
          <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.82rem' }}>
            r.almeida@techflow.com / assetflow@2025
          </code>
        </div>
      </div>
    </div>
  );
};
