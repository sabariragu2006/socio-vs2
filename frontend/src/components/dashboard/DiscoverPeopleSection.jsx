// src/components/dashboard/DiscoverPeopleSection.jsx
import React from 'react';

const DiscoverPeopleSection = ({ 
  currentUser, 
  allUsers, 
  stories, 
  openStoryModal, 
  addStory 
}) => {
  // Get API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Safe filtering - handle null currentUser
  const otherUsers = allUsers.filter(user => {
    if (!user || !user._id) return false;
    if (!currentUser) return true; // Show all users if no current user
    return user._id !== currentUser._id;
  });

  // Group stories by user - only include stories with valid authors
  const storiesByUser = stories.filter(story => story && story.author && story.author._id).reduce((acc, story) => {
    const userId = story.author._id;
    if (!acc[userId]) {
      acc[userId] = {
        user: story.author,
        stories: []
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {});

  // Get users who have stories
  const usersWithStories = Object.values(storiesByUser);

  return (
    <div className="stories-section">
      <div className="stories-container" style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '16px 20px',
        gap: '16px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitScrollbar: { display: 'none' }
      }}>
        {/* Add Your Story - Only show if user is authenticated */}
        {currentUser && (
          <div className="story-item" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '80px',
            cursor: 'pointer'
          }} onClick={addStory}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              position: 'relative',
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <i className="bi bi-plus-lg text-white fs-4"></i>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#374151',
              textAlign: 'center',
              lineHeight: 1.2
            }}>Add Story</span>
          </div>
        )}

        {/* Stories from users */}
        {usersWithStories.map(({ user, stories: userStories }) => (
          <div 
            key={user._id} 
            className="story-item" 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '80px',
              cursor: 'pointer'
            }}
            onClick={() => openStoryModal(user)}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #f97316, #ec4899)',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <img
                src={user.profilePicture 
                  ? `${API_BASE_URL}${user.profilePicture}` 
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '?')}&background=8b5cf6&color=fff&size=64`}
                alt={user.name || 'User'}
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid white'
                }}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '?')}&background=8b5cf6&color=fff&size=64`;
                }}
              />
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#374151',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user.name || 'Unknown'}
            </span>
          </div>
        ))}

        {/* Show message if no stories */}
        {usersWithStories.length === 0 && !currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '200px',
            padding: '20px',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            <i className="bi bi-camera me-2"></i>
            No stories available
          </div>
        )}

        {/* Prompt to join for non-authenticated users */}
        {!currentUser && usersWithStories.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '200px',
            padding: '20px',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #e6e8ff 100%)',
            borderRadius: '16px',
            border: '1px solid #e0e2ff'
          }}>
            <i className="bi bi-camera fs-2 text-primary mb-2"></i>
            <p className="text-center mb-2 fw-semibold" style={{ fontSize: '0.875rem' }}>
              Share Your Story
            </p>
            <p className="text-muted text-center mb-0" style={{ fontSize: '0.75rem' }}>
              Join to share moments with friends
            </p>
          </div>
        )}
      </div>

      {/* Horizontal scrollbar styling */}
      <style >{`
        .stories-container::-webkit-scrollbar {
          display: none;
        }
        .stories-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DiscoverPeopleSection;