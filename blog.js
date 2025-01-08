// Blog posts data
const blogPosts = [
    {
        id: 1,
        title: "Building My First Neural Network",
        date: "2025-01-05",
        category: "tech",
        excerpt: "A deep dive into my experience building and training my first neural network using PyTorch...",
        content: "Full blog post content here...",
        imageUrl: "path/to/image.jpg"
    },
    // Add more blog posts here
];

// Function to create blog post HTML
function createBlogPostElement(post) {
    return `
        <article class="blog-post" data-category="${post.category}">
            <div class="blog-post-image">
                <img src="${post.imageUrl}" alt="${post.title}">
            </div>
            <div class="blog-post-content">
                <span class="post-category">${post.category}</span>
                <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="blog/${post.id}" class="read-more">Read More</a>
            </div>
        </article>
    `;
}

// Function to display blog posts
function displayBlogPosts(category = 'all') {
    const blogContainer = document.querySelector('.blog-posts');
    const filteredPosts = category === 'all' 
        ? blogPosts 
        : blogPosts.filter(post => post.category === category);
    
    blogContainer.innerHTML = filteredPosts
        .map(post => createBlogPostElement(post))
        .join('');
}

// Set up category filters
document.getElementById('category-filters').addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        // Update active state
        document.querySelectorAll('#category-filters li').forEach(li => {
            li.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Filter posts
        const category = e.target.dataset.category;
        displayBlogPosts(category);
    }
});

// Initial display
displayBlogPosts();
