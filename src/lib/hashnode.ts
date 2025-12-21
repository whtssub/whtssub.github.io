
import axios from 'axios';
import { Article } from '../types';

// Updated API URL - Hashnode's new GraphQL API endpoint
const HASHNODE_API_URL = 'https://gql.hashnode.com';

export const fetchArticles = async (): Promise<Article[]> => {
  try {
    const response = await axios.post(
      HASHNODE_API_URL,
      {
        query: `
          query GetUserArticles {
            user(username: "whtssub") {
              publications(first: 1) {
                edges {
                  node {
                    posts(first: 20) {
                      edges {
                        node {
                          id
                          title
                          brief
                          slug
                          publishedAt
                          coverImage {
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('Hashnode API response:', JSON.stringify(response.data, null, 2));
    
    // Check for GraphQL errors
    if (response.data.errors) {
      console.error('GraphQL errors:', response.data.errors);
    }
    
    // Check if user exists
    if (!response.data?.data?.user) {
      console.warn('User not found in API response');
      return [];
    }
    
    // Check if publications exist
    if (!response.data?.data?.user?.publications?.edges || response.data.data.user.publications.edges.length === 0) {
      console.warn('No publications found for user');
      return [];
    }
    
    if (response.data?.data?.user?.publications?.edges?.[0]?.node?.posts?.edges) {
      // Map the Hashnode posts to our Article interface format
      // Filter out drafts (posts without publishedAt) and only include published posts
      const articles = response.data.data.user.publications.edges[0].node.posts.edges
        .map((edge: any) => {
          const post = edge.node;
          return {
            id: post.id,
            title: post.title,
            brief: post.brief || '',
            slug: post.slug,
            dateAdded: post.publishedAt,
            coverImage: post.coverImage?.url || ''
          };
        })
        .filter((article: Article) => {
          // Only include articles that have a publishedAt date (published articles)
          return article.dateAdded != null && article.dateAdded !== '';
        });
      
      console.log('Filtered articles (published only):', articles);
      
      // Sort articles by date (most recent first)
      return articles.sort((a: Article, b: Article) => {
        const dateA = new Date(a.dateAdded).getTime();
        const dateB = new Date(b.dateAdded).getTime();
        return dateB - dateA;
      });
    }
    
    console.warn('No articles found in API response');
    
    return [];
  } catch (error) {
    console.error('Error fetching articles from Hashnode:', error);
    return [];
  }
};
