import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import api from '../../../api/axios'; // Ensure this file exists!

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ... (Keep your validation functions exactly as they were)
  const validateFullName = (name) => {
    if (!name?.trim()) return 'Full name is required';
    if (name?.trim()?.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s'-]+$/?.test(name)) return 'Name contains invalid characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex?.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return 'Date of Birth is required';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password?.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/?.test(password)) return 'Password must contain a lowercase letter';
    if (!/(?=.*[A-Z])/?.test(password)) return 'Password must contain an uppercase letter';
    if (!/(?=.*\d)/?.test(password)) return 'Password must contain a number';
    if (!/(?=.*[@$!%*?&#])/?.test(password)) return 'Password must contain a special character';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    let error = '';
    switch (field) {
      case 'fullName': error = validateFullName(value); break;
      case 'email': error = validateEmail(value); break;
      case 'dateOfBirth': error = validateDateOfBirth(value); break;
      case 'password':
        error = validatePassword(value);
        if (formData?.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(formData?.confirmPassword, value) }));
        }
        break;
      case 'confirmPassword': error = validateConfirmPassword(value, formData?.password); break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const newErrors = {
      fullName: validateFullName(formData?.fullName),
      email: validateEmail(formData?.email),
      dateOfBirth: validateDateOfBirth(formData?.dateOfBirth),
      password: validatePassword(formData?.password),
      confirmPassword: validateConfirmPassword(formData?.confirmPassword, formData?.password)
    };

    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    if (Object.values(newErrors)?.some(error => error !== '')) return;

    setIsLoading(true);

    try {
      // Map 'fullName' to 'full_name' for the FastAPI UserCreate schema
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        date_of_birth: formData.dateOfBirth,
        password: formData.password
      };

      // Real API Call to your FastAPI endpoint
      const response = await api.post('/auth/register', payload);

      if (response.data) {
        navigate('/login', {
          state: {
            message: 'Account created successfully! Welcome to the Trust.',
            email: formData?.email
          }
        });
      }
    } catch (error) {
      // Catching the specific detail message from your FastAPI HTTPException
      const serverError = error.response?.data?.detail || 'Registration failed. The vault is closed.';
      setErrors(prev => ({ ...prev, submit: serverError }));
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Keep getPasswordStrength and the return statement exactly as they were)
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password?.length >= 8) strength++;
    if (/(?=.*[a-z])/?.test(password)) strength++;
    if (/(?=.*[A-Z])/?.test(password)) strength++;
    if (/(?=.*\d)/?.test(password)) strength++;
    if (/(?=.*[@$!%*?&#])/?.test(password)) strength++;
    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-error' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-warning' };
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-accent' };
    return { strength, label: 'Strong', color: 'bg-success' };
  };

  const passwordStrength = getPasswordStrength(formData?.password);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        value={formData?.fullName}
        onChange={(e) => handleInputChange('fullName', e?.target?.value)}
        error={errors?.fullName}
        required
        disabled={isLoading}
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email address"
        value={formData?.email}
        onChange={(e) => handleInputChange('email', e?.target?.value)}
        error={errors?.email}
        required
        disabled={isLoading}
      />
      <Input
        label="Date of Birth"
        type="date"
        placeholder=""
        value={formData?.dateOfBirth}
        onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
        error={errors?.dateOfBirth}
        required
        disabled={isLoading}
      />
      <div className="space-y-2">
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 p-2 text-muted-foreground hover:text-foreground transition-smooth"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} color="currentColor" />
          </button>
        </div>

        {formData?.password && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength?.color}`}
                  style={{ width: `${(passwordStrength?.strength / 5) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium caption ${passwordStrength?.strength <= 2 ? 'text-error' :
                passwordStrength?.strength <= 3 ? 'text-warning' :
                  passwordStrength?.strength <= 4 ? 'text-accent' : 'text-success'
                }`}>
                {passwordStrength?.label}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Re-enter your password"
          value={formData?.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
          error={errors?.confirmPassword}
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-9 p-2 text-muted-foreground hover:text-foreground transition-smooth"
        >
          <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} color="currentColor" />
        </button>
      </div>

      <div className="space-y-2">
        <Checkbox
          label={
            <span className="text-sm text-foreground">
              I agree to the <a href="#" className="text-accent">Terms of Service</a> and <a href="#" className="text-accent">Privacy Policy</a>
            </span>
          }
          checked={formData?.agreeToTerms}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, agreeToTerms: e?.target?.checked }));
            setErrors(prev => ({ ...prev, agreeToTerms: '' }));
          }}
          disabled={isLoading}
        />
        {errors?.agreeToTerms && (
          <p className="text-sm text-error caption flex items-center gap-1">
            <Icon name="AlertCircle" size={14} color="currentColor" />
            {errors?.agreeToTerms}
          </p>
        )}
      </div>

      {errors?.submit && (
        <div className="flex items-center gap-2 px-4 py-3 bg-error/10 border border-error/20 rounded-xl">
          <Icon name="AlertCircle" size={16} color="var(--color-error)" />
          <p className="text-sm text-error caption">{errors?.submit}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        loading={isLoading}
        disabled={isLoading}
        fullWidth
      >
        Create Account
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground caption">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-accent font-medium"
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm;