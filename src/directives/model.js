export default function( node, expr ) {
	const cb = () => this.$set( expr, node.value );

	node.value = this.$get( expr );
	node.addEventListener( 'input', cb, false );
	this.$watch( expr, ( nv, ov ) => {
		node.value = nv;
	} );

	return () => node.removeEventListener( 'change', cb, false );
};
