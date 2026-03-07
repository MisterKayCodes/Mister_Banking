import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';

// New Point-Based Administrative Components
import PeopleLedger from './components/PeopleLedger';
import FinancialControl from './components/FinancialControl';
import CryptoCommander from './components/CryptoCommander';
import SecurityLaws from './components/SecurityLaws';
import SupportCenter from './components/SupportCenter';

/**
 * Foundation Terminal - Main Command Hub
 * Organized around the 5 pillars of administrative governance.
 */
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('people');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const tabs = [
        { id: 'people', label: 'People Management', icon: 'Users', component: PeopleLedger },
        { id: 'financial', label: 'Financial Control', icon: 'DollarSign', component: FinancialControl },
        { id: 'crypto', label: 'Crypto & Trading', icon: 'Coins', component: CryptoCommander },
        { id: 'security', label: 'Security & Laws', icon: 'ShieldAlert', component: SecurityLaws },
        { id: 'support', label: 'Support Center', icon: 'HelpCircle', component: SupportCenter },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || PeopleLedger;

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Foundation Control Center - Sterling-Archer Trust</title>
            </Helmet>

            <SidebarNavigation isCollapsed={isSidebarCollapsed} userRole="admin" />

            <div className={`transition-smooth min-h-screen flex flex-col ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Institutional Header */}
                <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-8 py-4 flex justify-between items-center h-20">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-foreground text-background rounded-xl shadow-lg">
                            <Icon name="Activity" size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-heading font-extrabold text-foreground uppercase italic tracking-tighter">
                                Foundation Terminal
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                                    Secure Connection Established
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Tab Selector */}
                    <div className="hidden xl:flex items-center gap-2 p-1 bg-muted/50 rounded-2xl border border-border">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
                                    }`}
                            >
                                <Icon name={tab.icon} size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end hidden md:block border-r border-border pr-4">
                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Administrator</span>
                            <span className="text-[9px] text-muted-foreground uppercase opacity-60">Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden lg:flex items-center justify-center w-10 h-10 hover:bg-muted rounded-xl transition-smooth text-muted-foreground"
                        >
                            <Icon name={isSidebarCollapsed ? 'Maximize' : 'Minimize'} size={20} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-10 bg-muted/10">
                    {/* Mobile Tab Selector */}
                    <div className="xl:hidden flex overflow-x-auto gap-3 pb-6 mb-8 scrollbar-hide border-b border-border">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-foreground text-background shadow-lg'
                                    : 'bg-card text-muted-foreground border border-border'
                                    }`}
                            >
                                <Icon name={tab.icon} size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ActiveComponent />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
