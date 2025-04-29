import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from local storage
  const authToken = localStorage.getItem("token");

  // Clone the request and add the authorization header with the token
  const clonedRequest = req.clone({
    setHeaders: {
        Authorization: `Bearer ${authToken}`
    }
  });

  // Continue to the next interceptor
  return next(clonedRequest);
};
