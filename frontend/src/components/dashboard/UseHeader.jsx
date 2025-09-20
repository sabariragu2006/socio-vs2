// src/components/dashboard/UserHeader.jsx
import React from 'react';

const UserHeader = ({ 
  user, 
  notifications, 
  followRequests,
  onProfileClick,
  onUploadClick,
  onMessagesClick,
  stories,
  storiesLoading,
  allUsers,
  openStoryModal,
  handleStoryUpload
}) => {
  // Safe fallback if user is not loaded yet
  const safeUser = user || {
    profilePicture: '',
    name: '',
    email: ''
  };

  // Helper to safely get first letter (fallback to '?' if empty)
  const getInitials = (name) => (name && name.trim() !== '' ? name.charAt(0).toUpperCase() : '?');

  // Use Vite environment variable syntax
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return (
    <>
      {/* Stories Row */}
      <div className="mb-4">
        <div className="d-flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Plus Button for Current User's Story */}
          <div 
            className="position-relative d-flex flex-column align-items-center cursor-pointer"
            onClick={() => document.getElementById('story-upload-input')?.click()}
            style={{ width: '60px', height: '60px', minWidth: '60px', cursor: 'pointer' }}
          >
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
              style={{
                width: '60px',
                height: '60px',
                minWidth: '60px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              +
            </div>
            <span className="text-white small mt-1">Add Story</span>
          </div>

          {/* Other Users' Stories */}
          {storiesLoading ? (
            <div className="d-flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="position-relative d-flex flex-column align-items-center">
                  <div 
                    className="rounded-circle bg-light animate-pulse"
                    style={{ width: '60px', height: '60px', minWidth: '60px' }}
                  ></div>
                  <span className="text-muted small mt-1">...</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              {allUsers.map((otherUser) => {
                const userStories = stories.filter(s => s.userId === otherUser._id);
                if (userStories.length === 0) return null;

                return (
                  <div 
                    key={otherUser._id}
                    className="position-relative d-flex flex-column align-items-center cursor-pointer"
                    onClick={() => openStoryModal(otherUser)}
                    style={{ width: '60px', height: '60px', minWidth: '60px', cursor: 'pointer' }}
                  >
                    <div 
                      className="rounded-circle position-relative overflow-hidden"
                      style={{
                        width: '60px',
                        height: '60px',
                        minWidth: '60px',
                        background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                        padding: '3px',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      <div 
                        className="w-100 h-100 rounded-circle overflow-hidden"
                        style={{ border: '2px solid white' }}
                      >
                        <img
                          src={otherUser.profilePicture 
                            ? `${API_BASE_URL}${otherUser.profilePicture}` 
                            : `https://via.placeholder.com/60x60/667eea/white?text=${getInitials(otherUser.name)}`}
                          alt={otherUser.name || 'Unknown'}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/60x60/667eea/white?text=${getInitials(otherUser.name)}`;
                          }}
                        />
                      </div>
                    </div>
                    <span 
                      className="text-white small mt-1 text-truncate"
                      style={{ maxWidth: '60px', textAlign: 'center', fontSize: '0.7rem' }}
                      title={otherUser.name || 'Unknown'}
                    >
                      {otherUser.name 
                        ? otherUser.name.length > 8 
                          ? otherUser.name.substring(0, 8) + '...' 
                          : otherUser.name 
                        : 'Unknown'}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white fw-bold mb-0">Dashboard</h2>
        <div className="d-flex align-items-center gap-3">
          
          {/* PROFILE BUTTON */}
          <button 
            className="btn btn-light rounded-pill position-relative"
            onClick={onProfileClick}
            style={{ fontSize: '0.9rem' }}
          >
            <img
              src={safeUser.profilePicture 
                ? `${API_BASE_URL}${safeUser.profilePicture}` 
                : `https://via.placeholder.com/30x30/667eea/white?text=${getInitials(safeUser.name)}`}
              alt="Profile"
              className="rounded-circle me-2"
              style={{ width: '30px', height: '30px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/30x30/667eea/white?text=${getInitials(safeUser.name)}`;
              }}
            />
            Profile
            {(notifications.length > 0 || followRequests.length > 0) && (
              <span 
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                style={{ fontSize: '0.6rem' }}
              >
                {notifications.length + followRequests.length}
              </span>
            )}
          </button>

          {/* UPLOAD BUTTON */}
          <button 
            onClick={onUploadClick} 
            className="btn btn-light rounded-pill"
            style={{ fontSize: '0.9rem' }}
          >
            <i className="bi bi-upload me-2"></i>
            Upload Posts
          </button>

          {/* MESSAGES BUTTON */}
          <button 
            className="btn btn-light rounded-pill"
            onClick={onMessagesClick}
            style={{ fontSize: '0.9rem' }}
          >
            <i className="bi bi-chat-dots me-2"></i>
            Messages
          </button>
        </div>
      </div>
    </>
  );
};

export default UserHeader;