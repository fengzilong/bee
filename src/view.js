import evaluate from './eval';
import { getVariable } from './utils';

export default class {
	constructor( { template, vm } ) {
		this.template = template;
		this.vm = vm;
		this.bindings = [];
	}
	mount( mountNode ) {
		const vm = this.vm;
		const el = document.createElement( 'div' );

		el.innerHTML = this.template;

		// find all bindings
		this.walk( el, node => {
			if( node.nodeType === 3 && !/^\s+$/.test( node.textContent ) ) {
				let content = node.textContent;
				let deps = [];

				let rExpr = /\{(.*?)\}/g;
				let ret = rExpr.exec( content );

				while( ret ) {
					deps = deps.concat( getVariable( ret[ 1 ] ) )
					ret = rExpr.exec( content );
				}

				function update() {
					node.textContent = evaluate( content, vm.__data );
				}

				this.bindings.push({
					node,
					content,
					deps,
					update,
					bind() {
						for( let i = 0, len = deps.length; i < len; i++ ) {
							vm.$watch( deps[ i ], update );
						}
					},
					unbind() {

					}
				});
			}
		} );

		this.bind();
		this.apply();

		const els = el.children;
		while( els[ 0 ] ) {
			mountNode.appendChild( els[ 0 ] );
		}
	}
	walk( el, fn ) {
		const childNodes = el.childNodes;
		for( let i = 0, len = childNodes.length; i < len; i++ ) {
			fn( childNodes[ i ] )
			let nodeType = childNodes[ i ].nodeType;
			if( nodeType === 1 ) {
				this.walk( childNodes[ i ], fn );
			}
		}
	}
	bind() {
		const bindings = this.bindings;

		for( let i = 0, len = bindings.length; i < len; i++ ) {
			bindings[ i ].bind();
		}
	}
	unbind() {
		const bindings = this.bindings;

		for( let i = 0, len = bindings.length; i < len; i++ ) {
			bindings[ i ].unbind();
		}
	}
	apply() {
		const bindings = this.bindings;

		for( let i = 0, len = bindings.length; i < len; i++ ) {
			bindings[ i ].update();
		}
	}
}
