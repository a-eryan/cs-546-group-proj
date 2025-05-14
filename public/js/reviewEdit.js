console.log('Review edit form script loaded!');
document.addEventListener('DOMContentLoaded', () => {
  const editForm = document.getElementById('editReviewForm');
  if (editForm) {
    // Regular form submission with validation
    editForm.addEventListener('submit', e => {
      const title = document.getElementById('title').value.trim();
      const content = document.getElementById('content').value.trim();
      
      if (!title || title.length < 6 || title.length > 100) {
          e.preventDefault();
          alert('The title must be between 6 and 100 characters long');
          return;
      }
      
      if (!content || content.length < 1) {
          e.preventDefault();
          alert('You must provide a non-empty string');
          return;
      }

    });
  }

  const ratingSlider = document.getElementById('rating');
  const ratingDisplay = document.getElementById('ratingDisplay');
    
  if (ratingSlider && ratingDisplay) {
    ratingDisplay.textContent = ratingSlider.value;
    ratingSlider.addEventListener('input', () => {
      ratingDisplay.textContent = ratingSlider.value;
    });
  }
});