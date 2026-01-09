import { Controller , Post, Body} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('booking')
export class BookingController {
    constructor(
        private readonly bookingService: BookingService,
    ) {}

    @Post()
    create(@Body() dto: CreateBookingDto) {
        return this.bookingService.createBooking(dto);
    }
}
