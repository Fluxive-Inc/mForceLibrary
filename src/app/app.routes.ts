import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LibraryWarpComponent } from './library-warp/library-warp.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'dashboard', component: LibraryWarpComponent }
];
