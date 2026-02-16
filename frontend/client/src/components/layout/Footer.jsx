import { Link } from 'react-router-dom';
import { Briefcase, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-300 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">JobPortal</span>
            </Link>
            <p className="text-sm text-dark-400 max-w-xs">
              Your gateway to dream careers. Connect with top employers and find opportunities that match your skills.
            </p>
            <div className="flex gap-3">
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Linkedin} href="#" />
              <SocialLink icon={Github} href="#" />
              <SocialLink icon={Mail} href="#" />
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2">
              <FooterLink to="/jobs">Browse Jobs</FooterLink>
              <FooterLink to="/companies">Companies</FooterLink>
              <FooterLink to="/jobs?type=remote">Remote Jobs</FooterLink>
              <FooterLink to="/salary-guide">Salary Guide</FooterLink>
              <FooterLink to="/career-advice">Career Advice</FooterLink>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <FooterLink to="/employer/post-job">Post a Job</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/employer/solutions">Solutions</FooterLink>
              <FooterLink to="/employer/resources">Resources</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/help">Help Center</FooterLink>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-dark-500">
            &copy; {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>
          <p className="text-sm text-dark-500">
            Made with ❤️ for job seekers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ icon: Icon, href }) {
  return (
    <a
      href={href}
      className="w-9 h-9 rounded-lg bg-dark-800 hover:bg-primary-500 flex items-center justify-center transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon size={16} />
    </a>
  );
}
