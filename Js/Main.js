function toggleMenu() {
    const navUl = document.querySelector('nav ul');
    if (navUl.style.display === 'flex') {
        navUl.style.display = 'none';
    } else {
        navUl.style.display = 'flex';
    }
}
