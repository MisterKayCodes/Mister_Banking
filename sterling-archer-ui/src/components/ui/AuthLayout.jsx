import React from 'react';


const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-6">
              <span className="text-3xl font-heading font-bold text-primary-foreground">SA</span>
            </div>
            <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
              Sterling-Archer Trust
            </h1>
            <p className="text-muted-foreground caption">
              Institutional Banking & Digital Assets
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-warm-lg p-12 border border-border">
            {children}
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground caption">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>FDIC Insured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground caption">
          <p>© 2026 Sterling-Archer Trust. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-smooth">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-smooth">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;