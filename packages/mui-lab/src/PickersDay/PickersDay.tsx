import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { CSSInterpolation, SxProps } from '@mui/system';
import ButtonBase, { ButtonBaseProps } from '@mui/material/ButtonBase';
import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/utils';
import {
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
} from '@mui/base';
import { useTheme, alpha, styled, useThemeProps, Theme } from '@mui/material/styles';
import { useForkRef } from '@mui/material/utils';
import { ExtendMui } from '../internal/pickers/typings/helpers';
import { useUtils } from '../internal/pickers/hooks/useUtils';
import { DAY_SIZE, DAY_MARGIN } from '../internal/pickers/constants/dimensions';
import { PickerSelectionState } from '../internal/pickers/hooks/usePickerState';

export interface PickersDayProps<TDate> extends ExtendMui<ButtonBaseProps> {
  /**
   * If `true`, `onChange` is fired on click even if the same date is selected.
   * @default false
   */
  allowSameDateSelection?: boolean;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: {
    /** Styles applied to the root element. */
    root?: string;
    /** Styles applied to the root element if `disableMargin=false`. */
    dayWithMargin?: string;
    /** Styles applied to the root element if `outsideCurrentMonth=true` and `showDaysOutsideCurrentMonth=true`. */
    dayOutsideMonth?: string;
    /** Styles applied to the root element if `outsideCurrentMonth=true` and `showDaysOutsideCurrentMonth=false`. */
    hiddenDaySpacingFiller?: string;
    /** Styles applied to the root element if `disableHighlightToday=false` and `today=true`. */
    today?: string;
    /** State class applied to the root element if `selected=true`. */
    selected?: string;
    /** State class applied to the root element if `disabled=true`. */
    disabled?: string;
  };

  /**
   * The date to show.
   */
  day: TDate;
  /**
   * If `true`, renders as disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, todays date is rendering without highlighting with circle.
   * @default false
   */
  disableHighlightToday?: boolean;
  /**
   * If `true`, days are rendering without margin. Useful for displaying linked range of days.
   * @default false
   */
  disableMargin?: boolean;
  isAnimating?: boolean;
  onDayFocus?: (day: TDate) => void;
  onDaySelect: (day: TDate, isFinish: PickerSelectionState) => void;
  /**
   * If `true`, day is outside of month and will be hidden.
   */
  outsideCurrentMonth: boolean;
  /**
   * If `true`, renders as selected.
   * @default false
   */
  selected?: boolean;
  /**
   * If `true`, days that have `outsideCurrentMonth={true}` are displayed.
   * @default false
   */
  showDaysOutsideCurrentMonth?: boolean;
  /**
   * If `true`, renders as today date.
   * @default false
   */
  today?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
}

export type PickersDayClassKey = keyof NonNullable<PickersDayProps<unknown>['classes']>;

type OwnerState = Partial<PickersDayProps<any>>;

export function getPickersDayUtilityClass(slot: string) {
  return generateUtilityClass('MuiPickersDay', slot);
}

export const pickersDayClasses = generateUtilityClasses<PickersDayClassKey>('MuiPickersDay', [
  'root',
  'dayWithMargin',
  'dayOutsideMonth',
  'hiddenDaySpacingFiller',
  'today',
  'selected',
  'disabled',
]);

const useUtilityClasses = (ownerState: PickersDayProps<any>) => {
  const {
    selected,
    disableMargin,
    disableHighlightToday,
    today,
    outsideCurrentMonth,
    showDaysOutsideCurrentMonth,
    classes,
  } = ownerState;

  const slots = {
    root: [
      'root',
      selected && 'selected',
      !disableMargin && 'dayWithMargin',
      !disableHighlightToday && today && 'today',
      outsideCurrentMonth && showDaysOutsideCurrentMonth && 'dayOutsideMonth',
    ],
    hiddenDaySpacingFiller: ['hiddenDaySpacingFiller'],
  };

  return composeClasses(slots, getPickersDayUtilityClass, classes);
};

