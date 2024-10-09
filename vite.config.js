import * as fs from 'fs';
import path, { resolve } from 'path';
import { defineConfig } from 'vite';
// import ejs, {render as ejsRender } from 'ejs';

const title = 'server';
const build_title = 'server';
const directory = __dirname;


const bannerPlugin = (banner) => {
    return {
        name: 'banner',
        async writeBundle (NULL, bundle) {
        for (const fileName of Object.entries(bundle)) {
            const file = fileName[0]
            const extRegex = new RegExp(/\.(css|js)$/i)
            const vendorRegex = new RegExp(/vendor/)
            if (extRegex.test(file) && !vendorRegex.test(file)) {
            let data = fs.readFileSync('./build/' + file, { encoding: 'utf8' })
            data = `/* ${banner} */ ${data}`
            fs.writeFileSync('./build/' + file, data)
            }
        }
        }
    }
}
const dateFormat = (date) => {
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let hour = date.getHours();
	let minute = date.getMinutes();
	let second = date.getSeconds();

	month = month >= 10 ? month : '0' + month;
	day = day >= 10 ? day : '0' + day;
	hour = hour >= 10 ? hour : '0' + hour;
	minute = minute >= 10 ? minute : '0' + minute;
	second = second >= 10 ? second : '0' + second;

	return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}
// get html file list to set rollupOptions.input
const htmlFileList = [...getHtmlFiles(directory)];
const inputsMap = {};
fs.readdirSync(directory).forEach((item) => {
	const file = path.join(directory, item);
	const stats = fs.lstatSync(file);

	if (stats.isDirectory()) {
		if (!(/^(\.git|_old|build|node_modules|public|src|@BACK|__MACOSX)$/).test(item)) {
			htmlFileList.push(...getHtmlFiles(file, true));
		}
	}
});
htmlFileList.forEach((fileName) => {
	inputsMap[fileName.replace('.html', '')] = resolve(directory, fileName);
});

function getHtmlFiles (dir, recursive) {
	const results = [];
	const list = fs.existsSync(dir) ? fs.readdirSync(dir) : [];

	if (list.length === 0) {
		return [];
	}

	list.forEach(item => {
		let file = path.join(dir, item);
		const stats = fs.lstatSync(file);

		file = file.replace(directory + '/', '');
		if (recursive && stats.isDirectory()) {
			results.push(...getHtmlFiles(file, true));
		} else if (stats.isFile() && item.endsWith('.html')) {
			results.push(file);
		}
	});

	return results;
}

export default defineConfig({
  server: {
    proxy: {
      // 백엔드 API 요청을 Node.js 서버로 프록시
      '/api': 'http://localhost:3001',
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,  // WebSocket 프록시
      },
    },
  },
	base: '',
	build: {
		target: 'esnext',
		outDir: './build',
		rollupOptions: {
        input: inputsMap,
			output: {
				inlineDynamicImports: false,
				assetFileNames: (assetInfo) => {
					let extType = assetInfo.name.match(/\.([a-z0-9]+)$/i)[1];
					if (/(css)/i.test(extType)) {
						return `resources/${ extType }/${ build_title }[extname]`;
					} else if (/(png|jpe?g|svg|gif|tiff|bmp|ico)/i.test(extType)) {
						extType = 'resources/images';
					} else if (/(woff|woff2|otf|ttf|eot)/i.test(extType)) {
						extType = 'resources/fonts';
					}
					return `${extType}/[name][extname]`;
				},
				chunkFileNames: `resources/js/[name].js`,
				entryFileNames: `resources/js/[name].js`
			}
		}
	},
  plugins: [
    // VitePluginEjs({}),
		// beautify({
		// 	inDir: 'build',
		// 	js: { enabled: false },
		// 	css: { enabled: false }
		// }),
		bannerPlugin(`
* @project  ${title}
* @author   www.fave.kr
* @build    ${dateFormat(new Date())}
`),
  ],
});



// https://github.com/trapcodeio/vite-plugin-ejs
function VitePluginEjs (data = {}, options) {
	let config;
	return {
		name: 'vite-plugin-ejs',
		// Get Resolved config
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		configureServer (server) {
			server.watcher.on('change', (file) => {
				if (!(/\.(scss|js)$/i).test(file)) {
					server.ws.send({ type: 'full-reload', path: '*' }); // reload
				}
			});
		},
		transformIndexHtml: {
			enforce: 'pre',
			transform(html) {
				if (typeof data === 'function') {
					data = data(config);
				}
				let ejsOptions = options && options.ejs ? options.ejs : {};
				if (typeof ejsOptions === 'function') {
					ejsOptions = ejsOptions(config);
				}
				html = ejsRender(
					html,
					Object.assign({ NODE_ENV: config.mode, isDev: config.mode === 'development' }, data),
					Object.assign(
						Object.assign(
							{ 
								// setting views enables includes support
								views: [config.root]
							},
							ejsOptions
						),
						{
							async: false // Force sync
						}
					)
				);
				return html;
			}
		}
	};
}