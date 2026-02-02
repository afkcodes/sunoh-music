export type NestedObject = Record<string, unknown>;

/**
 * Safely extracts a value from a nested object structure using a key path or multiple key paths.
 *
 * @template T The expected type of the extracted value.
 * @param {NestedObject} obj - The object to extract the value from.
 * @param {string | string[]} keys - The key path(s) to the desired value, using dot notation or a custom delimiter.
 * @param {string} [delimiter='.'] - The delimiter used in the key path. Defaults to '.'.
 * @returns {T | undefined} The extracted value of type T, or undefined if no valid path is found.
 *
 * @example
 * const user = { name: 'John', address: { city: 'New York' } };
 * const city = dataExtractor<string>(user, 'address.city'); // Returns 'New York'
 *
 * @example
 * const data = { 'level1/level2': { 'level3/level4': 42 } };
 * const value = dataExtractor<number>(data, 'level1/level2/level3/level4', '/'); // Returns 42
 *
 * @example
 * const user = { info: { firstName: 'John' }, data: { name: 'John Doe' }, isActive: false };
 * const name = dataExtractor<string>(user, ['info.firstName', 'data.name']); // Returns 'John'
 * const active = dataExtractor<boolean>(user, 'isActive'); // Returns false
 */
export function dataExtractor<T>(
  obj: NestedObject | null | undefined,
  keys: string | readonly string[],
  delimiter: string = '.',
  filterFn?: (obj: any[]) => T,
): T | undefined {
  // If keys is a string, convert it to an array
  const keyPaths = Array.isArray(keys) ? keys : [keys];

  // Function to extract data for a single key path
  const extractSingle = (keyPath: string): T | undefined => {
    if (obj == null || typeof obj !== 'object') {
      return undefined;
    }

    const keyParts = keyPath.split(delimiter);
    let currentValue: unknown = obj;

    for (const k of keyParts) {
      if (currentValue == null || typeof currentValue !== 'object') {
        return undefined;
      }

      if (Array.isArray(currentValue)) {
        if (filterFn) {
          return filterFn(currentValue);
        } else {
          const index = parseInt(k, 10);
          if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < currentValue.length
          ) {
            currentValue = currentValue[index];
          } else {
            return undefined;
          }
        }
      } else {
        currentValue = (currentValue as NestedObject)[k];
      }
    }

    return currentValue as T | undefined;
  };

  // Try each key path in order
  for (const keyPath of keyPaths) {
    const result = extractSingle(keyPath);
    if (result !== undefined && result !== '') {
      return result;
    }
  }

  // If no valid result is found, return undefined
  return undefined;
}

// Usage examples

// Example 1: Basic object with type safety
// const user = {
//   name: 'John Doe',
//   age: 30,
//   address: {
//     street: '123 Main St',
//     city: 'Anytown',
//   },
// };

// const userName = dataExtractor<string>(user, 'name');
// console.log(userName); // Output: John Doe

// const userCity = dataExtractor<string>(user, 'address.city');
// console.log(userCity); // Output: Anytown

// const userCountry = dataExtractor<string>(user, 'address.country');
// console.log(userCountry); // Output: undefined

// Example 2: Array handling with type safety
// const data = {
//   users: [
//     { id: 1, name: 'Alice' },
//     { id: 2, name: 'Bob' },
//   ],
//   settings: {
//     theme: 'dark',
//     notifications: {
//       email: true,
//       sms: false,
//     },
//   },
// };

// const secondUserName = dataExtractor<string>(data, 'users.1.name');
// console.log(secondUserName); // Output: Bob

// const emailNotification = dataExtractor<boolean>(data, 'settings.notifications.email');
// console.log(emailNotification); // Output: true

// Example 3: Using custom delimiter
// const customDelimiterData = {
//   'level1/level2': {
//     'level3/level4': 'Deep nested value',
//   },
// };

// const deepValue = dataExtractor<string>(
//   customDelimiterData,
//   'level1/level2/level3/level4',
//   '/'
// );
// console.log(deepValue); // Output: Deep nested value

// Example 4: Mixed nested structure with type safety
// const complexData = {
//   level1: {
//     level2: [
//       {
//         level3: {
//           level4: 42,
//         },
//       },
//     ],
//   },
// };

// const deepNumber = dataExtractor<number>(complexData, 'level1.level2.0.level3.level4');
// console.log(deepNumber); // Output: 42

// Example 5: Incorrect type specification (TypeScript will warn about this)
// const incorrectType = dataExtractor<string>(complexData, 'level1.level2.0.level3.level4');
// console.log(incorrectType); // Output: 42 (but TypeScript will warn that this might not be a string)