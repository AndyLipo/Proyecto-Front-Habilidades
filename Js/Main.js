async function fetchReviews() {
    const response = await fetch('https://jsonplaceholder.typicode.com/comments');
    const data = await response.json();

    // Seleccionar el contenedor de reseñas
    const reviewsContainer = document.getElementById('reviews');

    // Mostrar solo las primeras 10 reseñas
    data.slice(0, 10).forEach(review => {
        const reviewCard = `
            <div class="review-card">
                <div class="review-title">${review.name}</div>
                <div class="review-email">${review.email}</div>
                <div class="review-body">${review.body}</div>
            </div>
        `;
        reviewsContainer.innerHTML += reviewCard;
    });
}

// Cargar las reseñas al cargar la página
fetchReviews();