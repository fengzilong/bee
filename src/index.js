import { isPlainObject, deepClone, isPrimitive } from './utils';

function walkKeyPath( obj, fn, parentKeyPath = '' ) {
	var keys = Object.keys( obj );
	for( let i = 0, len = keys.length; i < len; i++ ) {
		let key = keys[ i ];
		fn( obj[ key ], `${parentKeyPath ? parentKeyPath + '.' : ''}${key}` );
		if( !isPrimitive( obj[ key ] ) ) {
			walkKeyPath( obj[ key ], fn, `${parentKeyPath ? parentKeyPath + '.' : ''}${key}` );
		}
	}
}

// in: a.b [ 'a', 'a.b', 'a.b.c' ]
// out: [ 'a.b.c' ]
function getChildrenKeyPath( kp, kps ) {
	let t = [];
	for( let i = 0, len = kps.length; i < len; i++ ) {
		let tmp = kps[ i ];
		if( tmp.indexOf( kp + '.' ) === 0 && tmp.length > kp.length ) {
			t.push( tmp );
		}
	}
	return t;
}

function getChildrenBindings( kp, bindings ) {
	return getChildrenKeyPath( kp, Object.keys( bindings ) )
		.map(v => bindings[ v ]);
}

// in: a.b [ 'a', 'a.b', 'a.b.c' ]
// out: [ 'a' ]
function getParentKeyPath( kp, kps ) {
	let t = [];
	for( let i = 0, len = kps.length; i < len; i++ ) {
		let tmp = kps[ i ];
		if( kp.indexOf( tmp + '.' ) === 0 && tmp.length < kp.length ) {
			t.push( tmp );
		}
	}
	return t;
}

function getParentBindings( kp, bindings ) {
	return getParentKeyPath( kp, Object.keys( bindings ) )
		.map(v => bindings[ v ]);
}

class Bee {
	static create( data ) {
		return new this( data );
	}
	$get( path, root = this ) {
		if( typeof path === 'undefined' || path === '' ) {
			return root;
		} else {
			const segments = path.split( '.' );

			for( let i = 0, len = segments.length; i < len; i++ ){
				let segment = segments[ i ];
				if( typeof root[ segment ] !== 'undefined' ) {
					root = root[ segment ];
				} else {
					root = void 0;
					break;
				}
			}

			return root;
		}
	}
	$set( path, value, root = this ) {
		const segments = path.split( '.' );

		for( let i = 0, len = segments.length; i < len; i++ ) {
			let segment = segments[ i ];
			if( i !== len - 1 ) {
				if( isPlainObject( root[ segment ] ) ){
					// step in
					root = root[ segment ];
				} else {
					// or create empty object
					root[ segment ] = {};
					root = root[ segment ];
				}
			} else {
				// last one
				const descriptor = Object.getOwnPropertyDescriptor( root, segment );
				if(
					( !descriptor || ( descriptor && !descriptor.get && !descriptor.set ) ) &&
					path in this.__binding
				) {
					this.$define( path, this.__binding[ path ].descriptor );
				}
				root[ segment ] = value;
			}
		}
	}
	$exists( path, root = this ) {
		const segments = path.split( '.' );
		let isExist = false;

		for( let i = 0, len = segments.length; i < len; i++ ) {
			let segment = segments[ i ];
			if( i !== len - 1 ) {
				if( isPlainObject( root[ segment ] ) ){
					// if root is plainObject, step in
					root = root[ segment ];
				} else {
					break;
				}
			} else {
				if( segment in root ) {
					isExist = true;
				}
			}
		}

		return isExist;
	}
	$define( path, descriptor, root = this ) {
		path = path.split( '.' );
		const prop = path.pop();

		let obj = this.$get( path.join( '.' ), root );

		if( !isPrimitive( obj ) ) {
			Object.defineProperty(
				obj,
				prop,
				descriptor
			);
		}
	}
	constructor( data ) {
		const self = this;

		let __binding = {};

		walkKeyPath( data, ( v, kp ) => {
			// define all keypath while walking
			const descriptor = {
				get() {
					return __binding[ kp ].value;
				},
				set( newValue ) {
					let value = __binding[ kp ].value;
					if( newValue !== value ) {
						// make a clone of data at first
						let cloned = deepClone( data );

						__binding[ kp ].value = newValue;
						__binding[ kp ].last = value;

						const watchers = __binding[ kp ].watchers;

						// execute watchers in current keypath
						for( let i = 0, len = watchers.length; i < len; i++ ) {
							watchers[ i ].fn.call( self, newValue, deepClone( value ) );
						}

						// find parent watchers, if any parent watcher is a deep watcher, execute it
						let pbindings = getParentBindings( kp, __binding );
						for( let i = 0, len = pbindings.length; i < len; i++ ) {
							let watchers = pbindings[ i ].watchers;
							let keypath = pbindings[ i ].keypath;
							let nv = deepClone( self.$get( keypath ) );
							let ov = deepClone( self.$get( keypath, cloned ) );
							for( let j = 0, len = watchers.length; j < len; j++ ) {
								if( watchers[ j ].deep ) {
									watchers[ j ].fn.call( self, nv, ov );
								}
							}
						}

						// find child watchers
						let cbindings = getChildrenBindings( kp, __binding );

						// if newValue is plainObject
						if( isPlainObject( newValue ) ) {
							// need sorting cbindings, shorter path define earlier
							for( let i = 0, len = cbindings.length; i < len; i++ ) {
								let keypath = cbindings[ i ].keypath;
								let descriptor = cbindings[ i ].descriptor;

								// get current value
								cbindings[ i ].value = self.$get( keypath );

								// TODO: deepEqual
								if( cbindings[ i ].value !== self.$get( keypath, cloned ) ) {
									let watchers = cbindings[ i ].watchers;
									let nv = cbindings[ i ].value;
									let ov = self.$get( keypath, cloned );
									for( let j = 0, len = watchers.length; j < len; j++ ) {
										if( watchers[ j ].deep ) {
											watchers[ j ].fn.call( self, nv, ov );
										}
									}
								}

								// regenerate getter and setter to hook
								self.$define( keypath, descriptor );
							}
						}
					}
					return value;
				}
			};

			__binding[ kp ] = {
				keypath: kp,
				last: v,
				value: v,
				watchers: [],
				descriptor
			};

			this.$define( kp, descriptor );
		} );

		this.$define( '__binding', {
			enumerable: false,
			value: __binding
		} );

		this.$define( '__data', {
			enumerable: false,
			value: data
		} );
	}
	$delete( keypath, root = this ) {
		keypath = keypath.split( '.' );
		const prop = keypath.pop();
		let parent = this.$get( keypath.join( '.' ), root );
		if( !isPrimitive( parent ) ) {
			delete parent[ prop ];
		}
	}
	$watch( kp, fn, { deep } = { deep: false } ) {
		if( kp in this.__binding ) {
			this.__binding[ kp ].watchers.push({ deep, fn });
		}
	}
}

export default Bee;
