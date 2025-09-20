// src/components/CommentSection.jsx
import React from 'react';

const CommentSection = ({
  post,
  user,
  commentText,
  onCommentChange,
  onAddComment,
  isSubmittingComment,
  formatDate
}) => {
  // Use Vite environment variable syntax
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  // Safe helper to get profile initials
  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  return (
    <>
      {post.comments && post.comments.length > 0 && (
        <div className="mb-3">
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {post.comments.map((comment, index) => (
              <div key={index} className="d-flex mb-2">
                <img
                  src={comment.author?.profilePicture
                    ? `${API_BASE_URL}${comment.author.profilePicture}`
                    : `https://via.placeholder.com/24x24/667eea/white?text=${getInitials(comment.author?.name)}`}
                  alt={comment.author?.name || 'Anonymous'}
                  className="rounded-circle me-2"
                  style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <small className="fw-bold text-dark">
                    {comment.author?.name || 'Anonymous'}
                  </small>
                  <p className="mb-0 mt-1" style={{ fontSize: '0.85rem', color: '#555' }}>
                    {comment.text}
                  </p>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {formatDate(comment.createdAt)}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment Input */}
      <div className="d-flex gap-2 align-items-center">
        <img
          src={user?.profilePicture
            ? `${API_BASE_URL}${user.profilePicture}`
            : `https://via.placeholder.com/24x24/667eea/white?text=${getInitials(user?.name)}`}
          alt="Your profile"
          className="rounded-circle"
          style={{ width: '24px', height: '24px', objectFit: 'cover' }}
        />
        <input
          type="text"
          className="form-control border-0 shadow-sm"
          placeholder="Add a comment..."
          value={commentText}
          onChange={onCommentChange}
          onKeyPress={(e) => e.key === 'Enter' && !isSubmittingComment && onAddComment()}
          disabled={isSubmittingComment}
          style={{ fontSize: '0.9rem', padding: '6px 12px' }}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={onAddComment}
          disabled={!commentText.trim() || isSubmittingComment}
          style={{ fontSize: '0.85rem', padding: '4px 12px' }}
        >
          {isSubmittingComment ? 'Posting...' : 'Post'}
        </button>
      </div>
    </>
  );
};

export default CommentSection;
