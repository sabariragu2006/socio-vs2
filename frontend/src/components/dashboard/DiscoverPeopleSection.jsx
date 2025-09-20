
// src/components/DiscoverPeopleSection.jsx
import React from 'react';

const DiscoverPeopleSection = ({ 
  currentUser, 
  allUsers, 
  stories, 
  openStoryModal, 
  addStory 
}) => {

  // Use Vite environment variable syntax
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  // Debug logs (remove in production)
  console.log('📚 StoriesFeed | stories:', stories);
  console.log('👥 Users:', allUsers);

  // Filter users who have active stories (for Stories row)
  const usersWithStories = allUsers.filter(user => 
    stories?.some(s => s.author?._id === user._id)
  );

  // Check if current user has any stories
  const hasYourStories = stories?.some(s => s.author?._id === currentUser._id);

  // Filter all OTHER users (exclude current user) for Discover section
  const otherUsers = allUsers.filter(user => user._id !== currentUser._id);

  // Helper to get follow status for a user
  const getFollowStatus = (user) => {
    if (!user || !currentUser) return 'none';
    
    // Already following?
    if (Array.isArray(currentUser.following) && currentUser.following.includes(user._id)) {
      return 'following';
    }

    // Pending request? (Assuming backend sets `followStatus` on target user)
    if (user.followStatus === 'pending') {
      return 'pending';
    }

    return 'none';
  };

  // Function to send follow request
  const handleFollow = async (targetUserId, targetName) => {
    if (targetUserId === currentUser._id) return; // Prevent self-follow

    try {
      const res = await fetch(`${API_BASE_URL}/send-follow-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fromUserId: currentUser._id,
          toUserId: targetUserId
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Trigger refresh of user list to update followStatus
        window.dispatchEvent(new Event('followRequestSent'));
      } else {
        alert(data.message || 'Failed to send follow request');
      }
    } catch (err) {
      console.error('Error sending follow request:', err);
      alert('Failed to send follow request');
    }
  };

  return (
    <div className="row mb-3">
      <div className="col-12">
        
        {/* STORIES SECTION — MINIMALIST & TIGHT */}
        <div className="card shadow-lg border-0" style={{ 
          borderRadius: '12px', 
          overflow: 'hidden',
          marginBottom: '8px'
        }}>
          
          {/* Header - Reduced Padding */}
          <div className="card-header border-0 bg-white py-1 px-3" style={{ 
            borderRadius: '12px 12px 0 0',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <h6 className="mb-0 fw-bold d-flex align-items-center" style={{ 
              fontSize: '0.9rem', 
              color: '#1f2937', 
              fontWeight: '600',
              lineHeight: 1.2
            }}>
              <i className="bi bi-camera me-1"></i>
              Stories
            </h6>
          </div>

          {/* Horizontal Scrollable Stories Row — TIGHTER */}
          <div 
            className="card-body p-1"
            style={{ 
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              display: 'flex',
              gap: '4px', // Reduced from 8px
              alignItems: 'center',
              padding: '2px 0' // Very minimal vertical padding
            }}
          >
            
            {/* YOUR STORY CIRCLE — DUAL CLICK BEHAVIOR */}
            <div 
              className="text-center cursor-pointer flex-shrink-0 position-relative"
              style={{ minWidth: '60px', maxWidth: '60px' }}
            >
              {/* Main Circle */}
              <div
                className="position-relative rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '52px',
                  height: '52px',
                  background: hasYourStories 
                    ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                    : currentUser.profilePicture ? 'transparent' : '#f0f0f0',
                  padding: hasYourStories ? '2px' : '0',
                  transition: 'transform 0.2s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
                onClick={() => {
                  if (hasYourStories) {
                    openStoryModal(currentUser); // View your own story
                  } else {
                    addStory(); // Add a new story
                  }
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: hasYourStories ? '46px' : '52px',
                    height: hasYourStories ? '46px' : '52px',
                    backgroundColor: 'white',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    borderRadius: '50%'
                  }}
                >
                  {currentUser.profilePicture ? (
                    <img
                      src={`${API_BASE_URL}${currentUser.profilePicture}`}
                      alt={currentUser.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  ) : (
                    <span 
                      className="fw-bold text-secondary" 
                      style={{ fontSize: '1.3rem' }}
                    >
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* GREEN DOT (Story Indicator) — Click to ADD STORY */}
              {hasYourStories && (
                <div
                  className="position-absolute rounded-circle bg-success border border-white d-flex align-items-center justify-content-center"
                  style={{
                    width: '10px',
                    height: '10px',
                    bottom: '0px',
                    right: '0px',
                    zIndex: 3,
                    boxShadow: '0 0 0 1px white',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addStory();
                  }}
                ></div>
              )}

              {/* + ICON FOR ADD STORY - Only show when NO story */}
              {!hasYourStories && (
                <div
                  className="position-absolute rounded-circle bg-primary border border-white d-flex align-items-center justify-content-center"
                  style={{
                    width: '18px',
                    height: '18px',
                    bottom: '0px',
                    right: '0px',
                    zIndex: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    fontSize: '10px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addStory();
                  }}
                >
                  <i className="bi bi-plus-lg"></i>
                </div>
              )}

              {/* Label Below — Smaller font, tighter */}
              <div className="mt-1" style={{ 
                fontSize: '0.6rem', 
                color: '#6c757d', 
                fontWeight: '500',
                lineHeight: 1.1,
                letterSpacing: '-0.02em'
              }}>
                {hasYourStories ? 'Your Story' : 'Add Story'}
              </div>
            </div>

            {/* OTHER USERS' STORIES — TIGHTENED */}
            {usersWithStories.map((user) => {
              const hasStory = stories?.some(s => s.author?._id === user._id);

              return (
                <div
                  key={user._id}
                  className="text-center cursor-pointer flex-shrink-0"
                  style={{ minWidth: '60px', maxWidth: '60px' }}
                >
                  {/* Main Circle */}
                  <div
                    className="position-relative rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '52px',
                      height: '52px',
                      background: hasStory 
                        ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                        : user.profilePicture ? 'transparent' : '#f0f0f0',
                      padding: hasStory ? '2px' : '0',
                      transition: 'transform 0.2s ease',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (hasStory) e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (hasStory) e.target.style.transform = 'scale(1)';
                    }}
                    onClick={() => {
                      if (hasStory) {
                        openStoryModal(user);
                      } else {
                        addStory();
                      }
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: hasStory ? '46px' : '52px',
                        height: hasStory ? '46px' : '52px',
                        backgroundColor: 'white',
                        overflow: 'hidden',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        borderRadius: '50%'
                      }}
                    >
                      {user.profilePicture ? (
                        <img
                          src={`${API_BASE_URL}${user.profilePicture}`}
                          alt={user.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                        />
                      ) : (
                        <span 
                          className="fw-bold text-secondary" 
                          style={{ fontSize: '1.3rem' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* GREEN DOT — Click to ADD STORY */}
                  {hasStory && (
                    <div
                      className="position-absolute rounded-circle bg-success border border-white d-flex align-items-center justify-content-center"
                      style={{
                        width: '10px',
                        height: '10px',
                        bottom: '0px',
                        right: '0px',
                        zIndex: 3,
                        boxShadow: '0 0 0 1px white',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addStory();
                      }}
                    ></div>
                  )}

                  {/* Label Below — Truncated name, smaller */}
                  <div className="mt-1" style={{ 
                    fontSize: '0.6rem', 
                    color: '#6c757d', 
                    fontWeight: '500',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.name.length > 8 
                      ? user.name.substring(0, 8) + '…' 
                      : user.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPeopleSection;