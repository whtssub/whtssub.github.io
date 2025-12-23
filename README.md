# Subhasmita's Personal Website

![homepage](/assets/blog/home.png)

## Local Setup

1. Install Jekyll and dependencies:
   ```bash
   bundle install --path vendor/bundle
   ```

2. Run the development server:
   ```bash
   bundle exec jekyll serve --host 0.0.0.0 --port 4000
   ```

3. Visit `http://localhost:4000` in your browser

## Customization

- Edit `_config.yml` to update site information
- Modify markdown files (`.md`) to update content
- Update `_sass/jekyll-theme-minimal.scss` for styling changes

## Deployment

This site is deployed to GitHub Pages and served at [subhasmita.in](https://subhasmita.in) using a custom domain configured via the `CNAME` file.

GitHub Pages will automatically build and deploy the Jekyll site when changes are pushed to the repository. The site uses the custom domain `subhasmita.in` as specified in the `CNAME` file.

