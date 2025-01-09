// Blog posts data
const blogPosts = [
    {
        id: 1,
        title: "Welcome to My Blog!",
        date: "2025-01-08",
        category: "blogAndUpdates",
        excerpt: "Welcome to my new personal website! I'm excited to share my thoughts, projects, and experiences with you. In this first post, I want to discuss the tech stack and features I've implemented.",
        content: "Full blog post content here...",
        imageUrl: "images/blog/welcome-post.jpg"
    },
    // Add more blog posts here
];

// Function to create blog post HTML
function createBlogPostElement(post) {
    const categoryDisplayNames = {
        'blogAndUpdates': 'Blog & Updates',
        'projects': 'Projects',
        'music': 'Music',
        'coolOrRandom': 'Cool & Random'
    };

    return `
        <article class="blog-post" data-category="${post.category}">
            <div class="blog-post-image">
                <img src="${post.imageUrl}" alt="${post.title}">
            </div>
            <div class="blog-post-content">
                <span class="post-category">${categoryDisplayNames[post.category] || post.category}</span>
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
