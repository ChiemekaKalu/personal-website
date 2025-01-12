// Blog posts data
const blogPosts = [];

// Function to create blog post HTML
function createBlogPostElement(post) {
    const date = new Date(post.date_posted).toLocaleDateString();
    const categoryDisplayNames = {
        'blogAndUpdates': 'Blog & Updates',
        'projects': 'Projects',
        'music': 'Music',
        'coolOrRandom': 'Cool & Random'
    };
    
    return `
        <article class="blog-post" data-category="${post.category}">
            <div class="blog-post-content">
                <span class="post-category">${categoryDisplayNames[post.category] || post.category}</span>
                <h3>${post.title}</h3>
                <span class="post-date">${date}</span>
                <div class="post-excerpt">${post.content.split('\n')[0]}</div>
                <a href="static/blog/${post.slug}/index.html" class="read-more">Read More →</a>
            </div>
        </article>
    `;
}

// Function to fetch and display blog posts
async function displayBlogPosts(category = 'all') {
    const blogContainer = document.querySelector('.blog-posts');
    console.log('Blog container element:', blogContainer);
    try {
        const posts = await fetchPosts();
        console.log('Posts to display:', posts);
        // Filter posts by category
        const filteredPosts = category === 'all' 
            ? posts 
            : posts.filter(post => post.category === category);
            
        if (filteredPosts && filteredPosts.length > 0) {
            blogContainer.innerHTML = filteredPosts
                .map(post => createBlogPostElement(post))
                .join('');
            console.log('Posts displayed successfully');
        } else {
            console.log('No posts found');
            blogContainer.innerHTML = '<p>No blog posts found.</p>';
        }
    } catch (error) {
        console.error('Error displaying posts:', error);
        blogContainer.innerHTML = '<p>Error loading blog posts. Please try again later.</p>';
    }
}

// Function to fetch posts from static JSON
async function fetchPosts() {
    try {
        console.log('Fetching posts from static JSON...');
        const response = await fetch('static/blog/posts.json');
        console.log('JSON Response:', response);
        const posts = await response.json();
        console.log('Posts received:', posts);
        return posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

// Function to fetch a single post from API
async function fetchPost(slug) {
    try {
        const response = await fetch(`http://localhost:5000/api/posts/${slug}`);
        const post = await response.json();
        return post;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
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
