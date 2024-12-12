// FakeStoreApi.js
document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.querySelector('.productos-container');
    const cartIcon = document.querySelector('.bi-cart4');
    const cartModal = createCartModal();

    // Cart state
    let cart = {
        userId: 1, // Default user ID
        products: []
    };

    // Function to fetch products from Fake Store API
    async function fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const products = await response.json();
            
            // Clear existing cards
            productsContainer.innerHTML = '';

            // Filter for electronics category
            const electronicProducts = products.filter(product => 
                product.category === "electronics"
            );

            // Limit to 3 products
            electronicProducts.slice(0, 9).forEach(product => {
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
                quantity: 1
            });
        }

        // Update cart in API (simulated)
        addCartToAPI();

        // Update cart modal
        updateCartModal();

        // Visual feedback
        showCartAddedNotification(product);
    }

    // Function to add cart to API
    function addCartToAPI() {
        fetch('https://fakestoreapi.com/carts', {
            method: "POST",
            body: JSON.stringify({
                userId: cart.userId,
                date: new Date().toISOString().split('T')[0],
                products: cart.products
            })
        })
        .then(res => res.json())
        .then(json => console.log('Cart added:', json))
        .catch(error => console.error('Error adding cart:', error));
    }

    // Create cart modal
    function createCartModal() {
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.id = 'cartModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content" >
                    <div class="modal-header">
                        <h5 class="modal-title">Carrito de Compras</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="cartItems">
                        <!-- Cart items will be dynamically added here -->
                    </div>
                    <div class="modal-footer">
                        <span id="cartTotal">Total: $0.00</span>
                        <button id="wallet_container" class="btn btn-primary">Checkout</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // Update cart modal
    function updateCartModal() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalSpan = document.getElementById('cartTotal');

        // Clear existing items
        cartItemsContainer.innerHTML = '';

        // Fetch full product details for cart items
        Promise.all(
            cart.products.map(cartItem => 
                fetch(`https://fakestoreapi.com/products/${cartItem.productId}`)
                    .then(res => res.json())
            )
        ).then(products => {
            let total = 0;
            products.forEach((product, index) => {
                const quantity = cart.products[index].quantity;
                const itemTotal = product.price * quantity;
                total += itemTotal;

                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item', 'd-flex', 'justify-content-between', 'mb-2');
                cartItemElement.innerHTML = `
                    <div>
                        <img src="${product.image}" style="width: 50px; height: 50px; object-fit: cover;">
                        ${product.title}
                    </div>
                    <div>
                        Cantidad: ${quantity}
                        Subtotal: $${itemTotal.toFixed(2)}
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });

            cartTotalSpan.textContent = `Total: $${total.toFixed(2)}`;
        });
    }

    // Show notification when item added to cart
    function showCartAddedNotification(product) {
        const toast = document.createElement('div');
        toast.classList.add('toast', 'show', 'position-fixed', 'bottom-0', 'end-0', 'm-3', 'bg-success', 'text-white');
        toast.innerHTML = `
            <div class="toast-body">
                ${product.title} añadido al carrito
            </div>
        `;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Add event listener to cart icon to show modal
    cartIcon.addEventListener('click', () => {
        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        cartModal.show();
    });

    // Initial fetch of products
    fetchProducts();
});


