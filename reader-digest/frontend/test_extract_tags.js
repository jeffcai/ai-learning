// Test the extractTags function with different inputs
console.log("Testing extractTags function...");

// Mock the function (copy from utils.ts)
const extractTags = (tagsInput) => {
  if (!tagsInput) return [];
  
  // If it's already an array, return it  
  if (Array.isArray(tagsInput)) {
    return tagsInput;
  }
  
  // If it's a string, try to parse as JSON first
  try {
    return JSON.parse(tagsInput);
  } catch {
    // If not JSON, split by comma
    return tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
  }
};

// Test cases
console.log("Test 1 - Array input:", extractTags(["technology", "test"]));
console.log("Test 2 - JSON string input:", extractTags('["tech", "web"]'));
console.log("Test 3 - Comma-separated string:", extractTags('tech, web, dev'));
console.log("Test 4 - Empty input:", extractTags(''));
console.log("Test 5 - Null input:", extractTags(null));
console.log("Test 6 - Empty array:", extractTags([]));

console.log("All tests completed!");
