---
layout: default
maintenance: true
---
## recent articles
***

{% if page.maintenance %}
  {% include maintenance_status.html %}
{% else %}

<div class="blog-cards">
{% if site.blog.size > 0 %}
  {% assign sorted_posts = site.blog | sort: 'date' | reverse %}
  {% assign visible_posts = sorted_posts | where_exp: "post", "post.hidden != true" %}
  {% for post in visible_posts %}
  <div class="blog-card">
    <a href="{{ post.url }}" class="blog-card-link">
      <div class="blog-card-content">
        <div class="blog-card-text">
          <h3 class="blog-card-title">{{ post.title }}</h3>
          {% if post.excerpt %}
          <p class="blog-card-excerpt">{{ post.excerpt }}</p>
          {% endif %}
          <div class="blog-card-meta">
            {% if post.date %}
            <span class="blog-card-date">{{ post.date | date: "%B %d, %Y" }}</span>
            {% endif %}
            {% if post.categories %}
            <span class="blog-card-categories">
              {% for category in post.categories %}
              <span class="blog-card-tag">{{ category }}</span>
              {% endfor %}
            </span>
            {% endif %}
          </div>
        </div>
        {% if post.image %}
        <div class="blog-card-image">
          <img src="{{ post.image }}" alt="{{ post.title }}" />
        </div>
        {% elsif post.content %}
          {% assign first_image = post.content | extract_first_image %}
          {% if first_image %}
          <div class="blog-card-image">
            <img src="{{ first_image }}" alt="{{ post.title }}" />
          </div>
          {% endif %}
        {% endif %}
      </div>
    </a>
  </div>
  {% unless forloop.last %}
  <hr class="blog-card-separator" />
  {% endunless %}
  {% endfor %}
  {% if visible_posts.size == 0 %}
    <p>More articles coming soon!</p>
  {% endif %}
{% else %}
  <p>More articles coming soon!</p>
{% endif %}
</div>

***
[back](../)
{% endif %}

