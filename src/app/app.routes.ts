
import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'pcr-reader',
		loadComponent: () => import('./pcr-reader/pcr-reader').then(m => m.PcrReaderComponent)
	}
];
