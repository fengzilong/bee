export default function isPrimitive( v ) {
	return v === null ||
		( typeof v !== 'object' && !Array.isArray( v ) );
};
