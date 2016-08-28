import Observer from './observer';
import View from './view';
import directives from './directive';

export default class Bee extends Observer {
	constructor( { data, template } ) {
		super( data );
		this.$directives = directives;
		this.view = new View({
			template: template,
			vm: this,
		});
	}
	$mount( node ) {
		this.view.mount( node );
	}
};
