
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Globe, Award, Target, Eye } from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: "Sifa Muhindo",
      role: "Founder & Executive Director",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=300&h=300&fit=crop&crop=face",
      bio: "Sifa founded the organization after witnessing the impact of conflict on her community in Congo. She has dedicated her life to bringing hope and healing to war-torn regions."
    },
    {
      name: "Dr. Jean Baptiste",
      role: "Medical Director",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
      bio: "A experienced physician specializing in emergency medicine and public health in conflict zones."
    },
    {
      name: "Marie Kalanga",
      role: "Program Coordinator",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face",
      bio: "Marie oversees our field operations and ensures aid reaches the most vulnerable communities."
    },
    {
      name: "Paul Mukendi",
      role: "Logistics Manager",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Paul manages the complex logistics of delivering aid in challenging environments."
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We lead with empathy and understanding, treating every person with dignity and respect."
    },
    {
      icon: Users,
      title: "Community",
      description: "We work alongside local communities, empowering them to be part of the solution."
    },
    {
      icon: Globe,
      title: "Impact",
      description: "We focus on sustainable, long-term solutions that create lasting positive change."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, ensuring maximum impact from every donation."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          About Sifas Heart Foundation
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
          Founded with a mission to bring hope, healing, and sustainable development to communities 
          affected by conflict in Congo and beyond. We believe that every person deserves access 
          to basic human needs and the opportunity to thrive.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Target className="mr-3 h-6 w-6 text-blue-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              To provide immediate humanitarian relief and long-term development support to 
              communities affected by conflict in the Democratic Republic of Congo and other 
              war-torn regions, while empowering local leaders and fostering sustainable solutions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Eye className="mr-3 h-6 w-6 text-blue-600" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              A world where all people affected by conflict have access to essential services, 
              opportunities for growth, and the support they need to rebuild their lives and 
              communities with dignity and hope.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Our Story */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Our Story
        </h2>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  Sifas Heart Foundation was born from the personal experience of our founder, Sifa Muhindo, 
                  who witnessed firsthand the devastating effects of conflict on her community in Eastern Congo. 
                  After her family was displaced by violence in 2018, Sifa experienced both the desperation 
                  of losing everything and the profound impact that humanitarian aid could have.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  What started as a small effort to help her neighbors access clean water and basic medical 
                  care has grown into a comprehensive foundation serving thousands of families across the region. 
                  Sifa's vision was simple but powerful: no one should have to face crisis alone.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Today, Sifas Heart Foundation operates with a network of local volunteers, international 
                  partners, and dedicated supporters who share our commitment to bringing hope to the most 
                  vulnerable communities. Every program we run, every well we dig, and every school we build 
                  is a testament to the resilience of the human spirit and the power of collective action.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Values */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <Badge variant="secondary" className="mb-4">
                  {member.role}
                </Badge>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Our Impact Since 2018
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50,000+</div>
            <div className="text-gray-700 dark:text-gray-300">People Served</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">25</div>
            <div className="text-gray-700 dark:text-gray-300">Communities Reached</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">15</div>
            <div className="text-gray-700 dark:text-gray-300">Water Wells Built</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">5</div>
            <div className="text-gray-700 dark:text-gray-300">Schools Established</div>
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Recognition & Partnerships
        </h2>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We are proud to work alongside various international organizations and have received 
            recognition for our transparent operations and community-centered approach.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Transparency Award 2023</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recognized for financial transparency and accountability
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community Impact Award</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Honored for sustainable community development programs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">UN Partnership</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Collaborating with UN agencies on humanitarian efforts
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
