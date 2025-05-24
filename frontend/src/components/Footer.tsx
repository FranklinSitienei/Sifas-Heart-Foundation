
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SH</span>
              </div>
              <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                Sifas Heart Foundation
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Dedicated to providing aid and support to people affected by conflicts in Congo and other war-torn regions. 
              Together, we can make a difference in the lives of those who need it most.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Home</Link></li>
              <li><Link to="/donate" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Donate</Link></li>
              <li><Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Blog</Link></li>
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">About</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>Email: info@sifasheart.org</li>
              <li>Phone: +254 (070) 811-8654</li>
              <li>Address: 123 Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2024 Sifas Heart Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