const styleArg = ({ theme, ownerState }: { theme: Theme; ownerState: OwnerState }) => ({
  ...theme.typography.caption,
  width: DAY_SIZE,
  height: DAY_SIZE,
  borderRadius: '50%',
  padding: 0,
  // background required here to prevent collides with the other days when animating with transition group
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.active, theme.palette.action.hoverOpacity),
  },
  '&:focus': {
    backgroundColor: alpha(theme.palette.action.active, theme.palette.action.hoverOpacity),
    [`&.${pickersDayClasses.selected}`]: {
      willChange: 'background-color',
      backgroundColor: theme.palette.primary.dark,
    },
  },
  [`&.${pickersDayClasses.selected}`]: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    transition: theme.transitions.create('background-color', {
      duration: theme.transitions.duration.short,
    }),
    '&:hover': {
      willChange: 'background-color',
      backgroundColor: theme.palette.primary.dark,
    },
  },
  [`&.${pickersDayClasses.disabled}`]: {
    color: theme.palette.text.disabled,
  },
  ...(!ownerState.disableMargin && {
    margin: `0 ${DAY_MARGIN}px`,
  }),
  ...(ownerState.outsideCurrentMonth &&
    ownerState.showDaysOutsideCurrentMonth && {
      color: theme.palette.text.secondary,
    }),
  ...(!ownerState.disableHighlightToday &&
    ownerState.today && {
      [`&:not(.${pickersDayClasses.selected})`]: {
        border: `1px solid ${theme.palette.text.secondary}`,
      },
    }),
});

const overridesResolver = (
  props: { ownerState: OwnerState },
  styles: Record<PickersDayClassKey, CSSInterpolation>,
) => {
  const { ownerState } = props;
  return [
    styles.root,
    !ownerState.disableMargin && styles.dayWithMargin,
    !ownerState.disableHighlightToday && ownerState.today && styles.today,
    !ownerState.outsideCurrentMonth &&
      ownerState.showDaysOutsideCurrentMonth &&
      styles.dayOutsideMonth,
    ownerState.outsideCurrentMonth &&
      !ownerState.showDaysOutsideCurrentMonth &&
      styles.hiddenDaySpacingFiller,
  ];
};

const PickersDayRoot = styled(ButtonBase, {
  name: 'MuiPickersDay',
  slot: 'Root',
  overridesResolver,
})<{ ownerState: OwnerState }>(styleArg);

const PickersDayFiller = styled('div', {
  name: 'MuiPickersDay',
  slot: 'Root',
  overridesResolver,
})<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  ...styleArg({ theme, ownerState }),
  visibility: 'hidden',
}));

const noop = () => {};

const PickersDay = React.forwardRef(function PickersDay<TDate>(
  inProps: PickersDayProps<TDate>,
  forwardedRef: React.Ref<HTMLButtonElement>,
) {
  const props = useThemeProps<Theme, PickersDayProps<TDate>, 'MuiPickersDay'>({
    props: inProps,
    name: 'MuiPickersDay',
  });

  const {
    allowSameDateSelection = false,
    autoFocus = false,
    className,
    day,
    disabled = false,
    disableHighlightToday = false,
    disableMargin = false,
    hidden,
    isAnimating,
    onClick,
    onDayFocus = noop,
    onDaySelect,
    onFocus,
    onKeyDown,
    outsideCurrentMonth,
    selected = false,
    showDaysOutsideCurrentMonth = false,
    children,
    today: isToday = false,
    ...other
  } = props;
  const ownerState = {
    ...props,
    allowSameDateSelection,
    autoFocus,
    disabled,
    disableHighlightToday,
    disableMargin,
    selected,
    showDaysOutsideCurrentMonth,
    today: isToday,
  };

  const classes = useUtilityClasses(ownerState);

  const utils = useUtils<TDate>();
  const ref = React.useRef<HTMLButtonElement>(null);
  const handleRef = useForkRef(ref, forwardedRef);

  // Since this is rendered when a Popper is opened we can't use passive effects.
  // Focusing in passive effects in Popper causes scroll jump.
  useEnhancedEffect(() => {
    if (autoFocus && !disabled && !isAnimating && !outsideCurrentMonth) {
      // ref.current being null would be a bug in MUI
      ref.current!.focus();
    }
  }, [autoFocus, disabled, isAnimating, outsideCurrentMonth]);

  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    if (onDayFocus) {
      onDayFocus(day);
    }

    if (onFocus) {
      onFocus(event);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!allowSameDateSelection && selected) {
      return;
    }

    if (!disabled) {
      onDaySelect(day, 'finish');
    }

    if (onClick) {
      onClick(event);
    }
  };

  const theme = useTheme();

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (onKeyDown !== undefined) {
      onKeyDown(event);
    }

    switch (event.key) {
      case 'ArrowUp':
        onDayFocus(utils.addDays(day, -7));
        event.preventDefault();
        break;
      case 'ArrowDown':
        onDayFocus(utils.addDays(day, 7));
        event.preventDefault();
        break;
      case 'ArrowLeft':
        onDayFocus(utils.addDays(day, theme.direction === 'ltr' ? -1 : 1));
        event.preventDefault();
        break;
      case 'ArrowRight':
        onDayFocus(utils.addDays(day, theme.direction === 'ltr' ? 1 : -1));
        event.preventDefault();
        break;
      case 'Home':
        onDayFocus(utils.startOfWeek(day));
        event.preventDefault();
        break;
      case 'End':
        onDayFocus(utils.endOfWeek(day));
        event.preventDefault();
        break;
      case 'PageUp':
        onDayFocus(utils.getNextMonth(day));
        event.preventDefault();
        break;
      case 'PageDown':
        onDayFocus(utils.getPreviousMonth(day));
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  if (outsideCurrentMonth && !showDaysOutsideCurrentMonth) {
    return (
      <PickersDayFiller
        className={clsx(classes.root, classes.hiddenDaySpacingFiller, className)}
        ownerState={ownerState}
      />
    );
  }

  return (
    <PickersDayRoot
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      ref={handleRef}
      centerRipple
      data-mui-test="day"
      disabled={disabled}
      aria-label={!children ? utils.format(day, 'fullDate') : undefined}
      tabIndex={selected ? 0 : -1}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      {...other}
    >
      {!children ? utils.format(day, 'dayOfMonth') : children}
    </PickersDayRoot>
  );
});

