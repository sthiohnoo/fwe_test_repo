import express, { Application } from 'express';

import { globalErrorHandler } from './src/middleware/global-error';

export class App {
  private app: Application;

  constructor() {
    this.app = express();
    this._registerMiddlewares();
    this._registerErrorHandlers();
  }

  private _registerMiddlewares() {
    this.app.use(express.json());

    this.app.use((req, _res, next) => {
      console.info(`New request to ${req.path}`);
      next();
    });
  }

  private _registerErrorHandlers() {
    // The errorHandler could also be injected via constructor which would be even better and easily testable
    this.app.use(globalErrorHandler);
  }

  public listen(port: number, callback: () => void) {
    return this.app.listen(port, callback);
  }
}
