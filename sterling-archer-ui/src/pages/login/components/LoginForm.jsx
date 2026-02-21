import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const mockCredentials = {
        email: 'john.sterling@example.com',
        password: 'Sterling@2026'
      };

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (formData?.email === mockCredentials?.email && formData?.password === mockCredentials?.password) {
        navigate('/citizen-dashboard');
      } else {
        setErrors({
          password: 'Invalid email or password. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        password: 'An error occurred during login. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="email"
        name="email"
        label="Email Address"
        placeholder="john.sterling@example.com"
        value={formData?.email}
        onChange={handleChange}
        error={errors?.email}
        required
        disabled={isLoading}
      />
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={handleChange}
          error={errors?.password}
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] p-2 text-muted-foreground hover:text-foreground transition-smooth"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} color="currentColor" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-sm text-accent hover:text-accent-foreground transition-smooth caption"
        >
          Forgot Password?
        </button>
      </div>
      <Button
        type="submit"
        variant="default"
        loading={isLoading}
        disabled={isLoading}
        fullWidth
      >
        Sign In
      </Button>
      <div className="text-center">
        <p className="text-sm text-muted-foreground caption">
          New to Sterling-Archer Trust?{' '}
          <button
            type="button"
            onClick={() => navigate('/sign-up')}
            className="text-accent hover:text-accent-foreground font-medium transition-smooth"
          >
            Create Account
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;