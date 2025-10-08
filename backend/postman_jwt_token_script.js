// Postman Post-Response Script for JWT Token Extraction
// This script should be added to the "Tests" tab in Postman

// Parse the response body
const responseBody = pm.response.json();

// Check if the response contains a token
if (responseBody && responseBody.token) {
  // Set the JWT token as a variable
  pm.environment.set("jwt-token", responseBody.token);

  // Optional: Also set it as a collection variable if you prefer
  // pm.collectionVariables.set("jwt-token", responseBody.token);

  console.log("JWT token extracted and set successfully:", responseBody.token);
} else {
  console.log("No token found in response body");
  console.log("Response body:", responseBody);
}

// Alternative version for different response structures:
// If your token is nested differently, uncomment and modify the appropriate section:

// For nested token structure (e.g., responseBody.data.token)
/*
if (responseBody && responseBody.data && responseBody.data.token) {
    pm.environment.set("jwt-token", responseBody.data.token);
    console.log("JWT token extracted and set successfully:", responseBody.data.token);
} else {
    console.log("No token found in response body");
}
*/

// For different token key names (e.g., "access_token", "auth_token")
/*
const tokenKeys = ["token", "access_token", "auth_token", "jwt_token"];
let tokenFound = false;

for (const key of tokenKeys) {
    if (responseBody && responseBody[key]) {
        pm.environment.set("jwt-token", responseBody[key]);
        console.log(`JWT token extracted from '${key}' and set successfully:`, responseBody[key]);
        tokenFound = true;
        break;
    }
}

if (!tokenFound) {
    console.log("No token found in response body");
    console.log("Response body:", responseBody);
}
*/
