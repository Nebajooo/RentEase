import React, { useState } from "react";
import { DateRangePicker } from "react-date-range";
import { addMonths, differenceInMonths } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const BookingForm = ({ property, onSubmit, onCancel, isLoading }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: addMonths(new Date(), 1),
    key: "selection",
  });
  const [duration, setDuration] = useState(1);

  const handleDateChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    const months = differenceInMonths(endDate, startDate);
    setDateRange(ranges.selection);
    setDuration(months > 0 ? months : 1);
  };

  const totalAmount = property.price * duration + property.price; // + security deposit

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      duration: duration,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Request to Book</h3>

      <div>
        <label className="block text-sm font-medium mb-2">Select Dates</label>
        <DateRangePicker
          ranges={[dateRange]}
          onChange={handleDateChange}
          minDate={new Date()}
          rangeColors={["#3B82F6"]}
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <span>
            Monthly Rent ({duration} month{duration > 1 ? "s" : ""})
          </span>
          <span>${property.price * duration}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Security Deposit</span>
          <span>${property.price}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total Amount</span>
          <span className="text-primary">${totalAmount}</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 btn-primary"
        >
          {isLoading ? "Sending..." : "Send Request"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
