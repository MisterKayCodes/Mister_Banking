import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AuthLayout from '../../components/ui/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import api from '../../api/axios';
import { useToast } from 'hooks/useToast';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { showToast, ToastComponent } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            const { access_token } = response.data;

            if (access_token) {
                // Temporary store to check profile
                localStorage.setItem('sa_auth_token', access_token);

                // Verify admin status
                const userRes = await api.get('/users/me');
                if (userRes.data.is_admin) {
                    showToast('Welcome, Founder. Access granted.', 'success');
                    navigate('/admin-dashboard');
                } else {
                    localStorage.removeItem('sa_auth_token');
                    showToast('Founder-level clearance required.', 'error');
                }
            }
        } catch (error) {
            const serverMessage = error.response?.data?.detail || 'Access denied. The vault remains closed.';
            showToast(serverMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Founder Access - Sterling-Archer Trust</title>
            </Helmet>

            <AuthLayout>
                <div className="space-y-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
                            <Icon name="ShieldAlert" size={32} color="var(--color-primary-foreground)" />
                        </div>
                        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                            Administrative Terminal
                        </h2>
                        <p className="text-muted-foreground caption uppercase tracking-widest font-black text-[10px]">
                            Foundation Level Encryption Required
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Security Identifier (Email)"
                            type="email"
                            name="email"
                            placeholder="Enter administrative ID"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />

                        <div className="relative">
                            <Input
                                label="Encryption Key (Password)"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter your key"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 p-2 text-muted-foreground hover:text-foreground transition-smooth"
                            >
                                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} color="currentColor" />
                            </button>
                        </div>

                        <Button
                            type="submit"
                            variant="default"
                            loading={isLoading}
                            disabled={isLoading}
                            fullWidth
                            className="bg-foreground text-background hover:bg-foreground/90"
                        >
                            Authorize Access
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-border flex justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 transition-smooth"
                        >
                            <Icon name="ArrowLeft" size={14} />
                            Return to Standard Terminal
                        </button>
                    </div>
                </div>
                {ToastComponent}
            </AuthLayout>
        </>
    );
};

export default AdminLogin;
