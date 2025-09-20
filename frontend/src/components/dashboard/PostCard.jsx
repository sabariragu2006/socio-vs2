// src/components/PostCard.jsx
import React from 'react';
import ReactionButtons from './ReactionButtons';

const PostCard = ({ 
  post, 
  user,
  commentTexts,
  submittingComment,
  showComments,
  toggleComments,
  handleAddComment,
  handleReaction,
  formatDate,
  setCommentTexts,
  setSubmittingComment,
  setShowComments,
  fetchUserData
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  // ✅ Local SVG placeholder for images (no external requests)
  const imagePlaceholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='500' viewBox='0 0 600 500'%3E%3Crect width='100%25' height='100%25' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%23666'%3EImage Not Available%3C/text%3E%3C/svg%3E`;

  // ✅ Local SVG placeholder for videos
  const videoPlaceholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='500' viewBox='0 0 600 500'%3E%3Crect width='100%25' height='100%25' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%23666'%3EVideo Not Available%3C/text%3E%3C/svg%3E`;

  // ✅ Avatar placeholder generator (SVG with dynamic text)
  const getAvatarPlaceholder = (initial = 'U') => 
    `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23667eea'/%3E%3Ctext x='100' y='115' font-size='80' text-anchor='middle' fill='%23ffffff' font-family='sans-serif'%3E${encodeURIComponent(initial)}%3C/text%3E%3C/svg%3E`;

  return (
    <div key={post._id} className="mb-4 px-3 px-md-4 px-lg-5">
      <div className="card border-0 shadow-sm rounded-4">
        {/* Header */}
        <div className="card-header border-0 bg-white rounded-4 rounded-bottom-0">
          <div className="d-flex align-items-center">
            <img
              src={post.author?.profilePicture 
                ? `${API_BASE_URL}${post.author.profilePicture}` 
                : getAvatarPlaceholder(getInitials(post.author?.name))}
              alt={post.author?.name || 'Unknown User'}
              className="rounded-circle me-3"
              style={{ width: '36px', height: '36px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = getAvatarPlaceholder(getInitials(post.author?.name));
              }}
            />
            <div className="flex-grow-1">
              <h6 className="mb-0 fw-semibold text-dark small">{post.author?.name || 'Unknown User'}</h6>
              <small className="text-muted">{formatDate(post.createdAt)}</small>
            </div>
            {post.author?._id === user?._id && (
              <span className="badge bg-primary rounded-pill px-2 py-1 small">You</span>
            )}
          </div>
        </div>

        {/* Image/Video Content */}
        {post.image && (
          <div className="position-relative overflow-hidden">
            {post.image.includes('.mp4') || post.image.includes('.mov') || post.image.includes('.avi') ? (
              <video 
                controls 
                className="w-100" 
                style={{ maxHeight: '500px', objectFit: 'cover', borderRadius: '0 0 20px 20px' }}
                src={`${API_BASE_URL}${post.image}`}
                onError={(e) => {
                  e.target.src = videoPlaceholder;
                }}
              />
            ) : (
              <img 
                src={`${API_BASE_URL}${post.image}`} 
                alt="Post content" 
                className="w-100"
                style={{ maxHeight: '500px', objectFit: 'cover', borderRadius: '0 0 20px 20px' }}
                onError={(e) => {
                  e.target.src = imagePlaceholder;
                }}
              />
            )}
          </div>
        )}

        {/* Text Content */}
        <div className="card-body p-4">
          <p className="mb-4 text-secondary lh-base" style={{ fontSize: '0.95rem' }}>
            {post.text}
          </p>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              onClick={() => toggleComments(post._id)}
            >
              <i className="bi bi-chat-dots me-1"></i>
              {post.commentCount || 0}
              <i className={`bi bi-chevron-${showComments[post._id] ? 'up' : 'down'} ms-1`}></i>
            </button>

            <ReactionButtons 
              post={post} 
              user={user} 
              handleReaction={handleReaction} 
            />
          </div>

          {showComments[post._id] && (
            <>
              {post.comments && post.comments.length > 0 && (
                <div className="mb-4">
                  <div 
                    style={{ maxHeight: '250px', overflowY: 'auto' }} 
                    className="pe-2"
                  >
                    {post.comments.map((comment, index) => (
                      <div key={index} className="d-flex mb-3">
                        <img
                          src={comment.author?.profilePicture 
                            ? `${API_BASE_URL}${comment.author.profilePicture}` 
                            : getAvatarPlaceholder(getInitials(comment.author?.name))}
                          alt={comment.author?.name || 'Anonymous'}
                          className="rounded-circle me-3"
                          style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = getAvatarPlaceholder(getInitials(comment.author?.name));
                          }}
                        />
                        <div className="flex-grow-1">
                          <div className="bg-light rounded-3 p-3" style={{ fontSize: '0.85rem' }}>
                            <div className="d-flex align-items-center mb-1">
                              <strong className="text-dark mb-0">{comment.author?.name || 'Anonymous'}</strong>
                              {comment.author?._id === user?._id && (
                                <span className="badge bg-primary ms-2 px-2 py-1" style={{ fontSize: '0.65rem' }}>You</span>
                              )}
                            </div>
                            <p className="mb-0 text-secondary">{comment.text}</p>
                          </div>
                          <small className="text-muted d-block mt-1 ms-3">{formatDate(comment.createdAt)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex gap-3 align-items-center">
                <img
                  src={user?.profilePicture 
                    ? `${API_BASE_URL}${user.profilePicture}` 
                    : getAvatarPlaceholder(getInitials(user?.name))}
                  alt="Your profile"
                  className="rounded-circle"
                  style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = getAvatarPlaceholder(getInitials(user?.name));
                  }}
                />
                <div className="flex-grow-1">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-pill"
                      placeholder="Write a comment..."
                      value={commentTexts[post._id] || ''}
                      onChange={(e) => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !submittingComment[post._id]) {
                          handleAddComment(post._id);
                        }
                      }}
                      disabled={submittingComment[post._id]}
                    />
                    <button
                      className="btn btn-primary btn-sm rounded-pill px-4"
                      onClick={() => handleAddComment(post._id)}
                      disabled={submittingComment[post._id] || !commentTexts[post._id]?.trim()}
                    >
                      {submittingComment[post._id] ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <i className="bi bi-send"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;