import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { timeConversion , overlapcheck} from 'src/common/utlis/time';

@Injectable()
export class BookingService {
    prisma: any;
    // Booking service methods would go here
    async createBooking(dto: CreateBookingDto) {
        // Implementation for creating a booking
        
        // get data from dto
        const { duration, startTime } = dto;
        let endTime = timeConversion(startTime) + duration;

        // Convert endTime back to "HH:MM" format
        const endHours = Math.floor(endTime / 60);
        const endMinutes = endTime % 60;
        const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMinutes
            .toString()
            .padStart(2, '0')}`;
        // now endTimeStr is in "HH:MM" format ex : "10:30"

        // valid duration 60 or 120
        if (duration !== 60 && duration !== 120) {
            throw new BadRequestException('Duration must be 60 or 120 minutes');
        }

        // check availability  exits & booking fits inside it 

        const existingAvailabilities = await this.prisma.availability.findMany({
            where: {
                doctorId: dto.doctorId,
                date: dto.date,
            },
        });

        let isFitting = false;

        for (const availability of existingAvailabilities) {
            if (
                overlapcheck(
                    startTime,
                    endTimeStr,
                    availability.startTime,
                    availability.endTime,
                )
            ) {
                isFitting = true;
                break;
            }
        }

        if (!isFitting) {
            throw new BadRequestException(
                'No available slots for the requested time',
            );
        }

        // If all checks pass, create the booking
        
        
        

    }


}
