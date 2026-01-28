export function timeConversion(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function overlapcheck(time: string, time2: string, time3: string, time4: string): boolean {
  const start1 = timeConversion(time);
  const end1 = timeConversion(time2);
  const start2 = timeConversion(time3);
  const end2 = timeConversion(time4);

  return start1 < end2 && start2 < end1;
}

