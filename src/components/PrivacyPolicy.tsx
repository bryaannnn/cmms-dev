import { Link } from 'react-router-dom';
import logoWida from '../assets/logo-wida.png';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="relative w-full bg-white rounded-lg shadow-sm border border-gray-100 p-8 sm:p-10 md:p-12">
          {/* Logo Header */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg flex items-center justify-center">
                <img src={logoWida} alt="Logo Wida" className="h-20 w-auto" />
              </div>
              <span className="text-2xl font-bold text-blue-800 italic">PT WIDATRA BHAKTI</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Privacy Policy
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            Effective: {new Date().toLocaleDateString()}
          </p>

          {/* Content */}
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-3">1. Information We Collect</h3>
              <p>
                We collect personal information when you register, including:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Full name and contact details</li>
                <li>Professional credentials (for healthcare providers)</li>
                <li>Usage data and cookies</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-3">2. How We Use Information</h3>
              <p>
                Your data helps us:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide pharmaceutical services</li>
                <li>Secure your account with authentication</li>
                <li>Improve our platform</li>
                <li>Comply with legal requirements</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-3">3. Data Protection</h3>
              <p>
                We implement security measures including:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Encryption of sensitive data</li>
                <li>Regular security audits</li>
                <li>Access controls to personal information</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-3">4. Third-Party Sharing</h3>
              <p>
                We only share data with:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Verified healthcare partners (with consent)</li>
                <li>Legal authorities when required</li>
                <li>Service providers under confidentiality agreements</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-3">5. Your Rights</h3>
              <p>
                You may request to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <div className="mt-8 pt-5 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:underline font-medium mb-3 sm:mb-0"
                >
                  Back to Registration
                </Link>
                <p className="text-xs text-gray-500">
                  © {new Date().getFullYear()} PT Widatra Bhakti. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;