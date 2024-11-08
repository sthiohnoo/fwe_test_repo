import { Router } from 'express';

import { AuthController } from '../controller/auth.controller';

export class Routes {
  private router: Router;

  constructor(private readonly authController: AuthController) {
    this.router = Router();
    this.initializeRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  /**
   * Initializes the routes for the application.
   * ?.bind(this.authController.) ensures that 'this' inside the controller method refers to the controller instance rather than Express's context
   */
  private initializeRoutes(): void {
    // Auth routes
    this.router.post(
      '/auth/register',
      this.authController.registerUser.bind(this.authController),
    );
    this.router.post(
      '/auth/login',
      this.authController.loginUser.bind(this.authController),
    );
  }
}
