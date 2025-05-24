
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, User, CheckCircle, Heart, MessageCircle, Reply } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: Reply[];
  adminReply?: AdminReply;
  profilePicture: string;
}

interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
  profilePicture: string;
}

interface AdminReply {
  content: string;
  timestamp: Date;
  profilePicture: string;
}

const BlogPost = () => {
  const { id } = useParams();
  const { user, addAchievement } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Sarah Johnson',
      content: 'This is absolutely incredible work! Thank you for making such a difference in these communities.',
      timestamp: new Date('2024-01-16T10:30:00'),
      likes: 12,
      replies: [
        {
          id: '1-1',
          author: 'Mike Wilson',
          content: 'I completely agree! This foundation is doing amazing work.',
          timestamp: new Date('2024-01-16T11:00:00'),
          likes: 3,
          profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
        }
      ],
      adminReply: {
        content: 'Thank you Sarah! Your support means everything to us. Together we can make an even bigger impact. 💙',
        timestamp: new Date('2024-01-16T14:00:00'),
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=40&h=40&fit=crop&crop=face'
      },
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '2',
      author: 'David Chen',
      content: 'How can I get involved as a volunteer? This work is inspiring and I want to help.',
      timestamp: new Date('2024-01-16T09:15:00'),
      likes: 8,
      replies: [],
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    }
  ]);

  // Mock blog post data
  const blogPost = {
    id: parseInt(id || '1'),
    title: "Emergency Relief Reaches 500 Families in Eastern Congo",
    content: `Our latest mission has successfully delivered emergency supplies to families displaced by recent conflicts in the Kivu region. This comprehensive relief effort has provided essential aid including food, clean water, medical supplies, and temporary shelter materials.

The situation in Eastern Congo remains challenging, with thousands of families having been forced to leave their homes due to ongoing conflicts. Our team on the ground has been working tirelessly to ensure that aid reaches those who need it most.

**What We've Accomplished:**

• Distributed emergency food packages to 500 families
• Provided clean water access for over 2,000 individuals
• Delivered medical supplies to 3 local health centers
• Set up temporary learning spaces for 200 children

The emergency supplies included rice, beans, cooking oil, salt, and other essential food items that can sustain a family of five for up to two weeks. Additionally, we provided water purification tablets and basic hygiene kits to help prevent the spread of waterborne diseases.

Our medical team conducted health screenings and provided immediate care to those in need. We treated cases of malnutrition, respiratory infections, and other conditions common in displacement situations.

**Community Response:**

The response from the local communities has been overwhelmingly positive. Maria Kahenga, a mother of four who received aid, shared: "We had nothing when we arrived here. Thanks to Sifas Heart Foundation, my children have food to eat and clean water to drink. We are so grateful."

**Looking Forward:**

This emergency response is just the beginning. We are now working on longer-term solutions including:

• Building permanent water wells in affected communities
• Establishing sustainable food production programs
• Creating educational opportunities for displaced children
• Providing skills training for adults to rebuild their livelihoods

Your continued support makes missions like this possible. Every donation, no matter the size, directly impacts the lives of families in need.`,
    author: "Sifa's Heart Foundation",
    date: "2024-01-15",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=400&fit=crop",
    verified: true,
    category: "Emergency Relief",
    readTime: "5 min read"
  };

  const handleCommentSubmit = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: user.name,
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      replies: [],
      profilePicture: user.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    };

    setComments([comment, ...comments]);
    setNewComment('');

    addAchievement({
      title: 'Voice Heard',
      description: 'You left your first comment on a blog post',
      icon: '💬'
    });

    toast({
      title: "Comment added!",
      description: "Thank you for sharing your thoughts.",
    });
  };

  const handleReplySubmit = (commentId: string) => {
    if (!user || !replyContent.trim()) return;

    const reply: Reply = {
      id: Date.now().toString(),
      author: user.name,
      content: replyContent,
      timestamp: new Date(),
      likes: 0,
      profilePicture: user.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    };

    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyContent('');
    setReplyTo(null);

    addAchievement({
      title: 'Great Conversationalist',
      description: 'You replied to a comment',
      icon: '↩️'
    });
  };

  const handleLike = (commentId: string, isReply?: boolean, replyId?: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like comments.",
        variant: "destructive",
      });
      return;
    }

    if (isReply && replyId) {
      setComments(comments.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === replyId
                  ? { ...reply, likes: reply.likes + 1 }
                  : reply
              )
            }
          : comment
      ));
    } else {
      setComments(comments.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      ));
    }

    addAchievement({
      title: 'Engagement Champion',
      description: 'You liked a comment',
      icon: '❤️'
    });
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link to="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Blog
        </Link>
      </nav>

      {/* Article Header */}
      <article className="mb-12">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-4">{blogPost.category}</Badge>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {blogPost.title}
          </h1>
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{blogPost.author}</span>
                {blogPost.verified && (
                  <CheckCircle className="h-4 w-4 ml-1 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(blogPost.date).toLocaleDateString()}</span>
              </div>
              <span>{blogPost.readTime}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="aspect-video mb-8 overflow-hidden rounded-lg">
          <img
            src={blogPost.image}
            alt={blogPost.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {blogPost.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('**') && paragraph.endsWith(':**')) {
              return (
                <h3 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                  {paragraph.replace(/\*\*/g, '')}
                </h3>
              );
            }
            if (paragraph.startsWith('•')) {
              const items = paragraph.split('\n').filter(item => item.startsWith('•'));
              return (
                <ul key={index} className="list-disc pl-6 mb-6">
                  {items.map((item, itemIndex) => (
                    <li key={itemIndex} className="mb-2">
                      {item.substring(2)}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>

      {/* Comments Section */}
      <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Comments ({comments.length})
        </h2>

        {/* Add Comment */}
        {user ? (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-4"
                  />
                  <Button onClick={handleCommentSubmit}>Post Comment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">log in</Link> to join the conversation.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                {/* Comment Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={comment.profilePicture}
                      alt={comment.author}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {comment.author}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {comment.timestamp.toLocaleDateString()} at {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {comment.content}
                </p>

                {/* Comment Actions */}
                <div className="flex items-center space-x-4 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(comment.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {comment.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="text-gray-500"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  {comment.replies.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplies(comment.id)}
                      className="text-gray-500"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {showReplies[comment.id] ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </Button>
                  )}
                </div>

                {/* Admin Reply */}
                {comment.adminReply && (
                  <div className="ml-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={comment.adminReply.profilePicture}
                        alt="Sifa Muhindo"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex items-center">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          Sifa Muhindo
                        </span>
                        <CheckCircle className="h-4 w-4 ml-1 text-blue-600" />
                        <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {comment.adminReply.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200">
                      {comment.adminReply.content}
                    </p>
                  </div>
                )}

                {/* Reply Form */}
                {replyTo === comment.id && user && (
                  <div className="ml-8 mt-4">
                    <div className="flex space-x-3">
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <Textarea
                          placeholder={`Reply to ${comment.author}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleReplySubmit(comment.id)}
                          >
                            Reply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyTo(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {showReplies[comment.id] && comment.replies.length > 0 && (
                  <div className="ml-8 mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-3">
                        <img
                          src={reply.profilePicture}
                          alt={reply.author}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-gray-900 dark:text-white">
                                {reply.author}
                              </span>
                              <span className="text-xs text-gray-500">
                                {reply.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {reply.content}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(comment.id, true, reply.id)}
                              className="text-xs text-gray-500 hover:text-red-500 h-6 px-2"
                            >
                              <Heart className="h-3 w-3 mr-1" />
                              {reply.likes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
