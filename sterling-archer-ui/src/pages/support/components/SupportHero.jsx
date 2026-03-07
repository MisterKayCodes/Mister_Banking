import React from 'react';
import Icon from '../../../components/AppIcon';

const SupportHero = () => {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground p-8 md:p-12 text-background shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 rotate-12">
                <Icon name="MessageSquare" size={300} />
            </div>

            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-accent rounded-2xl text-white">
                        <Icon name="Headset" size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                        Private Client Relations
                    </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 tracking-tight">
                    How May We Assist You?
                </h2>

                <p className="text-sm md:text-lg opacity-80 leading-relaxed font-medium">
                    Our dedicated support team is available 24/7 to handle your inquiries with the utmost discretion and efficiency. Whether you need technical assistance or have specific account requests, we are here to ensure your banking experience remains seamless.
                </p>
            </div>
        </div>
    );
};

export default SupportHero;
