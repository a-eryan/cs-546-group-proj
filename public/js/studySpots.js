//study spot card
document.addEventListener('DOMContentLoaded', () => {
    const deleteForms = document.querySelectorAll('.delete-form');
    deleteForms.forEach(form => {
        form.addEventListener('submit', e => {
            if (!confirm('Are you sure you want to delete this study spot?')) {
                e.preventDefault();
            }
        });
    });

    const spotCommentForm = document.getElementById('spotCommentForm');
    if (spotCommentForm) {
        spotCommentForm.addEventListener('submit', async e => {
            e.preventDefault();
            const body = Object.fromEntries(new FormData(spotCommentForm));
            const spotId = location.pathname.split('/').pop();
            const res = await fetch(`/comments/${spotId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                location.reload();
            } else {
                let msg = 'Error posting comment';
                try {
                    const err = await res.json();
                    if (typeof err === 'string'){
                        msg = err;
                    }
                    else if (err.error) {
                        msg = String(err.error);
                    }
                    else{
                        msg = JSON.stringify(err);
                    }
                } catch {}
                alert(msg);
            }
        });
    }

    document.querySelectorAll('.review-comment-form').forEach(form => {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const body = Object.fromEntries(new FormData(form));
            const reviewId = form.dataset.reviewId;
						console.log(reviewId);
            const res = await fetch(`/reviews/comments/${reviewId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                location.reload();
            } else {
                let msg = 'Error posting comment';
                try {
                    const err = await res.json();
                    if (typeof err === 'string'){
                        msg = err;
                    }
                    else if (err.error) {
                        msg = String(err.error);
                    }
                    else{
                        msg = JSON.stringify(err);
                    }
                } catch {}
                alert(msg);
            }
        });
    });
});