require('ignore-styles');

require('@babel/register')({
  ignore: [/(node_modules)/],
  presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
  plugins: [
    ["@babel/transform-runtime"]
  ],
  extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs"]
});

require('./server');
