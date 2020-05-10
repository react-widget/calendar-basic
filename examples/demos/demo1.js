import React from "react";
import { Calendar, RangeCalendar } from "../../src";

export default () => {
	const current = new Date();
	const [value, setValue] = React.useState(
		new Date(current.getFullYear(), current.getMonth() - 1, 12)
	);
	const [rangeValue, setRangeValue] = React.useState([null, null]);

	return (
		<div>
			{/* <button
				onClick={() => {
					activeDate.setMonth(activeDate.getMonth() - 1);
					setActiveDate(new Date(activeDate));
				}}
			>
				上个月
			</button>
			<button
				onClick={() => {
					activeDate.setMonth(activeDate.getMonth() + 1);
					setActiveDate(new Date(activeDate));
				}}
			>
				下个月
			</button>{" "} */}
			<span>
				当前日期：{value.getFullYear()}-{value.getMonth() + 1}-{value.getDate()}
			</span>
			<Calendar
				// activeDate={activeDate}
				value={value}
				onChange={setValue}
			></Calendar>
			<span>
				日期范围：{rangeValue[0]?.getFullYear()}-{rangeValue[0]?.getMonth() + 1}-
				{rangeValue[0]?.getDate()} 至 {rangeValue[1]?.getFullYear()}-
				{rangeValue[1]?.getMonth() + 1}-{rangeValue[1]?.getDate()}
			</span>
			<RangeCalendar
				onChange={console.log}
				onRangeChange={setRangeValue}
				defaultValue={[
					new Date(current.getFullYear(), current.getMonth() - 1, 12),
					new Date(current.getFullYear(), current.getMonth() - 1, 15),
				]}
			></RangeCalendar>
		</div>
	);
};
