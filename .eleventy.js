module.exports = function(eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/ostrio-domain.txt");
  eleventyConfig.addPassthroughCopy("src/favicon");
  return {
    dir: {
        input: "src",
        output: "_site"
    },
    passthroughFileCopy: true
  };
};