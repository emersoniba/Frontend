import { Component } from '@angular/core';

@Component({
	selector: 'app-footer',
	imports: [],
	templateUrl: './footer.component.html',
	styleUrl: './footer.component.css'
})
export class FooterComponent {
	gestion: number = 0;
	constructor() {
		this.gestion = (new Date()).getFullYear();
	}
}

/*generar año*/
