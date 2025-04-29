import { Routes } from '@angular/router';
import { HomeComponent } from './components/page-area/home/home.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch:"full" },
    { path: "home", component: HomeComponent},
    { path: "contact-us", loadComponent: () => import("./components/page-area/contact-us/contact-us.component").then(c => c.ContactUsComponent) },
    { path: "courses", loadComponent: () => import("./components/course-area/course-list/course-list.component").then(c => c.CourseListComponent),  canActivate:[authGuard]},
    { path: "course/new", loadComponent: () => import("./components/course-area/add-course/add-course.component").then(c => c.AddCourseComponent), canActivate:[authGuard], data : {roles: ['Admin', 'Professor']} },
    { path: 'course-details/:courseId/lessons', loadComponent: () => import("./components/course-area/course-details/course-details.component").then(c => c.CourseDetailsComponent), canActivate:[authGuard] },
    { path: "course-edit/:id", loadComponent: () => import("./components/course-area/course-edit/course-edit.component").then(c => c.CourseEditComponent), canActivate:[authGuard], data : {roles: ['Admin', 'Professor']} },
    { path: "lessons/:id",loadComponent: () => import("./components/lesson-area/lesson-list/lesson-list.component").then(l => l.LessonListComponent) ,canActivate:[authGuard]},
    { path: "lesson-details/:id", loadComponent: () => import("./components/lesson-area/lesson-details/lesson-details.component").then(l => l.LessonDetailsComponent), canActivate:[authGuard]},
    { path: "lesson/new/:id", loadComponent: () => import("./components/lesson-area/add-lesson/add-lesson.component").then(l => l.AddLessonComponent), canActivate:[authGuard], data : {roles: ['Admin', 'Professor']} },
    { path: "lesson-edit/:courseid/:id", loadComponent: () => import("./components/lesson-area/lesson-edit/lesson-edit.component").then(c => c.LessonEditComponent), canActivate:[authGuard], data : {roles: ['Admin', 'Professor']} },
    { path: "progress/:id", loadComponent: () => import("./components/progress-area/progress/progress.component").then(p => p.ProgressComponent) , canActivate:[authGuard],data : {roles: ['Admin', 'Student']}},
    { path: "register", loadComponent: () => import("./components/user-area/register/register.component").then(m => m.RegisterComponent) }, 
    { path: "login", loadComponent: () => import("./components/user-area/login/login.component").then(m => m.LoginComponent) }, 



    { path: "**", loadComponent: () => import("./components/page-area/page-404/page-404.component").then(m => m.Page404Component) }


];
