/* Most likely called after blog post was authored and is about to be published. 
  * Expects the following blog post folder structure (creates blog.json)
  * = blog.md may or may not be present at this point
  *
  *  postname
  *  └── snippets
  *  blog.md
  *  metadata.json
  */
function createMetadata(blogDir, done) {
  var images;

}

module.exports = {
  createMetadata: createMetadata
};
