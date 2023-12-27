import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: path.resolve(__dirname, "source/js/index.js"),
  mode: process.env.NODE_ENV ? 'production' : 'development',

  devtool: process.env.NODE_ENV ? false : "source-map",

  target: ['web', 'es5']
};
