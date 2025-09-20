// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeedSection from './dashboard/FeedSection';
import ProfileModal from './dashboard/ProfileModal';
import Messages from './Messages/Messages';
import StoryModal from './Messages/StoryModal';
import DiscoverPeopleSection from './dashboard/DiscoverPeopleSection';
import './dashboard.css'

const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
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
  // ✅ Use environment variable for API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  // ✅ Safe helper to get first letter of name (fallback to '?' if empty)
  const getInitials = (name) => (name && name.trim() !== '' ? name.charAt(0).toUpperCase() : '?');
  // Initialize user data and bio
  useEffect(() => {
    fetchUserData();
  }, []);
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      fetchAllUsers();
      fetchFollowRequests();
      fetchNotifications();
      fetchPosts();
      fetchStories();
    }
  }, [user]);
  // --- FETCHING DATA ---
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("No user found. Please login again.");
        setLoading(false);
        return;
      }
      const userData = JSON.parse(storedUser);
      const response = await fetch(`${API_BASE_URL}/users/${userData._id}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };
  const fetchStories = async () => {
    if (!user) return;
    try {
      setStoriesLoading(true);
      const response = await fetch(`${API_BASE_URL}/stories/${user._id}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      setStories(data.stories || []);
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setStoriesLoading(false);
    }
  };
  const fetchAllUsers = async () => {
    if (!user) return;
    try {
      setUsersLoading(true);
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/users?excludeId=${user._id}&t=${timestamp}`, {
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
  const fetchPosts = async () => {
    if (!user) return;
    try {
      setPostsLoading(true);
      const response = await fetch(`${API_BASE_URL}/posts/following/${user._id}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };
  // --- STORY HANDLERS ---
  const handleStoryUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
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
      fetchStories();
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
    } else {
      console.warn(`No stories found for user: ${storyUser.name} (${storyUser._id})`);
    }
  };
  const closeStoryModal = () => {
    setShowStoryModal(false);
    setCurrentStoryUser(null);
    setCurrentStoryIndex(0);
  };
  // --- FOLLOW HANDLERS ---
  const sendFollowRequest = async (targetUserId) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/send-follow-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/handle-follow-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          requestId,
          action
        })
      });
      if (response.ok) {
        fetchFollowRequests();
        fetchNotifications();
        fetchUserData(); // Refreshes following/followers count
        if (action === 'accept') {
          fetchPosts();
          fetchAllUsers(); // IMMEDIATELY refresh all users
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
  // --- COMMENT HANDLERS ---
  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  const handleAddComment = async (postId) => {
    const commentText = commentTexts[postId];
    if (!commentText || !commentText.trim() || !user) return;
    try {
      setSubmittingComment(prev => ({ ...prev, [postId]: true }));
      const response = await fetch(`${API_BASE_URL}/add-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
  // --- PROFILE HANDLERS ---
  const handleUpdateBio = async () => {
    if (!user) return;
    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/update-bio/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ bio: bio.trim() })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update bio');
      }
      const data = await response.json();
      const updatedUser = { ...user, bio: data.bio };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error updating bio:', err);
      alert(err.message || 'Failed to update bio');
    } finally {
      setUpdating(false);
    }
  };
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
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
      const data = await response.json();
      const updatedUser = { ...user, profilePicture: data.profilePicture };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      alert('Failed to update profile picture');
    } finally {
      setUploadingProfile(false);
    }
  };
  // --- UTILITIES ---
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };
  const userPostCount = posts.filter(post => post.author._id === user?._id).length;
  // --- RENDERING ---
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
            <p className="loading-text">Welcome back! Loading your social universe...</p>
          </div>
        </div>
  
      </>
    );
  }
  return (
    <>
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
                  onClick={() => navigate('/uploads')}
                  title="Create Post"
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
                <button 
                  className="nav-btn position-relative"
                  onClick={() => setShowMessagesModal(true)}
                  title="Messages"
                >
                  <i className="bi bi-chat-dots"></i>
                </button>
                {/* NEW: Discover Button for Mobile */}
                <button 
                  className="nav-btn d-md-none" // Only visible on small screens
                  onClick={() => setShowDiscoverModal(true)}
                  title="Discover People"
                >
                  <i className="bi bi-people"></i>
                </button>
               
                <div 
                  className="nav-profile"
                  onClick={() => setShowProfileModal(true)}
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
              </div>
            </div>
          </div>
        </nav>
        <div className="dashboard-content">
          <div className="container-fluid" style={{ paddingLeft: 0, paddingRight: 0 }}>
            {/* MAIN CONTENT ROW - Left Profile (25%) + Right Content Area (75%) */}
            <div className="row g-0">
              {/* LEFT COLUMN - 25% Width - Profile Picture, Details, Stats */}
              <div className="col-md-3 col-lg-3">
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
                  {/* PROFILE AVATAR */}
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
                  {/* USER DETAILS: NAME + BIO */}
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
                  {/* STATS SECTION - Stacked Vertically */}
                  <div className="d-flex flex-column gap-2 w-100 px-3">
                    {/* Posts */}
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
                        border: '1px solid #e0e0ff',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <strong>{userPostCount}</strong>
                      <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>Posts</div>
                    </div>
                    {/* Followers */}
                    <div className="stat-item text-center cursor-pointer" 
                      onClick={() => setShowFollowersModal(true)}
                      style={{
                        background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)',
                        color: '#059669',
                        padding: '10px 12px',
                        borderRadius: '1.5rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        transition: 'all 0.25s ease',
                        border: '1px solid #d1fae5',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <strong>{Array.isArray(user.followers) ? user.followers.length : 0}</strong>
                      <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>Followers</div>
                    </div>
                    {/* Following */}
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
                        border: '1px solid #fee2e2',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <strong>{Array.isArray(user.following) ? user.following.length : 0}</strong>
                      <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>Following</div>
                    </div>
                    {/* Follow Requests Badge (if any) */}
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
                          transition: 'all 0.25s ease',
                          border: '1px solid #fed7aa',
                          textAlign: 'center',
                          marginTop: '4px'
                        }}
                      >
                        <strong>{followRequests.length}</strong>
                        <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>Requests</div>
                      </div>
                    )}
                  </div>
                </div>
                {/* WRAPPED Discover People Section - ONLY on Medium+ Screens */}
                <div className="d-none d-md-block">
                  <div className="discover-card bg-white rounded-4 shadow-sm border mt-3" style={{ 
                    maxHeight: 'calc(100vh - 160px)', 
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#8b5cf6 #f1f1f1'
                  }}>
                    {/* Discover People Section - Now directly below the stats bar */}
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
  {allUsers.filter(u => u._id !== user._id).map((discoveryUser) => {
    const followStatus = Array.isArray(user.following) && user.following.includes(discoveryUser._id) 
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
        </div>
      </div>
    );
  })}
  {allUsers.filter(u => u._id !== user._id).length === 0 && (
    <div className="p-4 text-center text-muted">
      <i className="bi bi-people fs-1 mb-2"></i>
      <p className="mb-0">No users to discover</p>
    </div>
  )}
</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* RIGHT COLUMN - 75% Width - Contains Stories & Feed */}
              <div className="col-md-9 col-lg-9">
                <div className="d-flex flex-column h-100" style={{ gap: '0' }}>
                  {/* STORIES SECTION - FLUSH WITH LAYOUT, NO OUTER CARD */}
                  <div className="mb-3">
                    <h6 className="section-title mb-2 d-flex align-items-center" style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: '600', 
                      color: '#1f2937', 
                      margin: '0 0 8px 0',
                      paddingLeft: '1rem'
                    }}>
                    </h6>
                    <DiscoverPeopleSection 
                      currentUser={user}
                      allUsers={allUsers}
                      stories={stories}
                      openStoryModal={openStoryModal}
                      addStory={() => document.getElementById('story-upload-input')?.click()}
                    />
                  </div>
                  {/* FEED SECTION - Scrollable */}
                  <div 
                    className="feed-scroll-container" 
                    style={{ 
                      flexGrow: 1,
                      maxHeight: 'calc(100vh - 220px)',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      paddingRight: '8px',
                    }}
                  >
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
                      fetchPosts={fetchPosts}
                      setCommentTexts={setCommentTexts}
                      setSubmittingComment={setSubmittingComment}
                      setShowComments={setShowComments}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Hidden file input for story upload */}
        <input 
          id="story-upload-input"
          type="file" 
          accept="image/*,video/*" 
          onChange={handleStoryUpload}
          style={{ display: 'none' }}
        />
      </div>
      {/* Modals */}
      {showStoryModal && (
        <StoryModal 
          show={showStoryModal}
          onClose={closeStoryModal}
          currentStoryUser={currentStoryUser}
          currentStoryIndex={currentStoryIndex}
          setCurrentStoryIndex={setCurrentStoryIndex}
          stories={stories}
        />
      )}
      {showProfileModal && (
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
      {showMessagesModal && (
        <Messages 
          user={user} 
          onClose={() => setShowMessagesModal(false)} 
        />
      )}
      {/* MODALS FOR FOLLOWERS & FOLLOWING LIST — SIMPLE OVERLAY */}
      {showFollowersModal && (
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
            }
          }
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
      {showFollowingModal && (
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
      {/* MODAL for Discover People - ONLY on Small Screens */}
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
      className="modal-content" // 👈 Hides scrollbar
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
        {allUsers.filter(u => u._id !== user._id).length > 0 ? (
          allUsers.filter(u => u._id !== user._id).map((discoveryUser) => {
            const followStatus = Array.isArray(user.following) && user.following.includes(discoveryUser._id) 
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