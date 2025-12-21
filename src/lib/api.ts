import { Article } from '../types';

// Updated API URL - Hashnode's new GraphQL API endpoint
const HASHNODE_API_URL = 'https://gql.hashnode.com';

export const fetchArticles = async (username: string): Promise<Article[]> => {
  try {
    const response = await fetch(HASHNODE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetUserArticles {
            user(username: "${username}") {
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
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }

    const data = await response.json();
    console.log('API response data:', JSON.stringify(data, null, 2));
    
    // Check for GraphQL errors
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
    }
    
    // Check if user exists
    if (!data.data?.user) {
      console.warn('User not found in API response');
      return [];
    }
    
    // Check if publications exist
    if (!data.data?.user?.publications?.edges || data.data.user.publications.edges.length === 0) {
      console.warn('No publications found for user');
      return [];
    }
    
    if (data.data?.user?.publications?.edges?.[0]?.node?.posts?.edges) {
      // Map the Hashnode posts to our Article interface format
      // Filter out drafts (posts without publishedAt) and only include published posts
      const articles = data.data.user.publications.edges[0].node.posts.edges
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
    console.error('Error fetching articles:', error);
    return [];
  }
};

export const getMockArticles = (): Article[] => {
  return [
    {
      id: '1',
      title: 'Getting Started with AWS Lambda',
      brief: 'Learn the basics of serverless computing with AWS Lambda',
      slug: 'getting-started-with-aws-lambda',
      dateAdded: new Date().toISOString(),
      coverImage: 'https://cdn.hashnode.com/res/hashnode/image/upload/v1625761456888/YLnDfSEABl.jpeg'
    }
  ];
};

export const getMockTalks = async () => {
  try {
    const talksContent = await import('../content/talks.mdx');
    return [
      {
        id: '1',
        title: 'Serverless Computing: Building Applications with AWS Lambda',
        description: talksContent.default,
        date: '2023-03-15',
        venue: 'Tech Conference 2023, New York',
        slideUrl: 'https://example.com/slides/serverless-computing',
        videoUrl: 'https://example.com/videos/serverless-computing'
      }
    ];
  } catch (error) {
    console.error('Error fetching talks:', error);
    return [];
  }
};
