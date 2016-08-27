// https://github.com/Rich-Harris/deepClone
// --------------------------------------
//
// MIT licensed. Go nuts.

var deepClone = function ( obj ) {
	var key, i, result;

	// if it's a primitive, do nothing
	if ( typeof obj !== 'object' ) {
		return obj;
	}

	// if it's an array, iterate
	if ( Object.prototype.toString.call( obj ) === '[object Array]' ) {
		result = [];

		i = obj.length;
		while ( i-- ) {
			if ( obj.hasOwnProperty( i ) ) {
				if ( typeof obj[i] === 'object' ) {
					result[i] = deepClone( obj[i] );
				}

				else {
					result[i] = obj[i];
				}
			}
		}
	}

	// if it's an object, enumerate
	else {
		result = {};

		for ( key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				if ( typeof obj[ key ] === 'object' ) {
					result[ key ] = deepClone( obj[ key ] );
				}

				else {
					result[ key ] = obj[ key ];
				}
			}
		}
	}

	return result;
};

export default deepClone;