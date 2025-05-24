
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, CheckCircle } from 'lucide-react';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Emergency Relief Reaches 500 Families in Eastern Congo",
      excerpt: "Our latest mission has successfully delivered emergency supplies to families displaced by recent conflicts in the Kivu region.",
      author: "Sifa's Heart Foundation",
      date: "2024-01-15",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&h=300&fit=crop",
      verified: true,
      category: "Emergency Relief"
    },
    {
      id: 2,
      title: "Building Hope: New School Opens in Bukavu",
      excerpt: "Thanks to generous donations, we've opened a new primary school serving 300 children in the Bukavu community.",
      author: "Sifa's Heart Foundation",
      date: "2024-01-10",
      image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=500&h=300&fit=crop",
      verified: true,
      category: "Education"
    },
    {
      id: 3,
      title: "Clean Water Initiative: 10 Wells Completed This Month",
      excerpt: "Our water initiative has brought clean, safe drinking water to 10 communities across the region.",
      author: "Sifa's Heart Foundation",
      date: "2024-01-05",
      image: "https://images.unsplash.com/photo-1541919329513-35f7af297129?w=500&h=300&fit=crop",
      verified: true,
      category: "Water & Sanitation"
    },
    {
      id: 4,
      title: "Healthcare Clinic Expansion in Goma",
      excerpt: "Our healthcare services have expanded to include specialized care for women and children in the Goma region.",
      author: "Sifa's Heart Foundation",
      date: "2023-12-28",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=300&fit=crop",
      verified: true,
      category: "Healthcare"
    },
    {
      id: 5,
      title: "Volunteer Training Program Launches",
      excerpt: "We're training local volunteers to become community leaders and aid distribution coordinators.",
      author: "Sifa's Heart Foundation",
      date: "2023-12-20",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=500&h=300&fit=crop",
      verified: true,
      category: "Community"
    },
    {
      id: 6,
      title: "Year-End Impact Report: 50,000 Lives Touched",
      excerpt: "Looking back at 2023, we've made a significant impact in the lives of over 50,000 people across Congo.",
      author: "Sifa's Heart Foundation",
      date: "2023-12-15",
      image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=500&h=300&fit=crop",
      verified: true,
      category: "Impact Report"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Foundation Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Stay updated with our latest missions, impact stories, and news from the field
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{post.category}</Badge>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(post.date).toLocaleDateString()}
                </div>
              </div>
              <CardTitle className="line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Link to={`/blog/${post.id}`}>
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {post.author}
                  </span>
                  {post.verified && (
                    <CheckCircle className="h-4 w-4 ml-1 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <Link
                  to={`/blog/${post.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  Read More
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Blog;
