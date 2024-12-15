// async function fetchReviews() {
//     const response = await fetch('https://jsonplaceholder.typicode.com/comments');
//     const data = await response.json();

//     // Seleccionar el contenedor de reseñas
//     const reviewsContainer = document.getElementById('reviews');

//     // Mostrar solo las primeras 10 reseñas
//     data.slice(0, 9).forEach(review => {
//         const reviewCard = `
//             <div class="review-card">
//                 <div class="review-title">${review.name}</div>
//                 <div class="review-email">${review.email}</div>
//                 <div class="review-body">${review.body}</div>
//             </div>
//         `;
//         reviewsContainer.innerHTML += reviewCard;
//     });
// }

// // Cargar las reseñas al cargar la página
// fetchReviews();
async function fetchReviews() {
    // Obtener comentarios
    const commentsResponse = await fetch('https://jsonplaceholder.typicode.com/comments');
    const comments = await commentsResponse.json();

    // Obtener fotos de usuarios
    const usersResponse = await fetch('https://randomuser.me/api/?results=9');
    const users = await usersResponse.json();

    // Seleccionar el contenedor de reseñas
    const reviewsContainer = document.getElementById('reviews');

    // Mostrar solo las primeras 9 reseñas
    comments.slice(0, 9).forEach((review, index) => {
        const user = users.results[index];
        const reviewCard = `
            <div class="review-card">
                <div class="review-header">
                    <img src="${user.picture.medium}" alt="${user.name.first} ${user.name.last}" class="review-avatar">
                    <div class="review-user-info">
                        <div class="review-title">${user.name.first} ${user.name.last}</div>
                        <div class="review-email">${review.email}</div>
                    </div>
                </div>
                <div class="review-body">${review.body}</div>
            </div>
        `;
        reviewsContainer.innerHTML += reviewCard;
    });
}

// Cargar las reseñas al cargar la página
fetchReviews();