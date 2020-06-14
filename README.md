![Build](https://github.com/UWmathNEWS/slugline-web/workflows/Build/badge.svg)
![Security checks](https://github.com/UWmathNEWS/slugline-web/workflows/Security%20checks/badge.svg)

## slugline-web
The front-end component of `slugline`, math**NEWS**'s best and only React/Django based publishing website.

## Running
- It's a standard create-react-app project, `npm run start` to run. 
- Grab a copy of the server [here](https://github.com/UWmathNEWS/slugline-api). 
- By default, the server runs at port 8000, and the `proxy` setting in `package.json` is designed to redirect requests from the dev server to there. If you change the server port, change the port in `package.json` as well.

## License
Except for files which specify otherwise, this application is licensed under the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.en.html).
