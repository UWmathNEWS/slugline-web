![Build](https://github.com/UWmathNEWS/slugline-web/workflows/Build/badge.svg)
![Test](https://github.com/UWmathNEWS/slugline-web/workflows/Test/badge.svg)
![Security checks](https://github.com/UWmathNEWS/slugline-web/workflows/Security%20checks/badge.svg)
[![codecov](https://codecov.io/gh/UWmathNEWS/slugline-web/branch/master/graph/badge.svg)](https://codecov.io/gh/UWmathNEWS/slugline-web)

## slugline-web
The front-end component of `slugline`, math**NEWS**'s best and only React/Django based publishing website.

## Running

### Basic configuration

Basic site configuration is found in `src/config.ts`. Edit that as you wish.

### Development

- It's a standard create-react-app project, `npm run start` to run. 
- Grab a copy of the server [here](https://github.com/UWmathNEWS/slugline-api). 
- By default, the server runs at port 8000, and the `proxy` setting in `package.json` is designed to redirect requests from the dev server to there. If you change the server port, change the port in `package.json` as well.

## License
Except for files which specify otherwise, this application is licensed under the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.en.html).
See `CONTRIBUTING.md` for more details.

### Production

For production uses, goosePRESS uses SSR, which requires some setup:

- `npm run build` to make a production build
- `npm run lib` to build the source for SSR
- Set `SLUGLINE_SERVER` in your environment to point to the API server (default: `http://localhost:8000`)
- `npm run start-ssr` to start the SSR server. By default, it runs on port 8080; to change this, set `PORT` in your
  environment to the port you wish.
