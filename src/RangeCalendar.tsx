import React from "react";
import classNames from "classnames";
import calendarDates from "bplokjs-calendar-dates";
import type { DateItem } from "bplokjs-calendar-dates";
import { isSameDate, isSameMonth } from "./utils";

export interface RangeCalendarProps {
	prefixCls?: string;
	className?: string;
	firstDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

	dayNames?: string[];

	activeDate?: Date;
	defaultActiveDate?: Date;

	defaultValue?: [Date, Date];
	value?: [Date, Date];
	// showOtherMonths?: boolean;

	width?: number | string;
	height?: number | string;
	style?: React.CSSProperties;

	minDate?: Date;
	maxDate?: Date;

	disabledDate?: (date: Date) => boolean;
	dateCellRender?: (date: Date) => React.ReactNode;
	dateHeaderCellRender?: (day: number) => React.ReactNode;
	getDateCellClassName?: (date: Date) => string;

	onSelect?: (date: Date) => void;
	// onSelectStart?: (date: Date) => void;
	// onSelectEnd?: (date: Date) => void;
	onChange?: (date: [Date, Date]) => void;
	onRangeChange?: (date: [Date, Date | null]) => void;
	onHoverDate?: (date: Date) => void;
	onActiveDateChange?: (date: Date) => void;
}

export interface RangeCalendarState {
	activeDate: Date;
	dateMatrix: DateItem[][];
	value?: [Date, Date] | null;
}

export class RangeCalendar extends React.Component<RangeCalendarProps, RangeCalendarState> {
	static defaultProps: RangeCalendarProps = {
		prefixCls: "rw-calendar",
		firstDay: 1,
		dayNames: ["日", "一", "二", "三", "四", "五", "六"],
		// showOtherMonths: true,
	};

	static getDerivedStateFromProps(nextProps: RangeCalendarProps, state: RangeCalendarState) {
		let activeDate =
			nextProps.activeDate === undefined ? state.activeDate : nextProps.activeDate;
		const value = nextProps.value === undefined ? state.value : nextProps.value;

		if (activeDate === undefined) {
			activeDate = value?.[1] || new Date();
		}

		return {
			value,
			activeDate,
			dateMatrix: calendarDates(activeDate, {
				firstDay: nextProps.firstDay,
				matrix: true,
				totalDays: 42,
			}),
		};
	}

	selectStartDate: null | Date = null;
	hoverDate: null | Date = null;

	state: RangeCalendarState = {
		activeDate: this.props.defaultActiveDate!,
		dateMatrix: [[]] as DateItem[][],
		value: this.props.defaultValue,
	};

	isDisabledDate(date: Date) {
		const { minDate, maxDate, disabledDate } = this.props;
		const cTime = date.getTime();

		if (minDate && cTime < minDate.getTime()) {
			return true;
		}

		if (maxDate && cTime > maxDate.getTime()) {
			return true;
		}

		if (disabledDate) {
			return disabledDate(date);
		}

		return false;
	}

	handleDateClick(date: Date) {
		const props = this.props;
		const { onSelect, onChange, onRangeChange, onActiveDateChange } = props;
		let { activeDate } = this.state;

		const selectStartDate = this.selectStartDate;

		this.selectStartDate = selectStartDate ? null : date;

		this.forceUpdate();

		if (selectStartDate && props.value === undefined) {
			this.setState({
				value: [
					new Date(Math.min(selectStartDate.getTime(), date.getTime())),
					new Date(Math.max(selectStartDate.getTime(), date.getTime())),
				],
			});
		}

		if (!isSameMonth(date, activeDate)) {
			if (props.activeDate === undefined) {
				this.setState({
					activeDate: date,
				});
			}

			onActiveDateChange && onActiveDateChange(date);
		}

		onSelect && onSelect(date);

		if (onRangeChange) {
			onRangeChange(
				selectStartDate
					? [
							new Date(Math.min(selectStartDate.getTime(), date.getTime())),
							new Date(Math.max(selectStartDate.getTime(), date.getTime())),
					  ]
					: [new Date(date.getTime()), null]
			);
		}

		if (selectStartDate && onChange) {
			onChange([
				new Date(Math.min(selectStartDate.getTime(), date.getTime())),
				new Date(Math.max(selectStartDate.getTime(), date.getTime())),
			]);
		}
	}

	handleHoverDate(date: Date) {
		this.hoverDate = date;

		this.forceUpdate();

		if (this.props.onHoverDate) {
			this.props.onHoverDate(date);
		}
	}

	handleMouseLeaveDate(date: Date) {
		this.hoverDate = null;
		this.forceUpdate();
	}

