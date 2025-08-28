import * as React from "react";
import { Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  className?: string;
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
}: DatePickerWithRangeProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            dir="rtl"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {date.from.toLocaleDateString("ar-SA")} -{" "}
                  {date.to.toLocaleDateString("ar-SA")}
                </>
              ) : (
                date.from.toLocaleDateString("ar-SA")
              )
            ) : (
              <span>{t('hardcoded.selectDateRange')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 