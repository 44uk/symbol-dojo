import { env } from "./env"

test('Make sure required variables.', () => {
  console.debug(env.API_URL)
  expect('Hello Taro').toBe('Hello Taro')
})
