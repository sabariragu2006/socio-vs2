// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeedSection from './dashboard/FeedSection';
import ProfileModal from './dashboard/ProfileModal';
import Messages from './Messages/Messages';
import StoryModal from './Messages/StoryModal';
import DiscoverPeopleSection from './dashboard/DiscoverPeopleSection';
import './dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  // Posts State
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentTexts, setCommentTexts] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [showComments, setShowComments] = useState({});
  // Follow System State
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [followRequests, setFollowRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  // Stories State
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [currentStoryUser, setCurrentStoryUser] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  // Profile States
  const [bio, setBio] = useState("");
  const [updating, setUpdating] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const navigate = useNavigate();

  // Use environment variable for API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Authentication helper
  const requireAuth = (action, redirectTo = '/register') => {
    if (!user) {
      navigate(redirectTo);
      return false;
    }
    return true;
  };

  // Safe helper to get first letter of name
  const getInitials = (name) => (name && name.trim() !== '' ? name.charAt(0).toUpperCase() : '?');

  // Initialize data - public content loads even without auth
  useEffect(() => {
    setLoading(true);
    fetchPublicData();
  }, []);

  // Fetch authenticated user data when user is available
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      fetchFollowRequests();
      fetchNotifications();
    }
  }, [user]);

  // --- FETCHING DATA ---
  const fetchPublicData = async () => {
    try {
      // Fetch public posts (all posts)
      await fetchAllPosts();
      await fetchAllUsers();
      await fetchPublicStories();
    } catch (err) {
      console.error('Error fetching public data:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      setPostsLoading(true);
      
      if (user) {
        // If user is logged in, fetch their following posts
        const response = await fetch(`${API_BASE_URL}/posts/following/${user._id}`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        } else {
          console.log('Failed to fetch following posts');
          setPosts([]);
        }
      } else {
        // For non-authenticated users, try to get some sample posts
        // We can create a temporary user ID or fetch from a specific user
        // Let's try to fetch posts from any user as a fallback
        console.log('No user authenticated, showing empty feed');
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchPublicStories = async () => {
    try {
      setStoriesLoading(true);
      
      if (user) {
        // If user is logged in, fetch their stories
        const response = await fetch(`${API_BASE_URL}/stories/${user._id}`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setStories(data.stories || []);
        } else {
          console.log('Failed to fetch stories');
          setStories([]);
        }
      } else {
        // For non-authenticated users, show empty stories
        console.log('No user authenticated, showing empty stories');
        setStories([]);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      setStories([]);
    } finally {
      setStoriesLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setUsersLoading(true);
      const timestamp = new Date().getTime();
      const excludeParam = user ? `excludeId=${user._id}&` : '';
      const response = await fetch(`${API_BASE_URL}/users?${excludeParam}t=${timestamp}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchFollowRequests = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/follow-requests/${user._id}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFollowRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching follow requests:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${user._id}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // --- AUTH-PROTECTED HANDLERS ---
  const handleStoryUpload = async (event) => {
    if (!requireAuth('upload story')) return;
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('story', file);
      const response = await fetch(`${API_BASE_URL}/upload-story/${user._id}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload story');
      }
      fetchPublicStories();
      event.target.value = '';
    } catch (err) {
      console.error('Error uploading story:', err);
      alert(err.message || 'Failed to upload story');
    }
  };

  const openStoryModal = (storyUser) => {
    const userStories = stories.filter(s => s.author?._id === storyUser._id);
    if (userStories.length > 0) {
      setCurrentStoryUser(storyUser);
      setCurrentStoryIndex(0);
      setShowStoryModal(true);
    }
  };

  const closeStoryModal = () => {
    setShowStoryModal(false);
    setCurrentStoryUser(null);
    setCurrentStoryIndex(0);
  };

  const sendFollowRequest = async (targetUserId) => {
    if (!requireAuth('send follow request')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/send-follow-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fromUserId: user._id,
          toUserId: targetUserId
        })
      });
      if (response.ok) {
        setAllUsers(prev =>
          prev.map(u =>
            u._id === targetUserId
              ? { ...u, followStatus: 'pending' }
              : u
          )
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to send follow request');
      }
    } catch (err) {
      console.error('Error sending follow request:', err);
      alert('Failed to send follow request');
    }
  };

  const handleFollowRequest = async (requestId, action) => {
    if (!requireAuth('handle follow request')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/handle-follow-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId, action })
      });
      if (response.ok) {
        fetchFollowRequests();
        fetchNotifications();
        if (action === 'accept') {
          fetchAllPosts();
          fetchAllUsers();
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to handle follow request');
      }
    } catch (err) {
      console.error('Error handling follow request:', err);
      alert('Failed to handle follow request');
    }
  };

  const toggleComments = (postId) => {
    if (!requireAuth('view comments')) return;
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (postId) => {
    if (!requireAuth('add comment')) return;
    
    const commentText = commentTexts[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      setSubmittingComment(prev => ({ ...prev, [postId]: true }));
      const response = await fetch(`${API_BASE_URL}/add-comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user._id,
          postId: postId,
          text: commentText.trim()
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }
      const data = await response.json();
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, data.comment],
              commentCount: data.commentCount
            };
          }
          return post;
        })
      );
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      setShowComments(prev => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error('Error adding comment:', err);
      alert(err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleUpdateBio = async () => {
    if (!requireAuth('update bio')) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/update-bio/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bio: bio.trim() })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update bio');
      }
      const data = await response.json();
      // Update user in localStorage would need to be handled by parent component
    } catch (err) {
      console.error('Error updating bio:', err);
      alert(err.message || 'Failed to update bio');
    } finally {
      setUpdating(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    if (!requireAuth('update profile picture')) return;
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setUploadingProfile(true);
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await fetch(`${API_BASE_URL}/update-profile-picture/${user._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile picture');
      }
      // Handle success
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      alert('Failed to update profile picture');
    } finally {
      setUploadingProfile(false);
    }
  };

  // Navigation handlers with auth checks
  const navigateToUploads = () => {
    if (!requireAuth('create post')) return;
    navigate('/uploads');
  };

  const openProfileModal = () => {
    if (!requireAuth('view profile')) return;
    setShowProfileModal(true);
  };

  const openMessagesModal = () => {
    if (!requireAuth('view messages')) return;
    setShowMessagesModal(true);
  };

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const userPostCount = user ? posts.filter(post => post.author?._id === user._id).length : 0;

  // Login prompt component
  const LoginPrompt = ({ action }) => (
    <div className="text-center p-4 bg-light rounded-4 border" style={{
      background: 'linear-gradient(135deg, #f8f9ff 0%, #e6e8ff 100%)',
      border: '1px solid #e0e2ff'
    }}>
      <div className="mb-3">
        <i className="bi bi-person-plus-fill fs-1 text-primary"></i>
      </div>
      <h6 className="fw-bold mb-2">Join SocialSphere to {action}</h6>
      <p className="text-muted small mb-3">Connect with friends and share your moments</p>
      <div className="d-flex gap-2 justify-content-center">
        <button 
          className="btn btn-primary btn-sm px-4"
          onClick={() => navigate('/register')}
        >
          Sign Up
        </button>
        <button 
          className="btn btn-outline-primary btn-sm px-4"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    </div>
  );

  // Quote Rotator Component
  const QuoteRotator = () => {
    const quotes = [
      {
        text: "Connect with people who inspire you to be your best self",
        author: "Share Your Story"
      },
      {
        text: "In a world of connections, be the reason someone smiles today",
        author: "Spread Positivity"
      },
      {
        text: "Social media at its best: bringing hearts and minds together",
        author: "Build Community"
      },
      {
        text: "Every post is a chance to inspire, connect, and make a difference",
        author: "Create Impact"
      },
      {
        text: "Share moments that matter, create memories that last",
        author: "Capture Life"
      },
      {
        text: "Your story matters. Your voice deserves to be heard",
        author: "Be Authentic"
      }
    ];

    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prevIndex) => 
          prevIndex === quotes.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change quote every 4 seconds

      return () => clearInterval(interval);
    }, [quotes.length]);

    return (
      <div className="quote-container" style={{ minHeight: '80px' }}>
        <div 
          key={currentQuoteIndex}
          className="quote-content"
          style={{
            animation: 'fadeInOut 0.8s ease-in-out',
            textAlign: 'center'
          }}
        >
          <h4 
            className="mb-2 fw-bold"
            style={{
              fontSize: '1.4rem',
              lineHeight: 1.3,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            "{quotes[currentQuoteIndex].text}"
          </h4>
          <p 
            className="mb-0 opacity-75"
            style={{
              fontSize: '1rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {quotes[currentQuoteIndex].author}
          </p>
        </div>
        
        {/* Quote indicators */}
        <div className="d-flex justify-content-center mt-3 gap-1">
          {quotes.map((_, index) => (
            <div
              key={index}
              className="quote-indicator"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index === currentQuoteIndex ? '#ffffff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentQuoteIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" />
        <div className="socialsphere-loading">
          <div className="loading-container">
            <div className="socialsphere-logo">
              <div className="logo-icon">
                <i className="bi bi-globe"></i>
              </div>
              <h1 className="logo-text">SocialSphere</h1>
            </div>
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Loading social content...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <title>SocialSphere - Connect, Share, Discover</title>
      <meta name="description" content="Join SocialSphere to connect with friends, share your moments, and discover new content. A social media platform for everyone." />
      <meta name="keywords" content="social media, social network, connect, share, discover, friends, posts, stories" />
      <meta property="og:title" content="SocialSphere - Connect, Share, Discover" />
      <meta property="og:description" content="Join SocialSphere to connect with friends, share your moments, and discover new content." />
      <meta property="og:type" content="website" />

      {/* Bootstrap CSS & Icons */}
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" />
      
      {/* Prevent horizontal scroll globally */}
      <style>{`
        html, body, #root {
          overflow-x: hidden !important;
        }
        .socialsphere-dashboard {
          overflow-x: hidden;
        }
        
        /* Banner animations */
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        /* Quote container smooth transitions */
        .quote-content {
          transition: all 0.5s ease-in-out;
        }
        
        /* Hover effects for banner button */
        .banner-container .btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25) !important;
        }
        
        /* Responsive banner height */
        @media (max-width: 768px) {
          .banner-container {
            height: 160px !important;
          }
          .banner-container h4 {
            font-size: 1.1rem !important;
          }
          .banner-container p {
            font-size: 0.9rem !important;
          }
        }
      `}</style>

      <div className="socialsphere-dashboard">
        <div className="dashboard-background">
          <div className="bg-pattern"></div>
        </div>

        {/* Top Navigation Bar */}
        <nav className="socialsphere-nav">
          <div className="container-fluid">
            <div className="nav-content">
              <div className="nav-brand">
                <div className="brand-icon">
                  <i className="bi bi-globe"></i>
                </div>
                <span className="brand-text">SocialSphere</span>
              </div>
              <div className="nav-actions">
                <button 
                  className="nav-btn"
                  onClick={navigateToUploads}
                  title="Create Post"
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
                <button 
                  className="nav-btn position-relative"
                  onClick={openMessagesModal}
                  title="Messages"
                >
                  <i className="bi bi-chat-dots"></i>
                </button>
                {/* Discover Button for Mobile */}
                <button 
                  className="nav-btn d-md-none"
                  onClick={() => setShowDiscoverModal(true)}
                  title="Discover People"
                >
                  <i className="bi bi-people"></i>
                </button>
               
                {user ? (
                  <div 
                    className="nav-profile"
                    onClick={openProfileModal}
                  >
                    <img
                      src={user.profilePicture 
                        ? `${API_BASE_URL}${user.profilePicture}` 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff&size=40`}
                      alt={user.name}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '?')}&background=8b5cf6&color=fff&size=40`;
                      }}
                    />
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate('/login')}
                    >
                      Login
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/register')}
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="dashboard-content">
          <div className="container-fluid" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div className="row g-0">
              {/* LEFT COLUMN - Profile/Stats Section */}
              <div className="col-md-3 col-lg-3">
                {user ? (
                  <div className="profile-stats-bar bg-white rounded-4 shadow-lg border p-4" style={{ 
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    background: 'linear-gradient(90deg, #fafafa 0%, #ffffff 100%)',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                    borderRadius: '1.75rem'
                  }}>
                    {/* Profile Avatar */}
                    <div className="avatar-container rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                        padding: '3px',
                        boxShadow: '0 3px 10px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <img
                        src={user.profilePicture 
                          ? `${API_BASE_URL}${user.profilePicture}` 
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff&size=120`}
                        alt={user.name}
                        className="rounded-circle"
                        style={{ 
                          width: '74px', 
                          height: '74px', 
                          objectFit: 'cover',
                          border: '1px solid white'
                        }}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '?')}&background=8b5cf6&color=fff&size=120`;
                        }}
                      />
                    </div>
                    
                    {/* User Details */}
                    <div className="mb-4" style={{ maxWidth: '100%', wordWrap: 'break-word' }}>
                      <h5 className="profile-name mb-1 fw-bold text-dark" style={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
                        {user.name}
                      </h5>
                      <p className="profile-bio-small mb-0 text-muted" style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '500', 
                        color: '#6b7280',
                        lineHeight: 1.4,
                        margin: '4px 0 0 0'
                      }}>
                        {user.bio || "Welcome to SocialSphere!"}
                      </p>
                    </div>
                    
                    {/* Stats */}
                    <div className="d-flex flex-column gap-2 w-100 px-3">
                      <div className="stat-item text-center cursor-pointer" 
                        onClick={() => setShowFollowersModal(true)}
                        style={{
                          background: 'linear-gradient(135deg, #f0f0ff 0%, #e0e0ff 100%)',
                          color: '#6366f1',
                          padding: '10px 12px',
                          borderRadius: '1.5rem',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          transition: 'all 0.25s ease',
                          border: '1px solid #d1fae5'
                        }}
                      >
                        <strong>{Array.isArray(user.followers) ? user.followers.length : 0}</strong>
                        <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>Followers</div>
                      </div>
                      
                      <div className="stat-item text-center cursor-pointer" 
                        onClick={() => setShowFollowingModal(true)}
                        style={{
                          background: 'linear-gradient(135deg, #fff0f0 0%, #ffe6e6 100%)',
                          color: '#dc2626',
                          padding: '10px 12px',
                          borderRadius: '1.5rem',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          transition: 'all 0.25s ease',
                          border: '1px solid #fee2e2'
                        }}
                      >
                        <strong>{Array.isArray(user.following) ? user.following.length : 0}</strong>
                        <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>Following</div>
                      </div>
                      
                      {followRequests.length > 0 && (
                        <div className="stat-item text-center cursor-pointer" 
                          onClick={() => setShowProfileModal(true)}
                          style={{
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                            color: '#d97706',
                            padding: '8px 12px',
                            borderRadius: '1.5rem',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            border: '1px solid #fed7aa'
                          }}
                        >
                          <strong>{followRequests.length}</strong>
                          <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>Requests</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <LoginPrompt action="view your profile and stats" />
                )}
                
                {/* Discover People Section - Desktop Only */}
                <div className="d-none d-md-block">
                  <div className="discover-card bg-white rounded-4 shadow-sm border mt-3" style={{ 
                    maxHeight: 'calc(100vh - 160px)', 
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#8b5cf6 #f1f1f1'
                  }}>
                    <div className="p-3 border-bottom">
                      <h6 className="section-title mb-0 d-flex align-items-center">
                        <i className="bi bi-people-fill me-2 text-primary"></i>
                        Discover People
                      </h6>
                    </div>
                    <div className="discover-list modal-content" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                      {allUsers.filter(u => !user || u._id !== user._id).map((discoveryUser) => {
                        const followStatus = user && Array.isArray(user.following) && user.following.includes(discoveryUser._id) 
                          ? 'following' 
                          : discoveryUser.followStatus === 'pending' 
                          ? 'pending' 
                          : 'none';
                        return (
                          <div key={discoveryUser._id} className="p-3 border-bottom">
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={discoveryUser.profilePicture 
                                  ? `${API_BASE_URL}${discoveryUser.profilePicture}` 
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(discoveryUser.name)}&background=8b5cf6&color=fff&size=40`}
                                alt={discoveryUser.name}
                                className="rounded-circle"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(discoveryUser.name || '?')}&background=8b5cf6&color=fff&size=40`;
                                }}
                              />
                              <div className="flex-grow-1 min-w-0">
                                <h6 className="mb-0 fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>
                                  {discoveryUser.name}
                                </h6>
                                <div className="d-flex gap-2">
                                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    {discoveryUser.followers || 0} followers
                                  </small>
                                </div>
                              </div>
                              {user ? (
                                <button
                                  className={`btn btn-sm px-2 py-1 ${
                                    followStatus === 'following'
                                      ? 'btn-outline-secondary'
                                      : followStatus === 'pending'
                                      ? 'btn-secondary'
                                      : 'btn-primary'
                                  }`}
                                  style={{ fontSize: '0.7rem', borderRadius: '15px' }}
                                  disabled={followStatus === 'pending'}
                                  onClick={() => sendFollowRequest(discoveryUser._id)}
                                >
                                  {followStatus === 'following' ? 'Following' : followStatus === 'pending' ? 'Pending' : 'Follow'}
                                </button>
                              ) : (
                                <button
                                  className="btn btn-primary btn-sm px-2 py-1"
                                  style={{ fontSize: '0.7rem', borderRadius: '15px' }}
                                  onClick={() => navigate('/register')}
                                >
                                  Follow
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {allUsers.filter(u => !user || u._id !== user._id).length === 0 && (
                        <div className="p-4 text-center text-muted">
                          <i className="bi bi-people fs-1 mb-2"></i>
                          <p className="mb-0">No users to discover</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Stories & Feed */}
              <div className="col-md-9 col-lg-9">
                <div className="d-flex flex-column h-100" style={{ gap: '0' }}>
                  {/* Stories Section */}
                  <div className="mb-3">
                    <DiscoverPeopleSection 
                      currentUser={user}
                      allUsers={allUsers}
                      stories={stories}
                      openStoryModal={openStoryModal}
                      addStory={user ? () => document.getElementById('story-upload-input')?.click() : () => navigate('/register')}
                    />
                  </div>
                  
                  {/* Feed Section */}
                  <div 
                    className="feed-scroll-container" 
                    style={{ 
                      flexGrow: 1,
                      maxHeight: 'calc(100vh - 220px)',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      paddingRight: '8px',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {user ? (
                      <FeedSection 
                        posts={posts} 
                        postsLoading={postsLoading}
                        commentTexts={commentTexts}
                        submittingComment={submittingComment}
                        showComments={showComments}
                        toggleComments={toggleComments}
                        handleAddComment={handleAddComment}
                        user={user}
                        userPostCount={userPostCount}
                        formatDate={formatDate}
                        fetchPosts={fetchAllPosts}
                        setCommentTexts={setCommentTexts}
                        setSubmittingComment={setSubmittingComment}
                        setShowComments={setShowComments}
                      />
                    ) : (
                      /* Welcome Section for Non-Authenticated Users */
                      <div className="feed-section" style={{ position: 'relative', zIndex: 2 }}>
                        {/* Welcome Banner */}
                        <div className="welcome-section mb-4">
                          <div className="bg-white rounded-4 shadow-sm border p-4 text-center">
                            <div className="mb-3">
                              <i className="bi bi-globe2 fs-1 text-primary mb-2"></i>
                            </div>
                            <h3 className="fw-bold mb-2 text-primary">Welcome to SocialSphere</h3>
                            <p className="text-muted mb-4">Connect with friends, share your moments, and discover amazing content from people around the world.</p>
                            
                            <div className="row text-center mb-4">
                              <div className="col-md-4 mb-3">
                                <div className="bg-light rounded-3 p-3">
                                  <i className="bi bi-people-fill fs-2 text-success mb-2 d-block"></i>
                                  <h6 className="fw-bold">Connect</h6>
                                  <small className="text-muted">Find and follow friends</small>
                                </div>
                              </div>
                              <div className="col-md-4 mb-3">
                                <div className="bg-light rounded-3 p-3">
                                  <i className="bi bi-camera-fill fs-2 text-warning mb-2 d-block"></i>
                                  <h6 className="fw-bold">Share</h6>
                                  <small className="text-muted">Post photos and stories</small>
                                </div>
                              </div>
                              <div className="col-md-4 mb-3">
                                <div className="bg-light rounded-3 p-3">
                                  <i className="bi bi-heart-fill fs-2 text-danger mb-2 d-block"></i>
                                  <h6 className="fw-bold">Engage</h6>
                                  <small className="text-muted">Like and comment on posts</small>
                                </div>
                              </div>
                            </div>
                            
                            <div className="d-flex gap-3 justify-content-center">
                              <button 
                                className="btn btn-primary btn-lg px-4 py-2 rounded-pill fw-semibold"
                                onClick={() => navigate('/register')}
                              >
                                Join SocialSphere
                              </button>
                              <button 
                                className="btn btn-outline-primary btn-lg px-4 py-2 rounded-pill fw-semibold"
                                onClick={() => navigate('/login')}
                              >
                                Sign In
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Sample Content Showcase */}
                        {postsLoading ? (
                          <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading posts...</p>
                          </div>
                        ) : (
                          <div className="text-center p-5" style={{ position: 'relative', zIndex: 3 }}>
                            <i className="bi bi-postcard fs-1 text-muted mb-3"></i>
                            <h5>Ready to start your social journey?</h5>
                            <p className="text-muted">Sign up to see posts from friends and discover new content!</p>
                            <button 
                              className="btn btn-primary"
                              onClick={() => navigate('/register')}
                            >
                              Get Started
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Inspirational Banner - Below Posts */}
                    <div className="banner-section mb-4 mt-4" style={{ position: 'relative', zIndex: 1 }}>
                      <div 
                        className="banner-container rounded-4 overflow-hidden position-relative"
                        style={{
                          height: '200px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                      >
                        {/* Background Pattern */}
                        <div 
                          className="position-absolute w-100 h-100"
                          style={{
                            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            opacity: 0.3
                          }}
                        />
                        
                        {/* Content */}
                        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
                          <div className="text-center text-white px-4">
                            <div className="mb-3">
                              <i className="bi bi-globe2 fs-1 mb-2 d-block"></i>
                            </div>
                            <QuoteRotator />
                            {!user && (
                              <div className="mt-4">
                                <button 
                                  className="btn btn-light btn-lg px-4 py-2 rounded-pill fw-semibold"
                                  onClick={() => navigate('/register')}
                                  style={{ 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                                  }}
                                >
                                  Join the Community
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="position-absolute top-0 end-0 p-3">
                          <div 
                            className="rounded-circle bg-white"
                            style={{ 
                              width: '12px', 
                              height: '12px', 
                              opacity: 0.3,
                              animation: 'pulse 2s infinite'
                            }}
                          />
                        </div>
                        <div className="position-absolute bottom-0 start-0 p-3">
                          <div 
                            className="rounded-circle bg-white"
                            style={{ 
                              width: '8px', 
                              height: '8px', 
                              opacity: 0.4,
                              animation: 'pulse 2.5s infinite'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input for story upload */}
        {user && (
          <input 
            id="story-upload-input"
            type="file" 
            accept="image/*,video/*" 
            onChange={handleStoryUpload}
            style={{ display: 'none' }}
          />
        )}
      </div>

      {/* Modals - Only show if user is authenticated */}
      {user && showStoryModal && (
        <StoryModal 
          show={showStoryModal}
          onClose={closeStoryModal}
          currentStoryUser={currentStoryUser}
          currentStoryIndex={currentStoryIndex}
          setCurrentStoryIndex={setCurrentStoryIndex}
          stories={stories}
        />
      )}

      {user && showProfileModal && (
        <ProfileModal 
          user={user}
          bio={bio}
          setBio={setBio}
          updating={updating}
          uploadingProfile={uploadingProfile}
          handleUpdateBio={handleUpdateBio}
          handleProfilePictureUpload={handleProfilePictureUpload}
          onLogout={onLogout}
          onClose={() => setShowProfileModal(false)}
          notifications={notifications}
          followRequests={followRequests}
          handleFollowRequest={handleFollowRequest}
          formatDate={formatDate}
        />
      )}

      {user && showMessagesModal && (
        <Messages 
          user={user} 
          onClose={() => setShowMessagesModal(false)} 
        />
      )}

      {/* Followers Modal */}
      {user && showFollowersModal && (
        <div 
          onClick={() => setShowFollowersModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '20px',
            overflow: 'hidden'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              width: '95%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative',
              overflowX: 'hidden'
            }}
          >
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Followers</h5>
              <button 
                onClick={() => setShowFollowersModal(false)}
                className="btn btn-sm"
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#666' }}
              >
                ×
              </button>
            </div>
            <div className="p-3">
              {Array.isArray(user.followers) && user.followers.length > 0 ? (
                user.followers.map(followerId => {
                  const follower = allUsers.find(u => u._id === followerId);
                  if (!follower) return null;
                  return (
                    <div key={followerId} className="d-flex align-items-center gap-3 p-2 mb-2 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                      <img
                        src={follower.profilePicture 
                          ? `${API_BASE_URL}${follower.profilePicture}` 
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.name)}&background=8b5cf6&color=fff&size=40`}
                        alt={follower.name}
                        className="rounded-circle"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.name || '?')}&background=8b5cf6&color=fff&size=40`;
                        }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0 fw-semibold">{follower.name}</h6>
                        <small className="text-muted">Follows you</small>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted py-4">No followers yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {user && showFollowingModal && (
        <div 
          onClick={() => setShowFollowingModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '20px',
            overflow: 'hidden'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              width: '95%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative',
              overflowX: 'hidden'
            }}
          >
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Following</h5>
              <button 
                onClick={() => setShowFollowingModal(false)}
                className="btn btn-sm"
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#666' }}
              >
                ×
              </button>
            </div>
            <div className="p-3">
              {Array.isArray(user.following) && user.following.length > 0 ? (
                user.following.map(followingId => {
                  const following = allUsers.find(u => u._id === followingId);
                  if (!following) return null;
                  return (
                    <div key={followingId} className="d-flex align-items-center gap-3 p-2 mb-2 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                      <img
                        src={following.profilePicture 
                          ? `${API_BASE_URL}${following.profilePicture}` 
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(following.name)}&background=8b5cf6&color=fff&size=40`}
                        alt={following.name}
                        className="rounded-circle"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(following.name || '?')}&background=8b5cf6&color=fff&size=40`;
                        }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0 fw-semibold">{following.name}</h6>
                        <small className="text-muted">You follow them</small>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted py-4">You aren't following anyone yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discover People Modal - Mobile Only */}
      {showDiscoverModal && (
        <div 
          onClick={() => setShowDiscoverModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '20px',
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              width: '95%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
            className="modal-content"
          >
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Discover People</h5>
              <button 
                onClick={() => setShowDiscoverModal(false)}
                className="btn btn-sm"
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#666' }}
              >
                ×
              </button>
            </div>
            <div className="p-3">
              {allUsers.filter(u => !user || u._id !== user._id).length > 0 ? (
                allUsers.filter(u => !user || u._id !== user._id).map((discoveryUser) => {
                  const followStatus = user && Array.isArray(user.following) && user.following.includes(discoveryUser._id) 
                    ? 'following' 
                    : discoveryUser.followStatus === 'pending' 
                    ? 'pending' 
                    : 'none';
                  return (
                    <div key={discoveryUser._id} className="p-3 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={discoveryUser.profilePicture 
                            ? `${API_BASE_URL}${discoveryUser.profilePicture}` 
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(discoveryUser.name)}&background=8b5cf6&color=fff&size=40`}
                          alt={discoveryUser.name}
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(discoveryUser.name || '?')}&background=8b5cf6&color=fff&size=40`;
                          }}
                        />
                        <div className="flex-grow-1 min-w-0">
                          <h6 className="mb-0 fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>
                            {discoveryUser.name}
                          </h6>
                          <div className="d-flex gap-2">
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {discoveryUser.followers || 0} followers
                            </small>
                          </div>
                        </div>
                        {user ? (
                          <button
                            className={`btn btn-sm px-2 py-1 ${
                              followStatus === 'following'
                                ? 'btn-outline-secondary'
                                : followStatus === 'pending'
                                ? 'btn-secondary'
                                : 'btn-primary'
                            }`}
                            style={{ fontSize: '0.7rem', borderRadius: '15px' }}
                            disabled={followStatus === 'pending'}
                            onClick={() => sendFollowRequest(discoveryUser._id)}
                          >
                            {followStatus === 'following' ? 'Following' : followStatus === 'pending' ? 'Pending' : 'Follow'}
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm px-2 py-1"
                            style={{ fontSize: '0.7rem', borderRadius: '15px' }}
                            onClick={() => navigate('/register')}
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-people fs-1 mb-2"></i>
                  <p className="mb-0">No users to discover</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bootstrap JS */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </>
  );
};

export default Dashboard;