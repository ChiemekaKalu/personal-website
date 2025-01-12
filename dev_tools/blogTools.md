# How to Use the Blog Tools

Hey! This is a guide for my future self (or anyone interested) on how to manage blog posts on this website. I've built a few tools to make the process easier, and here's how everything works.

## The Tools in Your Arsenal

### 1. `generate_static.py` - Your Static Site Generator
This is your main tool for turning blog posts into static HTML pages that work on GitHub Pages. Every time you make a new post or update an existing one, you'll need to run this.

What does it do? A lot actually:
- Takes your Markdown blog posts and turns them into nice HTML pages
- Makes sure your code snippets look pretty with syntax highlighting
- Creates a dedicated page for each post in the `/static/blog/` folder
- Fixes up all the navigation links so they work properly
- Copies over your CSS and JS files to make everything look good
- Creates a posts.json file that powers your blog listing page

### 2. `generate_pygments_css.py` - Your Code Styling Tool
This one's simpler - it creates the CSS file that makes your code blocks look good. You'll rarely need to run this unless you want to change how your code looks.

## How to Write and Update Blog Posts

### Setting Up (Do This First!)
1. First, copy `app.example.py` to `app.py` if you haven't already:
   ```bash
   cp app.example.py app.py
   ```

2. Open `app.py` and change these things:
   - Set a proper secret key (any random string will do)
   - Change any other settings you want

3. Create the database (only needed once on a new machine):
   ```python
   python
   >>> from app import db
   >>> db.create_all()
   >>> exit()
   ```

### Writing a New Blog Post

1. **Fire up your development server**
   ```bash
   python app.py
   ```
   This gets your local version of the site running.

2. **Get to the admin page**
   - Open your browser
   - Go to `http://localhost:5000/admin`
   - Log in (you'll need to set up your admin account first if you haven't)

3. **Create your post**
   Hit the "New Post" button and you'll see a form with:
   - Title: Make it catchy!
   - Category: Pick one of these:
     - `blogAndUpdates` (for general blog stuff)
     - `projects` (for showing off cool things you've built)
     - `music` (for music-related posts)
     - `coolOrRandom` (for everything else)
   - Content: This is where you write your post in Markdown

   **Quick Markdown Tips:**
   - Want a code block? Use three backticks and specify the language:
     ````markdown
     ```python
     def hello():
         print("Hello, World!")
     ```
     ````
   - Headers use `#` (more `#` = smaller header)
   - *Italics* use `*` or `_`
   - **Bold** uses `**` or `__`
   - Links look like this: `[click me](https://example.com)`

4. **Preview and Save**
   - Always preview your post to make sure it looks right
   - Hit save when you're happy with it

### Updating an Existing Post

1. **Get to your admin page**
   - Start the server with `python app.py` if it's not running
   - Go to `http://localhost:5000/admin`
   - Log in

2. **Find and Edit**
   - Look for your post in the list
   - Click "Edit"
   - Make your changes
   - Save it

### The Final Step: Generating Your Static Site

After any changes (new posts or updates), you need to generate the static version:

1. **Run the generator**
   ```bash
   python dev_tools/generate_static.py
   ```
   This creates all the files you need in the `static` folder.

2. **Check your work**
   - Find your post at `/static/blog/your-post-slug/index.html`
   - Open it in your browser
   - Make sure:
     - Everything looks right
     - Links work
     - Code blocks are properly highlighted
     - Images show up (if you have any)

## When Things Go Wrong

### Code Blocks Look Weird?
1. Generate a fresh syntax highlighting stylesheet:
   ```bash
   python dev_tools/generate_pygments_css.py
   ```
2. Run `generate_static.py` again

### Styles Missing?
Check these things:
- Look for `styles.css` and `pygments.css` in your `/static/` folder
- Make sure the paths in your HTML files point to the right place
- Try generating everything again

### Navigation Not Working?
- Double-check the paths in `generate_static.py`
- Run the generator again

## Taking Care of Your Blog

### Backup Your Stuff!
- Keep a copy of `blog.db` somewhere safe
- Maybe keep your markdown content in a separate file too

### Before Publishing
- Preview everything
- Check how it looks on your phone
- Make sure all your links work
- If you included code, make sure it actually runs (or not who really cares, its a blog post)

### Regular Maintenance
- Update your Python packages sometimes
- Keep your database backed up
- Clean out old static files you don't need anymore

That's it! If you're reading this in the future and something's not clear, feel free to update this guide. Future me will appreciate it!