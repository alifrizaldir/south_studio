import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast-msg show" id="toastMessage">
      <span id="toastText">{message}</span>
    </div>
  );
}
