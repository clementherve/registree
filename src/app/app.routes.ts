import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'repositories' },
      {
        path: 'repositories',
        loadComponent: () =>
          import('./features/repositories/repositories.component').then((m) => m.RepositoriesComponent)
      },
      {
        path: 'repositories/:name',
        loadComponent: () =>
          import('./features/repository-detail/repository-detail.component').then(
            (m) => m.RepositoryDetailComponent
          )
      },
      {
        path: 'repositories/:name/tags/:tag',
        loadComponent: () =>
          import('./features/tag-detail/tag-detail.component').then((m) => m.TagDetailComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
