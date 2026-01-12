import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { timeConversion } from 'src/common/utlis/time';

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
                date : dto.date,    
            },
        });

        // check if any availability fits the booking
        
        if (existingAvailabilities.length === 0) {
            throw new BadRequestException('No availability found for this doctor on the selected date');
        }

        const bookingStart = timeConversion(startTime);
        const bookingEnd = timeConversion(endTimeStr);

        const bookingFitsInAvailability = existingAvailabilities.some((availability: { startTime: string; endTime: string; }) => {
            const availabilityStart = timeConversion(availability.startTime);
            const availabilityEnd = timeConversion(availability.endTime);

            return (
                bookingStart >= availabilityStart &&
                bookingEnd <= availabilityEnd
            );
        });

        if (!bookingFitsInAvailability) {
            throw new BadRequestException('Booking time does not fit within doctor availability');
        }

        // check for overlapping bookings

        const existingBookings = await this.prisma.booking.findMany({
            where: {
              doctorId: dto.doctorId,
              date: dto.date,
            },
          });
          
          for (const booking of existingBookings) {
            const existingStart = timeConversion(booking.startTime);
            const existingEnd = timeConversion(booking.endTime);
          
            const overlaps =
              bookingStart < existingEnd &&
              existingStart < bookingEnd;
          
            if (overlaps) {
              throw new BadRequestException('Time slot already booked');
            }
          }
          
        // If all checks pass, create the booking

        return this.prisma.booking.create({
            data: {
                doctorId: dto.doctorId,
                patientId: '1', // gonna be replaced with auth user
                date: dto.date,
                startTime: startTime,
                endTime: endTimeStr,
                duration: duration,
                status: 'PENDING',
            },
        }); 
    }
}
