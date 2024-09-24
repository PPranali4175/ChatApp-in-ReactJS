const getFileExtension=(base64String)=> {
    // Extract the MIME type from the base64 string
    const mimeType = base64String.match(/data:([a-zA-Z0-9\/]+);base64/)[1];
  
    // Map MIME types to file extensions
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/pdf': 'pdf',
      // Add other MIME types and extensions as needed
    };
  
    // Return the corresponding extension
    return mimeToExt[mimeType] || 'bin'; // Default to 'bin' if not recognized
  }

  module.exports = {getFileExtension}