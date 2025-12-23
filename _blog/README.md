# Blog Posts

This folder (`_blog/`) contains all blog articles. Each blog post is a Markdown file with the following structure:

## File Naming

Name your files descriptively, for example:
- `getting-started-with-kubernetes.md`
- `open-source-contribution-guide.md`
- `cloud-native-best-practices.md`

## Front Matter

Each blog post must start with front matter (YAML) like this:

```yaml
---
layout: default
title: "Your Blog Post Title"
date: 2024-01-15
categories: cloud-native, kubernetes
excerpt: "A brief description of your blog post"
image: "/path/to/preview-image.jpg"
hidden: false
---
```

### Front Matter Fields

- **layout**: Should be `blog` (automatically set for all blog posts)
- **title**: The title of your blog post (required)
- **slug**: Custom alias/slug to display in the blog post header. If not specified, it will be generated from the filename (optional)
- **date**: Publication date in YYYY-MM-DD format (optional but recommended)
- **categories**: Comma-separated list of categories/tags (optional)
- **excerpt**: A brief description that appears on the blog listing page (optional)
- **image**: Path to a preview image that appears on the right side of the blog card. If not specified, the first image from your post content will be used automatically (optional)
- **hidden**: Set to `true` to hide the post from the blog listing page. The post will still be accessible via direct URL but won't appear in the list (optional, default: `false`)

## Content

After the front matter, write your blog post content in Markdown format.

## Images

All images for blog articles should be placed in the `assets/blog/` folder at the root of your site. Reference them using absolute paths:

```markdown
![Alt text](/assets/blog/image-name.png)
```

**Note**: The first image in your blog post will automatically be used as the preview image on the blog listing page if you don't specify an `image` field in the front matter.

## Example

See `example-post.md` for a complete example.

