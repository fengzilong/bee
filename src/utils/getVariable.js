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

export default getVariable;
