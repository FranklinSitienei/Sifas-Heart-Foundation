
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Calendar, User, Upload, X, Image, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mockBlogs = [
  {
    id: '1',
    title: 'Supporting Congo Crisis Relief Efforts',
    author: 'Sifa Heart Foundation',
    createdDate: '2024-05-20',
    status: 'published',
    views: 1200,
    comments: 45,
    likes: 245,
    excerpt: 'Our ongoing efforts to provide humanitarian aid to families affected by the conflict in Congo...',
    content: 'Our ongoing efforts to provide humanitarian aid to families affected by the conflict in Congo have reached a new milestone. Thanks to your generous donations, we have been able to provide clean water, food, and medical supplies to over 5,000 families in the region.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=400&fit=crop',
  },
  {
    id: '2',
    title: 'Water Well Project Update',
    author: 'Sifa Heart Foundation',
    createdDate: '2024-05-18',
    status: 'published',
    views: 890,
    comments: 32,
    likes: 189,
    excerpt: 'Great progress on our water well construction project in rural communities...',
    content: 'Great progress on our water well construction project in rural communities. We have successfully completed 3 new wells this month, providing clean drinking water to over 2,000 people.',
    image: 'https://images.unsplash.com/photo-1594736797933-d0d64e7c4768?w=800&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'Educational Support Program Launch',
    author: 'Sifa Heart Foundation',
    createdDate: '2024-05-15',
    status: 'draft',
    views: 0,
    comments: 0,
    likes: 0,
    excerpt: 'Announcing our new educational support program for children in conflict zones...',
    content: 'We are excited to announce the launch of our new educational support program for children in conflict zones. This program will provide school supplies, books, and scholarships.',
    image: null,
  },
];

export const BlogManagement = () => {
  const [blogs, setBlogs] = useState(mockBlogs);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [newBlog, setNewBlog] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: null,
  });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const getStatusBadge = (status) => {
    return status === 'published' ? (
      <Badge className="bg-green-100 text-green-800">Published</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
    );
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewBlog({ ...newBlog, image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const handleCreateBlog = () => {
    if (!newBlog.title || !newBlog.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const blog = {
      id: Date.now().toString(),
      ...newBlog,
      author: 'Sifa Heart Foundation',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      views: 0,
      comments: 0,
      likes: 0,
    };

    setBlogs([blog, ...blogs]);
    setIsCreateDialogOpen(false);
    setNewBlog({ title: '', content: '', excerpt: '', image: null });
    
    toast({
      title: "Success",
      description: "Blog post created successfully",
    });
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setNewBlog({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      image: blog.image,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBlog = () => {
    setBlogs(blogs.map(blog => 
      blog.id === editingBlog.id 
        ? { ...blog, ...newBlog }
        : blog
    ));
    setIsEditDialogOpen(false);
    setEditingBlog(null);
    setNewBlog({ title: '', content: '', excerpt: '', image: null });
    
    toast({
      title: "Success",
      description: "Blog post updated successfully",
    });
  };

  const handleDeleteBlog = (blogId) => {
    setBlogs(blogs.filter(blog => blog.id !== blogId));
    toast({
      title: "Success",
      description: "Blog post deleted successfully",
    });
  };

  const handlePublishBlog = (blogId) => {
    setBlogs(blogs.map(blog => 
      blog.id === blogId 
        ? { ...blog, status: 'published' }
        : blog
    ));
    toast({
      title: "Success",
      description: "Blog post published successfully",
    });
  };

  const BlogDialog = ({ isOpen, onOpenChange, onSubmit, title }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={newBlog.title}
              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
              placeholder="Enter blog title..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Excerpt</label>
            <Textarea
              value={newBlog.excerpt}
              onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
              placeholder="Brief description..."
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Featured Image</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              {newBlog.image ? (
                <div className="relative">
                  <img
                    src={newBlog.image}
                    alt="Preview"
                    className="max-w-full h-48 object-cover mx-auto rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setNewBlog({ ...newBlog, image: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Drag and drop an image here, or{' '}
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Content *</label>
            <Textarea
              value={newBlog.content}
              onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
              placeholder="Write your blog content here..."
              rows={12}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>
              {title.includes('Create') ? 'Create Post' : 'Update Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage blog posts</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Blog Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold">{blogs.length}</p>
              </div>
              <Edit className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold">{blogs.filter(b => b.status === 'published').length}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold">{blogs.filter(b => b.status === 'draft').length}</p>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{blogs.reduce((sum, blog) => sum + blog.views, 0).toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card key={blog.id} className="overflow-hidden">
            <div className="relative">
              {blog.image ? (
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Image className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                {getStatusBadge(blog.status)}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>SH</AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">{blog.author}</p>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">✓ Verified</Badge>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2 line-clamp-2">{blog.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {blog.excerpt}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{blog.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{blog.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{blog.views}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{blog.createdDate}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditBlog(blog)}>
                  <Edit className="h-4 w-4" />
                </Button>
                {blog.status === 'draft' && (
                  <Button size="sm" onClick={() => handlePublishBlog(blog.id)}>
                    Publish
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDeleteBlog(blog.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <BlogDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateBlog}
        title="Create New Blog Post"
      />

      {/* Edit Dialog */}
      <BlogDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateBlog}
        title="Edit Blog Post"
      />
    </div>
  );
};
