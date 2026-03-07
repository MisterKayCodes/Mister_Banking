import React from 'react';
import Icon from '../../../components/AppIcon';

const KYCHero = ({ status, requirementsCount, loading }) => {
    if (loading) {
        return <div className="w-full h-48 bg-muted animate-pulse rounded-[2.5rem]" />;
    }

    const isVerified = status?.is_fully_verified;
    const submissions = status?.submissions || [];
    const approvedCount = submissions.filter(s => s.status === 'approved').length;

    // Dynamic progress: calculate based on actual requirements
    const totalReqs = requirementsCount || 2;
    const percentage = isVerified ? 100 : Math.round((approvedCount / totalReqs) * 100);

    return (
        <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border shadow-warm-lg ${isVerified
            ? 'bg-success text-success-foreground border-success/20'
            : 'bg-card border-border text-foreground'
            }`}>
            {/* Background Icon Watermark */}
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
                <Icon name="ShieldCheck" size={240} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-2xl ${isVerified ? 'bg-success-foreground/20' : 'bg-accent/10'}`}>
                            <Icon name={isVerified ? 'ShieldCheck' : 'ShieldAlert'} size={24} color={isVerified ? 'var(--color-success-foreground)' : 'var(--color-accent)'} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isVerified ? 'text-success-foreground/80' : 'text-accent'}`}>
                            Security & Identity Vault
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 tracking-tight">
                        {isVerified ? 'Credentials Fully Verified' : 'Complete Your Profile'}
                    </h2>

                    <p className={`text-sm md:text-lg opacity-80 leading-relaxed font-medium ${isVerified ? 'text-success-foreground' : 'text-muted-foreground'}`}>
                        {isVerified
                            ? "Your identity has been validated against our global compliance network. You now have unrestricted access to all banking and exchange features."
                            : "To access the full potential of your financial empire, including blockchain withdrawals and high-limit transfers, we need to verify your credentials."}
                    </p>
                </div>

                <div className={`shrink-0 flex flex-col items-center justify-center p-8 rounded-[2rem] border ${isVerified
                    ? 'bg-success-foreground/10 border-success-foreground/20'
                    : 'bg-muted/50 border-border'
                    }`}>
                    <div className="text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isVerified ? 'text-success-foreground/70' : 'text-muted-foreground'}`}>
                            Verification Score
                        </p>
                        <div className="flex items-end justify-center gap-1 mb-1">
                            <span className="text-6xl font-heading font-bold">{percentage}</span>
                            <span className="text-2xl font-heading font-bold opacity-40 mb-2">%</span>
                        </div>
                        <p className={`text-[10px] font-bold uppercase ${isVerified ? 'text-success-foreground' : 'text-foreground'}`}>
                            {isVerified ? 'Secure Citizen' : 'Pending Review'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCHero;
