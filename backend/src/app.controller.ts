import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // GET /api/health: lets the frontend (and you) check that the backend is running.
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
