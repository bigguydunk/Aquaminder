import { Card, CardContent } from "@/components/ui/card";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekRow() {
  const currentDay = new Date().getDay(); // Get the current day as a number (0 = Sunday, 1 = Monday, etc.)
  const today = new Date();

  // Generate an array of dates for the current week
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - today.getDay() + index); // Adjust to get the correct date for each day
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" }); // Format as "Day Month" (e.g., "1 Jan")
  });

  return (
    <div>
      {/* Add a black line above the cards */}
      <div className="w-full h-[1px] bg-black mb-4"></div>
      <div className="grid grid-cols-7 gap-12">
        {days.map((day, index) => (
          <Card
            key={day}
            className={`text-center h-20 flex flex-col items-center justify-center transition-colors p-4 cursor-pointer border-none shadow-none ${
              index === currentDay ? "bg-white" : "bg-transparent"
            }`}
          >
            <CardContent className="text-xl font-semibold p-0"> {/* Increased font size */}
              {day}
              <div className="text-base text-black-500 mt-1">{weekDates[index]}</div> {/* Increased font size */}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Add a black line below the cards */}
      <div className="w-full h-[1px] bg-black mt-4"></div>
    </div>
  );
}