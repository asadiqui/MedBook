import { IsInt, IsString ,Matches } from "class-validator"; 


export class CreateBookingDto {
    @IsInt()
    doctorId: number;


    @IsString()
    date: string; // YYYY-MM-DD

    @IsString()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    startTime: string; // HH:mm
    
    @IsInt()
    @Matches(/^(60|120)$/)
    duration: number; // in minutes

}