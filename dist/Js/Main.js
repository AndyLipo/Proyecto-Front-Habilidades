 // Función asincrónica para obtener reseñas y fotos de usuarios
async function fetchReviews() {
    try {
        // Obtener comentarios
        const commentsResponse = await fetch('https://jsonplaceholder.typicode.com/comments');
        const comments = await commentsResponse.json();

        // Obtener fotos de usuarios
        const usersResponse = await fetch('https://randomuser.me/api/?results=9');
        const users = await usersResponse.json();

        // Seleccionar el contenedor de reseñas
        const reviewsContainer = document.getElementById('reviews');

        // Mostrar solo las primeras 9 reseñas
        if (reviewsContainer && comments && users && users.results && comments.length > 0 && users.results.length > 0) {
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
        } else {
            console.error('Datos no válidos o contenedor no encontrado.');
        }
    } catch (error) {
        console.error('Error al obtener reseñas o fotos de usuarios:', error);
    }
}

// Llamar a la función
fetchReviews();

//Funcionalidad para la pagina de Store
document.addEventListener('DOMContentLoaded', () => { 
    const productsContainer = document.querySelector('.productos-container');
    const cartIcon = document.querySelector('.bi-cart4');
    const cartCountBadge = document.createElement('span'); // Create cart count badge

    // Initialize cart from localStorage or create new
    let cart = JSON.parse(localStorage.getItem('cart')) || {
        userId: 1,
        products: []
    };

    // Function to save cart to localStorage
    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Function to update cart count badge
    function updateCartCount() {
        const totalItems = cart.products.reduce((total, product) => total + product.quantity, 0);

        // Reuse or create the badge
        let badge = cartIcon.querySelector('.cart-count');
        if (!badge) {
            badge = document.createElement('span');
            badge.classList.add('cart-count');
            cartIcon.appendChild(badge);
        }

        // Update badge content
        badge.textContent = totalItems;

        // Hide badge if cart is empty
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Function to fetch products from Fake Store API
    async function fetchProductsRepeated() {
        try {
            let allElectronicProducts = [];
            
            // Intentar obtener productos de 'electronics'
            const electronicsResponse = await fetch('https://fakestoreapi.com/products/category/electronics');
            const electronicsProducts = await electronicsResponse.json();
            
            // Agregar productos de electrónicos
            allElectronicProducts = electronicsProducts;
            
            // Si tenemos menos de 12 productos, buscar en todas las categorías
            if (allElectronicProducts.length < 12) {
                const allProductsResponse = await fetch('https://fakestoreapi.com/products');
                const allProducts = await allProductsResponse.json();
                
                // Filtrar y agregar productos adicionales de electrónicos
                const additionalElectronics = allProducts
                    .filter(product => 
                        product.category === "electronics" && 
                        !allElectronicProducts.some(existingProduct => existingProduct.id === product.id)
                    );
                
                allElectronicProducts = [
                    ...allElectronicProducts, 
                    ...additionalElectronics
                ];
            }
            
            // Limpiar tarjetas existentes
            productsContainer.innerHTML = '';
            
            // Mostrar hasta 12 productos, repitiendo si es necesario
            const productsToShow = [];
            while (productsToShow.length < 12 && allElectronicProducts.length > 0) {
                const remainingSlots = 12 - productsToShow.length;
                const productsToAdd = allElectronicProducts.slice(0, remainingSlots);
                productsToShow.push(...productsToAdd);
            }
            
            productsToShow.forEach(product => {
                const card = createProductCard(product);
                productsContainer.appendChild(card);
            });
            
        } catch (error) {
            handleError(error);
        }
    }

    
    // Function to create product card
    function createProductCard(product) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card', 'col-md-4', 'mb-4');
        cardDiv.style.width = '18rem';

        cardDiv.innerHTML = `
            <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 250px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <p class="card-text">${
                    product.description.length > 100 
                    ? product.description.substring(0, 100) + '...' 
                    : product.description
                }</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="h5">$${product.price.toFixed(2)}</span>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        `;

        // Add event listener to add to cart button
        cardDiv.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product));

        return cardDiv;
    }

    // Function to add product to cart
    function addToCart(product) {
        // Check if product already in cart
        const existingProductIndex = cart.products.findIndex(
            item => item.productId === product.id
        );

        if (existingProductIndex > -1) {
            // Increment quantity if product exists
            cart.products[existingProductIndex].quantity += 1;
        } else {
            // Add new product to cart
            cart.products.push({
                productId: product.id,
                quantity: 1,
                price: product.price
            });
        }

        // Save to localStorage and update UI
        saveCartToLocalStorage();

        // Update cart modal
        updateCartModal();

        // Visual feedback
        showCartAddedNotification(product);
    }

    // Create cart modal with enhanced functionality
    function createCartModal() {
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.id = 'cartModal';
        modal.innerHTML = `
         <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Carrito de Compras</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body" id="cartItems">
                    <!-- Cart items will be dynamically added here -->
                </div>
                <div class="modal-footer d-flex justify-content-between align-items-center flex-column flex-md-row">
                    <span id="cartTotal" class="mb-2 mb-md-0">Total: $0.00</span>
                    <button id="wallet_container" class="btn btn-primary w-100 w-md-auto">Checkout</button>
                </div>
            </div>
        </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // Update cart modal with advanced features
    function updateCartModal() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalSpan = document.getElementById('cartTotal');

        // Clear existing items
        cartItemsContainer.innerHTML = '';

        // Fetch full product details for cart items
        Promise.all(
            cart.products.map(cartItem => 
                fetch(`https://fakestoreapi.com/products/${cartItem.productId}`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`Failed to fetch product ${cartItem.productId}`);
                        }
                        return res.json();
                    })
                    .catch(error => {
                        console.error('Error fetching product:', error);
                        return null;
                    })
            )
        ).then(products => {
            // Filter out any null products (failed fetches)
            const validProducts = products.filter(product => product !== null);

            let total = 0;
            validProducts.forEach((product, index) => {
                const cartItem = cart.products[index];
                const quantity = cartItem.quantity;
                const itemTotal = product.price * quantity;
                total += itemTotal;

                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item', 'd-flex', 'justify-content-between', 'align-items-center', 'mb-2');
                cartItemElement.innerHTML = `
                   <div class="row align-items-center cart-item-row">
                        <div class="col-12 col-md-5 d-flex align-items-center mb-2 mb-md-0">
                            <img src="${product.image}" class="cart-item-image" alt="${product.title}">
                            <span class="cart-item-title ms-2">${product.title}</span>
                        </div>
                        <div class="col-12 col-md-7 d-flex flex-column flex-md-row align-items-center justify-content-between">
                            <div class="d-flex align-items-center mb-2 mb-md-0">
                                <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${product.id}">-</button>
                                <input type="number" 
                                    class="form-control form-control-sm mx-2 quantity-input" 
                                    value="${quantity}" 
                                    min="1" 
                                    data-id="${product.id}">
                                <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${product.id}">+</button>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="cart-item-price me-2">$${itemTotal.toFixed(2)}</span>
                                <button class="btn btn-sm btn-danger remove-item" data-id="${product.id}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // Add event listeners for quantity adjustment and removal
                const decreaseBtn = cartItemElement.querySelector('.decrease-quantity');
                const increaseBtn = cartItemElement.querySelector('.increase-quantity');
                const quantityInput = cartItemElement.querySelector('.quantity-input');
                const removeBtn = cartItemElement.querySelector('.remove-item');

                decreaseBtn.addEventListener('click', () => updateQuantity(product.id, -1));
                increaseBtn.addEventListener('click', () => updateQuantity(product.id, 1));
                
                quantityInput.addEventListener('change', (e) => {
                    const newQuantity = parseInt(e.target.value);
                    updateQuantityDirectly(product.id, newQuantity);
                });
                
                removeBtn.addEventListener('click', () => removeFromCart(product.id));

                cartItemsContainer.appendChild(cartItemElement);
            });

            cartTotalSpan.textContent = `Total: $${total.toFixed(2)}`;
        }).catch(error => {
            console.error('Error processing cart items:', error);
        });
    }

    // Function to update quantity
    function updateQuantity(productId, change) {
        const productIndex = cart.products.findIndex(item => item.productId === productId);
        
        if (productIndex > -1) {
            cart.products[productIndex].quantity += change;
            
            // Remove item if quantity becomes 0
            if (cart.products[productIndex].quantity <= 0) {
                cart.products.splice(productIndex, 1);
            }
            
            saveCartToLocalStorage();
            updateCartModal();
        }
    }

    // Function to update quantity directly
    function updateQuantityDirectly(productId, newQuantity) {
        const productIndex = cart.products.findIndex(item => item.productId === productId);
        
        if (productIndex > -1) {
            if (newQuantity > 0) {
                cart.products[productIndex].quantity = newQuantity;
            } else {
                cart.products.splice(productIndex, 1);
            }
            
            saveCartToLocalStorage();
            updateCartModal();
        }
    }

    // Function to remove item from cart
    function removeFromCart(productId) {
        const productIndex = cart.products.findIndex(item => item.productId === productId);
        
        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);
            saveCartToLocalStorage();
            updateCartModal();
        }
    }

    // Show notification when item added to cart
    function showCartAddedNotification(product) {
        // Check if an existing toast is present and remove it
        const existingToast = document.querySelector('.navbar-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast in the navbar
        const header = document.querySelector('header');
        const toast = document.createElement('div');
        toast.classList.add(
            'navbar-toast', 
            'toast', 
            'show', 
            'position-absolute', 
            'top-100', 
            'start-50', 
            'translate-middle-x', 
            'mt-10', 
            'bg-success', 
            'text-white'
        );
        toast.style.zIndex = '1050'; // Ensure it's above other elements
        toast.innerHTML = `
            <div class="toast-body text-center">
                ${product.title} añadido al carrito
            </div>
        `;
        
        // Append to header
        header.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }

    // Add event listener to cart icon to show modal
    cartIcon.addEventListener('click', () => {
        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        cartModal.show();
    });

    // Initial setup
    createCartModal();
    updateCartCount(); // Initialize cart count
    fetchProductsRepeated();
    

    // Add this to ensure cart is populated on page load
    window.addEventListener('load', () => {
        updateCartCount();
        updateCartModal();
    });
});