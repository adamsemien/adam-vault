export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export function withCors(response: Response): Response {
  const newResponse = new Response(response.body, response)
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    newResponse.headers.set(key, value)
  })
  return newResponse
}

export function corsOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}
