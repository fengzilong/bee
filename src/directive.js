// directives
import model from './directives/model';

export const register = ( key, fn ) => {
	directives[ key ] = fn;
};

const directives = {};
export default directives;

register( 'b-model', model );
