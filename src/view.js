import { tmpl } from 'riot-tmpl';

var KEYWORDS =
	// 关键字
	'break,case,catch,continue,debugger,default,delete,do,else,false'
	+ ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
	+ ',throw,true,try,typeof,var,void,while,with'

	// 保留字
	+ ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
	+ ',final,float,goto,implements,import,int,interface,long,native'
	+ ',package,private,protected,public,short,static,super,synchronized'
	+ ',throws,transient,volatile'

	// ECMA 5 - use strict
	+ ',arguments,let,yield'

	+ ',undefined';

var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
var SPLIT_RE = /[^\w$]+/g;
var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
var BOUNDARY_RE = /^,+|,+$/g;
var SPLIT2_RE = /^$|,+/;

function getVariable( code ) {
	return code
		.replace( REMOVE_RE, '' )
		.replace( SPLIT_RE, ',' )
		.replace( KEYWORDS_RE, '' )
		.replace( NUMBER_RE, '' )
		.replace( BOUNDARY_RE, '' )
		.split( SPLIT2_RE );
};

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
					node.textContent = tmpl( content, vm.__data );
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
