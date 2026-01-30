import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('api/orders')
export class OrderController {

  constructor(
    private orderService: OrderService,
  ) { }

}