	isSelectedDate(date: Date) {
		const { value } = this.state;
		const selectStartDate = this.selectStartDate;

		if (selectStartDate) {
			return isSameDate(selectStartDate!, date);
		}

		if (!value) return false;

		return isSameDate(date, value[0]) || isSameDate(date, value[1]);
	}

	isInRangeDate(date: Date) {
		const { value } = this.state;
		const selectStartDate = this.selectStartDate;
		const hoverDate = this.hoverDate;

		let range: [Date, Date] = value!;

		if (selectStartDate && hoverDate) {
			range = [
				new Date(Math.min(selectStartDate.getTime(), (hoverDate! as Date).getTime())),
				new Date(Math.max(selectStartDate.getTime(), (hoverDate! as Date).getTime())),
			];
		}

		if (selectStartDate && !hoverDate) {
			return false;
		}

		if (!value) return false;

		const start = new Date(range[0].getFullYear(), range[0].getMonth(), range[0].getDate() + 1);
		const end = new Date(
			range[1].getFullYear(),
			range[1].getMonth(),
			range[1].getDate() - 1,
			23,
			59,
			59
		);

		const cTime = date.getTime();

		if (cTime >= start.getTime() && cTime <= end.getTime()) return true;

		return false;
	}

	renderDate(dateItem: DateItem, key: number) {
		const { prefixCls, dateCellRender, getDateCellClassName } = this.props;
		const { value, activeDate } = this.state;
		const selectStartDate = this.selectStartDate;
		const hoverDate = this.hoverDate;
		const date = dateItem.date;

		const isDisabled = this.isDisabledDate(date);
		const isOtherMonth = !isSameMonth(activeDate, date);
		const isToday = isSameDate(new Date(), date);
		const isSelected = this.isSelectedDate(date);
		const isInRange = this.isInRangeDate(date);

		let isRangeStart = false;
		let isRangeEnd = false;

		if (selectStartDate) {
			if (
				isSameDate(selectStartDate, date) &&
				hoverDate &&
				hoverDate.getTime() > date.getTime()
			) {
				isRangeStart = true;
			}
			if (
				isSameDate(selectStartDate, date) &&
				hoverDate &&
				hoverDate.getTime() < date.getTime()
			) {
				isRangeEnd = true;
			}
		} else if (value) {
			isRangeStart = isSameDate(value[0], date);
			isRangeEnd = isSameDate(value[1], date);
		}

		const classes = classNames(
			{
				[`${prefixCls}-cell`]: true,
				[`${prefixCls}-cell-other-month`]: isOtherMonth,
				[`${prefixCls}-cell-today`]: isToday,
				[`${prefixCls}-cell-selected`]: isSelected,
				[`${prefixCls}-cell-range-start`]: isRangeStart,
				[`${prefixCls}-cell-range-end`]: isRangeEnd,
				[`${prefixCls}-cell-in-range`]: isInRange,
				[`${prefixCls}-cell-disabled`]: isDisabled,
			},
			getDateCellClassName?.(date)
		);

		return (
			<td
				key={key}
				className={classes}
				onMouseEnter={this.handleHoverDate.bind(this, date)}
				onMouseLeave={this.handleMouseLeaveDate.bind(this, date)}
				onClick={isDisabled ? null : this.handleDateClick.bind(this, date)}
			>
				<div className={classNames(`${prefixCls}-date-wrapper`)}>
					{dateCellRender ? dateCellRender(date) : date.getDate()}
				</div>
			</td>
		);
	}

	renderBody() {
		const { prefixCls } = this.props;
		const { dateMatrix } = this.state;

		return dateMatrix.map((matrix, i) => {
			return (
				<tr className={`${prefixCls}-table-row`} key={i}>
					{matrix.map((item, i) => this.renderDate(item, i))}
				</tr>
			);
		});
	}

	renderHeader() {
		const { prefixCls, dayNames, dateHeaderCellRender } = this.props;
		const { dateMatrix } = this.state;

		return (
			<tr className={`${prefixCls}-table-header-row`}>
				{dateMatrix[0].map((item: DateItem) => {
					const day = item.date.getDay();
					return (
						<th key={day} className={classNames(`${prefixCls}-header-cell`)}>
							<div className={classNames(`${prefixCls}-header-cell-wrapper`)}>
								{dateHeaderCellRender ? dateHeaderCellRender(day) : dayNames![day]}
							</div>
						</th>
					);
				})}
			</tr>
		);
	}

	render() {
		const { prefixCls, className, style, width, height } = this.props;

		return (
			<div
				className={classNames(prefixCls, className)}
				style={{
					width,
					height,
					...style,
				}}
			>
				<table className={`${prefixCls}-table`}>
					<thead>{this.renderHeader()}</thead>
					<tbody>{this.renderBody()}</tbody>
				</table>
			</div>
		);
	}
}

export default RangeCalendar;
