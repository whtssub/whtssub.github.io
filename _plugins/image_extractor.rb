module Jekyll
  module ImageExtractor
    def extract_first_image(content)
      return nil if content.nil?
      
      # Match markdown image syntax: ![alt](url)
      image_match = content.match(/!\[.*?\]\(([^\)]+)\)/)
      return image_match[1] if image_match
      
      # Match HTML img tag: <img src="url" ...>
      html_match = content.match(/<img[^>]+src=["']([^"']+)["']/)
      return html_match[1] if html_match
      
      nil
    end
  end
end

Liquid::Template.register_filter(Jekyll::ImageExtractor)

