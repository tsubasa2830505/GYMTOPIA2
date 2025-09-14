export function getMockUser() {
  return {
    id: 'mock-user-1',
    email: 'user@example.com',
    username: 'testuser',
    display_name: 'Test User',
    avatar_url: null,
    bio: 'Mock user for development',
    created_at: new Date().toISOString(),
    is_active: true
  }
}