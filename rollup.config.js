import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'src/index.js',
	plugins: [
		nodeResolve({
			main: true
		}),
		commonjs({
			include: 'node_modules/**'
		}),
		buble()
	],
	targets: [
		{
			dest: 'dist/bee.js',
			format: 'umd',
			moduleName: 'Bee',
			sourceMap: true
		}
	]
};
