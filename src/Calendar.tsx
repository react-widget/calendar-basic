import React from "react";
import classNames from "classnames";
import calendarDates from "bplokjs-calendar-dates";
import type { DateItem } from "bplokjs-calendar-dates";
import { isSameDate, isSameMonth } from "./utils";

export interface CalendarProps {
	prefixCls?: string;
	className?: string;
	firstDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

	dayNames?: string[];

	activeDate?: Date;
	defaultActiveDate?: Date;

	defaultValue?: Date;
	value?: Date | null;
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
	onChange?: (date: Date) => void;
	onHoverDate?: (date: Date) => void;
	onActiveDateChange?: (date: Date) => void;
}

export interface CalendarState {
	activeDate: Date;
	dateMatrix: DateItem[][];
	value?: Date | null;
}

export class Calendar extends React.Component<CalendarProps, CalendarState> {
	static defaultProps: CalendarProps = {
		prefixCls: "rw-calendar",
		firstDay: 1,
		dayNames: ["日", "一", "二", "三", "四", "五", "六"],
		// showOtherMonths: true,
	};

	static getDerivedStateFromProps(
		nextProps: CalendarProps,
		state: CalendarState
	): Partial<CalendarState> {
		let activeDate =
			nextProps.activeDate === undefined ? state.activeDate : nextProps.activeDate;
		const value = nextProps.value === undefined ? state.value : nextProps.value;

		if (activeDate === undefined) {
			activeDate = value || new Date();
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

	state: CalendarState = {
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
		const { onSelect, onChange, onActiveDateChange } = props;
		const activeDate = this.state.activeDate;

		if (props.value === undefined) {
			this.setState({
				value: date,
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

		onChange && onChange(date);

		onSelect && onSelect(date);
	}

	handleHoverDate(date: Date) {
		if (this.props.onHoverDate) {
			this.props.onHoverDate(date);
		}
	}

	isSelectedDate(date: Date) {
		const value = this.state.value;
		return value ? isSameDate(value, date) : false;
	}

	renderDate(dateItem: DateItem, key: number) {
		const { prefixCls, dateCellRender, getDateCellClassName } = this.props;
		const activeDate = this.state.activeDate;
		const date = dateItem.date;

		const isDisabled = this.isDisabledDate(date);
		const isOtherMonth = !isSameMonth(activeDate, date);
		const isToday = isSameDate(new Date(), date);
		const isSelected = this.isSelectedDate(date);

		const classes = classNames(
			{
				[`${prefixCls}-cell`]: true,
				[`${prefixCls}-cell-other-month`]: isOtherMonth,
				[`${prefixCls}-cell-today`]: isToday,
				[`${prefixCls}-cell-selected`]: isSelected,
				[`${prefixCls}-cell-disabled`]: isDisabled,
			},
			getDateCellClassName?.(date)
		);

		return (
			<td
				key={key}
				className={classes}
				onMouseEnter={this.handleHoverDate.bind(this, date)}
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

export default Calendar;
