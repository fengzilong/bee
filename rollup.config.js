import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
	entry: 'src/index.js',
	plugins: [
		nodeResolve({
			main: true
		}),
		commonjs({
			include: 'node_modules/**'
		}),
		buble(),
		uglify(),
	],
	targets: [
		{
			dest: 'dist/bee.js',
			format: 'umd',
			moduleName: 'Bee',
			// sourceMap: true
		}
	]
};
