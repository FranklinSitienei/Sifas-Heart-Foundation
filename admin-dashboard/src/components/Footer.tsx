
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-blue-600" fill="currentColor" />
              <span className="text-xl font-bold text-blue-600">Sifa's Heart Foundation</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Supporting communities affected by conflict in Congo and beyond. 
              Every donation makes a difference in someone's life.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                info@sifaheart.org
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                +1 (555) 123-4567
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-blue-600">About Us</Link></li>
              <li><Link to="/donate" className="text-muted-foreground hover:text-blue-600">Donate Now</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-blue-600">Our Blog</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-blue-600">Terms of Service</Link></li>
              <li><Link to="/transparency" className="text-muted-foreground hover:text-blue-600">Financial Transparency</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Sifa's Heart Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