export const areDayPropsEqual = (
  prevProps: PickersDayProps<any>,
  nextProps: PickersDayProps<any>,
) => {
  return (
    prevProps.autoFocus === nextProps.autoFocus &&
    prevProps.isAnimating === nextProps.isAnimating &&
    prevProps.today === nextProps.today &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.selected === nextProps.selected &&
    prevProps.disableMargin === nextProps.disableMargin &&
    prevProps.showDaysOutsideCurrentMonth === nextProps.showDaysOutsideCurrentMonth &&
    prevProps.disableHighlightToday === nextProps.disableHighlightToday &&
    prevProps.className === nextProps.className &&
    prevProps.outsideCurrentMonth === nextProps.outsideCurrentMonth &&
    prevProps.onDayFocus === nextProps.onDayFocus &&
    prevProps.onDaySelect === nextProps.onDaySelect
  );
};

PickersDay.propTypes /* remove-proptypes */ = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * If `true`, `onChange` is fired on click even if the same date is selected.
   * @default false
   */
  allowSameDateSelection: PropTypes.bool,
  /**
   * @ignore
   */
  autoFocus: PropTypes.bool,
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The date to show.
   */
  day: PropTypes.any.isRequired,
  /**
   * If `true`, renders as disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, todays date is rendering without highlighting with circle.
   * @default false
   */
  disableHighlightToday: PropTypes.bool,
  /**
   * If `true`, days are rendering without margin. Useful for displaying linked range of days.
   * @default false
   */
  disableMargin: PropTypes.bool,
  /**
   * @ignore
   */
  hidden: PropTypes.bool,
  /**
   * @ignore
   */
  isAnimating: PropTypes.bool,
  /**
   * @ignore
   */
  onClick: PropTypes.func,
  /**
   * @ignore
   */
  onDayFocus: PropTypes.func,
  /**
   * @ignore
   */
  onDaySelect: PropTypes.func.isRequired,
  /**
   * @ignore
   */
  onFocus: PropTypes.func,
  /**
   * @ignore
   */
  onKeyDown: PropTypes.func,
  /**
   * If `true`, day is outside of month and will be hidden.
   */
  outsideCurrentMonth: PropTypes.bool.isRequired,
  /**
   * If `true`, renders as selected.
   * @default false
   */
  selected: PropTypes.bool,
  /**
   * If `true`, days that have `outsideCurrentMonth={true}` are displayed.
   * @default false
   */
  showDaysOutsideCurrentMonth: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * If `true`, renders as today date.
   * @default false
   */
  today: PropTypes.bool,
} as any;

/**
 *
 * Demos:
 *
 * - [Date Picker](https://mui.com/components/date-picker/)
 *
 * API:
 *
 * - [PickersDay API](https://mui.com/api/pickers-day/)
 */
export default React.memo(PickersDay, areDayPropsEqual) as <TDate>(
  props: PickersDayProps<TDate> & React.RefAttributes<HTMLButtonElement>,
) => JSX.Element;
