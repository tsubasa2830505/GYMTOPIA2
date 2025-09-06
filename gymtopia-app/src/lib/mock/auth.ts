// Mock auth for development
export const mockUser = {
  id: '8ac9e2a5-a702-4d04-b871-21e4a423b4ac',
  email: 'tsubasa.a.283.0505@gmail.com',
  username: 'tsubasa_gym',
  display_name: 'Tsubasa'
}

export const getMockUser = () => {
  if (process.env.NODE_ENV === 'development') {
    return mockUser
  }
  return null
}