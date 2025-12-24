// Test file for ESLint and Prettier
// This file intentionally has issues to test our tools

export interface testInterface {
  name: string
  value: number
}

export function test_function(arg1: string): void {
  console.log(arg1)
  const unused_var = 'test'
}

const obj = {a:1,b:2,c:3};
