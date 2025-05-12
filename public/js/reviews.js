document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const body = Object.fromEntries(new FormData(form));
    body.rating = Number(body.rating);

    const spotId = location.pathname.split('/').pop();
    const res = await fetch(`/reviews/${spotId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      location.reload();
    } else {
      const err = await res.json();
      alert(err.error || 'Error posting review');
    }
  });
    const ratingSlider  = document.getElementById('rating');

    const ratingDisplay = document.getElementById('ratingDisplay');
    
    if (ratingSlider && ratingDisplay) {
        ratingDisplay.textContent = ratingSlider.value;
        ratingSlider.addEventListener('input', () => {
        ratingDisplay.textContent = ratingSlider.value;
        });
    }
});
